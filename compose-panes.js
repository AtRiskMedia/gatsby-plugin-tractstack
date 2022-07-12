import React, { useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useInView } from "react-cool-inview";
import { InjectPaneFragment, InjectSvgModal, StyledWrapperDiv, InjectCssAnimation, HasImageMask, HasPaneFragmentType, thisViewportValue, viewportWidth } from "./helpers";
import { SvgModals, SvgShape } from "./shapes";

const ComposePanes = data => {
  // if viewport is not yet defined, return empty fragment
  if (data?.viewportKey === "none") return /*#__PURE__*/React.createElement(React.Fragment, null); // loop through the panes in view and render each pane fragment

  const composedPanes = data?.fragments?.relationships?.field_panes.map((pane, i) => {
    return /*#__PURE__*/React.createElement(ComposedPane, {
      key: i,
      data: {
        pane: pane,
        viewportKey: data?.viewportKey,
        prefersReducedMotion: data?.prefersReducedMotion,
        payload: data?.payload,
        useHookEndPoint: data?.useHookEndPoint
      }
    });
  }); // this is the storyFragment

  if (typeof composedPanes === "undefined") return /*#__PURE__*/React.createElement(React.Fragment, null);
  return composedPanes;
};

const ComposedPane = data => {
  // set key variables
  const pane = data?.data?.pane;
  const viewportKey = data?.data?.viewportKey;
  const prefersReducedMotion = data?.data?.prefersReducedMotion;
  const payload = data?.data?.payload?.payload;
  const useHookEndPoint = data?.data?.useHookEndPoint; // useInView hook

  const {
    observe,
    inView
  } = useInView({
    onEnter: ({}) => {
      useHookEndPoint("hookPaneVisible", pane?.id);
    },
    onLeave: ({}) => {
      useHookEndPoint("hookPaneHidden", pane?.id);
    }
  });
  let pane_css = "",
      effects = {};
  let background_colour = pane?.relationships?.field_pane_fragments.filter(e => e?.internal?.type === "paragraph__background_colour");
  let this_selector, shape;
  let pane_height_ratio = thisViewportValue(viewportKey, {
    mobile: pane?.field_height_ratio_mobile,
    tablet: pane?.field_height_ratio_tablet,
    desktop: pane?.field_height_ratio_desktop
  });
  let pane_height = thisViewportValue(viewportKey, {
    mobile: 600 * pane_height_ratio / 100,
    tablet: 1080 * pane_height_ratio / 100,
    desktop: 1920 * pane_height_ratio / 100
  });
  let pane_height_css = `calc((100vw - (var(--offset) * 1px)) * ${pane_height_ratio} / 100)`;
  let height_offset = thisViewportValue(viewportKey, {
    mobile: `calc((100vw - (var(--offset) * 1px)) / 600 * ${pane?.field_height_offset_mobile})`,
    tablet: `calc((100vw - (var(--offset) * 1px)) / 1080 * ${pane?.field_height_offset_tablet})`,
    desktop: `calc((100vw - (var(--offset) * 1px)) / 1920 * ${pane?.field_height_offset_desktop})`
  }); // prepare css for pane

  pane_css = `${pane_css} height: ${pane_height_css}; margin-bottom: ${height_offset};`;
  if (background_colour.length) pane_css = `${pane_css} background-color: ${background_colour[0].field_background_colour};`; // now compose the paneFragments for this pane

  let composedPaneFragments = [];
  pane?.relationships?.field_pane_fragments // skip if current viewport is listed in field_hidden_viewports
  .filter(e => typeof e?.field_hidden_viewports === "string" && e?.field_hidden_viewports.replace(/\s+/g, "").split(",").indexOf(viewportKey) == -1) // already processed background_colour
  .filter(e => e?.internal?.type !== "paragraph__background_colour") // sort by zIndex ***important
  .sort((a, b) => a?.field_zindex > b?.field_zindex ? 1 : -1).map((pane_fragment, index) => {
    let react_fragment,
        tractStackFragment,
        this_payload = {},
        tempValue,
        shape;
    this_payload.imageData = []; // check for textShapeOutside

    shape = thisViewportValue(viewportKey, {
      mobile: pane_fragment?.field_text_shape_outside_mobile,
      tablet: pane_fragment?.field_text_shape_outside_tablet,
      desktop: pane_fragment?.field_text_shape_outside_desktop
    }); // check for imageMasks

    shape = thisViewportValue(viewportKey, {
      mobile: pane_fragment?.field_image_mask_shape_mobile,
      tablet: pane_fragment?.field_image_mask_shape_tablet,
      desktop: pane_fragment?.field_image_mask_shape_desktop
    });

    if (typeof shape === "string" && shape !== "none") {
      let this_options = {
        viewportKey: viewportKey,
        pane_height: pane_height,
        id: `${pane_fragment?.id}-${viewportKey}`
      };
      let tempValue = SvgShape(shape, this_options);
      if (tempValue) shape = tempValue.shape;
      let imageMaskShapeSelector = HasImageMask[pane_fragment?.internal?.type];

      if (imageMaskShapeSelector) {
        let svgString = renderToStaticMarkup(shape);
        let b64 = window.btoa(svgString);
        let dataUri = `data:image/svg+xml;base64,${b64}`;
        pane_css = `${pane_css} ${imageMaskShapeSelector} {-webkit-mask-image: url("${dataUri}"); mask-image: url("${dataUri}");` + ` mask-repeat: no-repeat; -webkit-mask-size: 100% AUTO; mask-size: 100% AUTO; }`;
      }
    } // pre-pass paneFragment based on type


    switch (pane_fragment?.internal?.type) {
      case "paragraph__markdown":
        // prepare any markdown for this paneFragment
        if (pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst) {
          this_payload.children = pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst;
          this_payload.children.children = pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst?.children?.filter(e => !(e.type === "text" && e.value === "\n"));
        }

        shape = thisViewportValue(viewportKey, {
          mobile: pane_fragment?.field_text_shape_outside_mobile,
          tablet: pane_fragment?.field_text_shape_outside_tablet,
          desktop: pane_fragment?.field_text_shape_outside_desktop
        });

        if (shape && !pane_fragment?.field_modal) {
          // regular markdown paragraph; add shape outside if any
          if (shape && shape !== "none") {
            let this_options = {
              textShapeOutside: true,
              viewportKey: viewportKey,
              pane_height: pane_height,
              id: `${pane_fragment?.id}-${viewportKey}`
            };
            tempValue = SvgShape(shape, this_options);
            if (tempValue) this_payload.maskData = {
              textShapeOutside: tempValue
            };
            pane_css = `${pane_css} #svg__${tempValue?.id}--shape-outside-left {float:left;shape-outside:url(${tempValue?.left_mask})} ` + `#svg__${tempValue?.id}--shape-outside-right {float:right;shape-outside:url(${tempValue?.right_mask})}`;
          }
        } else if (shape && pane_fragment?.field_modal) {
          // this is a modal
          let options = payload?.modal && payload?.modal[pane?.id][pane_fragment?.id][viewportKey],
              this_modal_payload = {},
              this_fragment,
              this_shape,
              this_css,
              this_viewport;

          if (options && Object.keys(options).length !== 0) {
            this_modal_payload = {
              id: `${pane_fragment?.id}-${viewportKey}`,
              mode: "modal",
              textShapeOutside: true,
              viewportKey: viewportKey,
              cut: SvgModals[shape]["cut"],
              width: SvgModals[shape]["viewBox"][0],
              height: SvgModals[shape]["viewBox"][1],
              pane_height: pane_height,
              z_index: pane_fragment?.field_zindex,
              ...options
            };
            this_shape = SvgShape(shape, this_modal_payload); // generate react fragment

            this_fragment = InjectSvgModal(this_shape?.shape, this_modal_payload);
            this_modal_payload.shape = this_shape;
            this_css = thisViewportValue(viewportKey, {
              mobile: pane_fragment?.field_css_styles_parent_mobile,
              tablet: pane_fragment?.field_css_styles_parent_tablet,
              desktop: pane_fragment?.field_css_styles_parent_desktop
            });
            let this_width = viewportWidth[viewportKey];
            pane_css = `${pane_css} ${this_css} ` + `#fragment-${pane_fragment?.id} svg.svg-shape-outside-left { ` + `z-index: ${pane_fragment?.z_index - 1};` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${this_modal_payload?.padding_left + this_modal_payload?.cut}); ` + `} ` + `#fragment-${pane_fragment?.id} svg.svg-shape-outside-right { ` + `z-index: ${pane_fragment?.z_index - 1};` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${this_width - this_modal_payload?.width + this_modal_payload?.cut - this_modal_payload?.padding_left}); ` + `} ` + `#${pane_fragment?.id}-svg-modal svg { ` + `z-index: ${pane_fragment?.z_index - 1}; ` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${this_modal_payload?.width}); ` + `margin-left: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${this_modal_payload?.padding_left}); ` + `margin-top: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${this_modal_payload?.padding_top}); ` + `}`;
          }

          this_payload.maskData = {
            textShapeOutside: this_shape
          };
          pane_css = `${pane_css} #svg__${this_shape?.id}--shape-outside-left {float:left;shape-outside:url(${this_shape?.left_mask})} ` + `#svg__${this_shape?.id}--shape-outside-right {float:right;shape-outside:url(${this_shape?.right_mask})}`;
          let thisClass = `paneFragment paneFragment__view paneFragment__view--${viewportKey}`; // add modal shape to stack

          composedPaneFragments.push( /*#__PURE__*/React.createElement("div", {
            className: thisClass,
            key: `modal-${pane_fragment?.id}`
          }, /*#__PURE__*/React.createElement("div", {
            id: `modal-${pane_fragment?.id}`,
            className: inView ? "paneFragment visible" : "paneFragment hidden",
            key: `modal-${pane_fragment?.id}`
          }, this_fragment)));
        }

        break;

      case "paragraph__background_pane":
        shape = thisViewportValue(viewportKey, {
          mobile: pane_fragment?.field_shape_mobile,
          tablet: pane_fragment?.field_shape_tablet,
          desktop: pane_fragment?.field_shape_desktop
        });
        let this_options = {
          viewportKey: viewportKey,
          pane_height: pane_height,
          id: `${pane_fragment?.id}-${viewportKey}`
        };
        tempValue = SvgShape(shape, this_options);
        if (tempValue) this_payload.shapeData = tempValue.shape;
        break;

      case "paragraph__background_video":
        if (prefersReducedMotion?.prefersReducedMotion === false) {
          this_payload.videoData = {
            url: pane_fragment?.field_cdn_url,
            alt_text: pane_fragment?.field_alt_text
          };
        }

        break;

      case "paragraph__svg":
        this_payload.imageData = [{
          url: pane_fragment?.relationships?.field_svg_file?.localFile?.publicURL,
          alt_text: pane_fragment?.field_svg_file?.description
        }];
        break;
    } // extract buttonData (if any)


    if (payload?.buttons && payload?.buttons[pane?.id] && payload?.buttons[pane?.id][pane_fragment?.id]) this_payload.buttonData = payload?.buttons[pane?.id][pane_fragment?.id]; // extract animation effects (if any)

    if (payload?.effects && payload?.effects[pane?.id] && payload?.effects[pane?.id][pane_fragment?.id]) tempValue = payload?.effects[pane?.id][pane_fragment?.id];

    if (tempValue && Object.keys(tempValue).length) {
      for (const key in tempValue) {
        // store animation
        effects[`fragment-${pane_fragment?.id}`] = {
          pane: pane?.id,
          paneFragment: `fragment-${pane_fragment?.id}`,
          ...tempValue[key]
        }; // clone and store animation for modal (if any)

        if (pane_fragment?.internal?.type === "paragraph__modal" || pane_fragment?.field_modal) {
          effects[`modal-${pane_fragment?.id}`] = structuredClone(tempValue[key]);
          effects[`modal-${pane_fragment?.id}`]["paneFragment"] = `modal-${pane_fragment?.id}`;
        }
      }
    } // prepare any images from this paneFragment


    pane_fragment?.relationships?.field_image?.map(e => {
      let this_image = thisViewportValue(viewportKey, {
        mobile: e?.mobile,
        tablet: e?.tablet,
        desktop: e?.desktop
      });

      if (this_image) {
        let this_imageData = {
          id: e?.id,
          filename: e?.filename,
          data: this_image,
          backgroundPosition: pane_fragment?.field_background_position || null
        };
        if (typeof pane_fragment?.field_alt_text === "string") this_imageData.alt_text = pane_fragment?.field_alt_text;
        this_payload.imageData.push(this_imageData);
      }
    }); // select css for viewport

    this_payload.css_child = thisViewportValue(viewportKey, {
      mobile: pane_fragment?.field_css_styles_mobile || "",
      tablet: pane_fragment?.field_css_styles_tablet || "",
      desktop: pane_fragment?.field_css_styles_desktop || ""
    });
    this_payload.css_parent = thisViewportValue(viewportKey, {
      mobile: pane_fragment?.field_css_styles_parent_mobile || "",
      tablet: pane_fragment?.field_css_styles_parent_tablet || "",
      desktop: pane_fragment?.field_css_styles_parent_desktop || ""
    }); // prepare structured data for this paneFragment

    tractStackFragment = {
      id: pane_fragment?.id,
      mode: pane_fragment?.internal?.type,
      pane_height_css: pane_height_css,
      viewport: {
        device: viewportKey,
        width: viewportWidth[viewportKey]
      },
      z_index: pane_fragment?.field_zindex,
      children: this_payload?.children || {},
      css: {
        parent: this_payload?.css_parent || "",
        child: this_payload?.css_child || ""
      },
      payload: {
        imageData: this_payload?.imageData || [],
        maskData: this_payload?.maskData || {},
        useHookEndPoint: useHookEndPoint || {},
        videoData: this_payload?.videoData || {},
        shapeData: this_payload?.shapeData || {},
        modalData: this_payload?.modalData || {},
        buttonData: this_payload?.buttonData || {}
      }
    };
    let this_pane_fragment_type = HasPaneFragmentType[tractStackFragment?.mode];
    if (this_pane_fragment_type) react_fragment = InjectPaneFragment(tractStackFragment, this_pane_fragment_type);else console.log("ERROR in compose-panes.js: pane fragment type not found.");
    let thisClass = `paneFragment paneFragment__view paneFragment__view--${viewportKey}`;
    let renderedPaneFragment; // add the composed pane fragment

    composedPaneFragments.push( /*#__PURE__*/React.createElement("div", {
      className: thisClass,
      key: pane_fragment?.id
    }, /*#__PURE__*/React.createElement("div", {
      id: `fragment-${pane_fragment?.id}`,
      className: inView ? "paneFragment visible" : "paneFragment hidden",
      key: `fragment-${pane_fragment?.id}`
    }, react_fragment)));
  }); // skip if empty pane

  if (composedPaneFragments.length === 0) return; // may we wrap this in animation?

  if (prefersReducedMotion?.prefersReducedMotion === false) {
    for (const key in effects) {
      let this_effects_payload = {
        in: [effects[key]?.function, effects[key]?.speed, effects[key]?.delay]
      };
      let this_effects_css = InjectCssAnimation(this_effects_payload, effects[key]?.paneFragment);
      pane_css = `${pane_css} ${this_effects_css} `;
    }
  }

  return /*#__PURE__*/React.createElement("section", {
    key: pane?.id
  }, /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    ref: observe,
    className: `pane pane__view pane__view--${viewportKey}`,
    css: pane_css,
    id: pane?.id
  }, composedPaneFragments));
};

export { ComposePanes };
//# sourceMappingURL=compose-panes.js.map