import React, { useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import animateScrollTo from "animated-scroll-to";
import { IsVisible } from "./is-visible.js";
import { InjectPaneFragment, InjectSvgModal, StyledWrapperDiv, InjectCssAnimation, HasImageMask, HasPaneFragmentType, getCurrentPane, thisViewportValue } from "./helpers";
import { SvgModals, SvgShape } from "./shapes";

function ComposePanes(data) {
  // if viewport is not yet defined, return empty fragment
  if (typeof data?.state?.viewport?.viewport?.key === "undefined") return /*#__PURE__*/React.createElement(React.Fragment, null); // is there a current pane to scroll to?

  let visiblePane = getCurrentPane(data?.state?.viewport?.currentPane, data?.state?.viewport?.panes);

  if (visiblePane) {
    let ref = document.getElementById(visiblePane);
    if (ref) animateScrollTo(ref);
  } // loop through the panes in view and render each pane fragment


  const composedPanes = data?.fragments?.relationships?.field_panes.map((pane, i) => {
    let pane_css = "",
        effects = []; // set key variables

    let background_colour = pane?.relationships?.field_pane_fragments.filter(e => e?.internal?.type === "paragraph__background_colour");
    let this_selector, shape;
    let pane_height_ratio = thisViewportValue(data?.state?.viewport?.viewport?.key, {
      mobile: pane?.field_height_ratio_mobile,
      tablet: pane?.field_height_ratio_tablet,
      desktop: pane?.field_height_ratio_desktop
    });
    let pane_height = thisViewportValue(data?.state?.viewport?.viewport?.key, {
      mobile: 600 * pane_height_ratio / 100,
      tablet: 1080 * pane_height_ratio / 100,
      desktop: 1920 * pane_height_ratio / 100
    });
    let pane_height_css = `calc((100vw - (var(--offset) * 1px)) * ${pane_height_ratio} / 100)`;
    let height_offset = thisViewportValue(data?.state?.viewport?.viewport?.key, {
      mobile: `calc((100vw - (var(--offset) * 1px)) / 600 * ${pane?.field_height_offset_mobile})`,
      tablet: `calc((100vw - (var(--offset) * 1px)) / 1080 * ${pane?.field_height_offset_tablet})`,
      desktop: `calc((100vw - (var(--offset) * 1px)) / 1920 * ${pane?.field_height_offset_desktop})`
    }); // prepare css for pane

    pane_css = `${pane_css} height: ${pane_height_css}; margin-bottom: ${height_offset};`;
    if (background_colour.length) pane_css = `${pane_css} background-color: ${background_colour[0].field_background_colour};`; // now compose the paneFragments for this pane

    let composedPaneFragments = [];
    pane?.relationships?.field_pane_fragments // skip if current viewport is listed in field_hidden_viewports
    .filter(e => typeof e?.field_hidden_viewports === "string" && e?.field_hidden_viewports.replace(/\s+/g, "").split(",").indexOf(data?.state?.viewport?.viewport?.key) == -1) // already processed background_colour
    .filter(e => e?.internal?.type !== "paragraph__background_colour") // sort by zIndex ***important
    .sort((a, b) => a?.field_zindex > b?.field_zindex ? 1 : -1).map((pane_fragment, index) => {
      let react_fragment,
          tractStackFragment,
          payload = {},
          tempValue,
          shape;
      payload.imageData = []; // check for imageMasks

      shape = thisViewportValue(data?.state?.viewport?.viewport?.key, {
        mobile: pane_fragment?.field_image_mask_shape_mobile,
        tablet: pane_fragment?.field_image_mask_shape_tablet,
        desktop: pane_fragment?.field_image_mask_shape_desktop
      });

      if (typeof shape === "string" && shape !== "none") {
        let this_options = {
          viewport: data?.state?.viewport?.viewport,
          pane_height: pane_height
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
            payload.children = pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst;
            payload.children.children = pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst?.children?.filter(e => !(e.type === "text" && e.value === "\n"));
          }

          shape = thisViewportValue(data?.state?.viewport?.viewport?.key, {
            mobile: pane_fragment?.field_text_shape_outside_mobile,
            tablet: pane_fragment?.field_text_shape_outside_tablet,
            desktop: pane_fragment?.field_text_shape_outside_desktop
          });

          if (shape && !pane_fragment?.field_modal) {
            // regular markdown paragraph; add shape outside if any
            if (shape && shape !== "none") {
              let this_options = {
                textShapeOutside: true,
                viewport: data?.state?.viewport?.viewport,
                pane_height: pane_height
              };
              tempValue = SvgShape(shape, this_options);
              if (tempValue) payload.maskData = {
                textShapeOutside: tempValue
              };
              pane_css = `${pane_css} #svg__${tempValue?.id}--shape-outside-left {float:left;shape-outside:url(${tempValue?.left_mask})} ` + `#svg__${tempValue?.id}--shape-outside-right {float:right;shape-outside:url(${tempValue?.right_mask})}`;
            }
          } else if (shape && pane_fragment?.field_modal) {
            // this is a modal
            if (typeof pane_fragment?.field_options === "string") {
              let options = {},
                  this_payload = {},
                  this_fragment,
                  this_shape,
                  this_css,
                  this_viewport;

              try {
                options = JSON.parse(pane_fragment?.field_options);
              } catch (e) {
                if (e instanceof SyntaxError) {
                  console.log("ERROR parsing json in {}: ", e);
                }
              }

              if (typeof options?.render === "object") {
                this_payload = {
                  id: pane_fragment?.id,
                  mode: "modal",
                  textShapeOutside: true,
                  viewport: data?.state?.viewport?.viewport,
                  cut: SvgModals[shape]["cut"],
                  width: SvgModals[shape]["viewBox"][0],
                  height: SvgModals[shape]["viewBox"][1],
                  pane_height: pane_height,
                  z_index: pane_fragment?.field_zindex,
                  ...options?.render[data?.state?.viewport?.viewport?.key]
                };
                this_shape = SvgShape(shape, this_payload); // generate react fragment

                this_fragment = InjectSvgModal(this_shape?.shape, this_payload);
                this_payload.shape = this_shape;
                this_css = thisViewportValue(data?.state?.viewport?.viewport?.key, {
                  mobile: pane_fragment?.field_css_styles_parent_mobile,
                  tablet: pane_fragment?.field_css_styles_parent_tablet,
                  desktop: pane_fragment?.field_css_styles_parent_desktop
                });
                pane_css = `${pane_css} ${this_css} ` + `#fragment-${pane_fragment?.id} svg.svg-shape-outside-left { ` + `z-index: ${pane_fragment?.z_index - 1};` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_payload?.viewport?.width} * ${this_payload?.padding_left + this_payload?.cut}); ` + `} ` + `#fragment-${pane_fragment?.id} svg.svg-shape-outside-right { ` + `z-index: ${pane_fragment?.z_index - 1};` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_payload?.viewport?.width} * ${this_payload?.viewport?.width - this_payload?.width + this_payload?.cut - this_payload?.padding_left}); ` + `} ` + `#${pane_fragment?.id}-svg-modal svg { ` + `z-index: ${pane_fragment?.z_index - 1}; ` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_payload?.viewport?.width} * ${this_payload?.width}); ` + `margin-left: calc((100vw - (var(--offset) * 1px)) / ${this_payload?.viewport?.width} * ${this_payload?.padding_left}); ` + `margin-top: calc((100vw - (var(--offset) * 1px)) / ${this_payload?.viewport?.width} * ${this_payload?.padding_top}); ` + `}`;
              }

              payload.maskData = {
                textShapeOutside: this_shape
              };
              pane_css = `${pane_css} #svg__${this_shape?.id}--shape-outside-left {float:left;shape-outside:url(${this_shape?.left_mask})} ` + `#svg__${this_shape?.id}--shape-outside-right {float:right;shape-outside:url(${this_shape?.right_mask})}`; // add modal shape to stack

              composedPaneFragments.push( /*#__PURE__*/React.createElement("div", {
                className: `paneFragment paneFragment__view paneFragment__view--${data?.state?.viewport?.viewport?.key}`,
                key: `modal-${this_shape?.id}`
              }, /*#__PURE__*/React.createElement(IsVisible, {
                id: `modal-${this_shape?.id}`,
                className: "paneFragment",
                key: `${this_shape?.id}-visible`
              }, this_fragment)));
            }
          }

          break;

        case "paragraph__background_pane":
          shape = thisViewportValue(data?.state?.viewport?.viewport?.key, {
            mobile: pane_fragment?.field_shape_mobile,
            tablet: pane_fragment?.field_shape_tablet,
            desktop: pane_fragment?.field_shape_desktop
          });
          let this_options = {
            viewport: data?.state?.viewport?.viewport,
            pane_height: pane_height
          };
          tempValue = SvgShape(shape, this_options);
          if (tempValue) payload.shapeData = tempValue.shape;
          break;

        case "paragraph__background_video":
          payload.videoData = {
            url: pane_fragment?.field_cdn_url,
            alt_text: pane_fragment?.field_alt_text
          };
          break;

        case "paragraph__svg":
          payload.imageData = [{
            url: pane_fragment?.relationships?.field_svg_file?.localFile?.publicURL,
            alt_text: pane_fragment?.field_svg_file?.description
          }];
          break;
      } // extract animation effects and buttonData (if any)


      if (typeof pane_fragment?.field_options === "string") {
        try {
          tempValue = JSON.parse(pane_fragment?.field_options);
        } catch (e) {
          if (e instanceof SyntaxError) {
            console.log("ERROR parsing json in compose-panes.js: ", e);
          }
        }

        if (typeof tempValue?.buttons === "object") payload.buttonData = tempValue?.buttons; // effects are directly injected into each pane below

        if (typeof tempValue?.effects === "object") {
          for (const key in tempValue?.effects) {
            // store animation
            effects[`fragment-${pane_fragment?.id}`] = tempValue?.effects[key];
            effects[`fragment-${pane_fragment?.id}`]["paneFragment"] = `fragment-${pane_fragment?.id}`;
            effects[`fragment-${pane_fragment?.id}`]["pane"] = pane?.id; // clone and store animation for modal (if any)

            if (pane_fragment?.internal?.type === "paragraph__modal" || pane_fragment?.field_modal) {
              effects[`modal-${pane_fragment?.id}`] = structuredClone(tempValue?.effects[key]);
              effects[`modal-${pane_fragment?.id}`]["paneFragment"] = `modal-${pane_fragment?.id}`;
            }
          }
        }
      } // prepare any images from this paneFragment


      pane_fragment?.relationships?.field_image?.map(e => {
        let this_image = thisViewportValue(data?.state?.viewport?.viewport?.key, {
          mobile: e?.mobile,
          tablet: e?.tablet,
          desktop: e?.desktop
        });

        if (this_image) {
          let this_imageData = {
            id: e?.id,
            filename: e?.filename,
            data: this_image
          };
          if (typeof pane_fragment?.field_alt_text === "string") this_imageData.alt_text = pane_fragment?.field_alt_text;
          payload.imageData.push(this_imageData);
        }
      }); // select css for viewport

      payload.css_child = thisViewportValue(data?.state?.viewport?.viewport?.key, {
        mobile: pane_fragment?.field_css_styles_mobile || "",
        tablet: pane_fragment?.field_css_styles_tablet || "",
        desktop: pane_fragment?.field_css_styles_desktop || ""
      });
      payload.css_parent = thisViewportValue(data?.state?.viewport?.viewport?.key, {
        mobile: pane_fragment?.field_css_styles_parent_mobile || "",
        tablet: pane_fragment?.field_css_styles_parent_tablet || "",
        desktop: pane_fragment?.field_css_styles_parent_desktop || ""
      }); // prepare structured data for this paneFragment

      tractStackFragment = {
        id: pane_fragment?.id,
        mode: pane_fragment?.internal?.type,
        pane_height_css: pane_height_css,
        viewport: {
          device: data?.state?.viewport?.viewport?.key,
          width: data?.state?.viewport?.viewport?.width
        },
        z_index: pane_fragment?.field_zindex,
        children: payload?.children || {},
        css: {
          parent: payload?.css_parent || "",
          child: payload?.css_child || ""
        },
        payload: {
          imageData: payload?.imageData || [],
          maskData: payload?.maskData || {},
          hooksData: data?.hooks || {},
          videoData: payload?.videoData || {},
          shapeData: payload?.shapeData || {},
          modalData: payload?.modalData || {},
          buttonData: payload?.buttonData || {}
        }
      };
      let this_pane_fragment_type = HasPaneFragmentType[tractStackFragment?.mode];
      if (this_pane_fragment_type) react_fragment = InjectPaneFragment(tractStackFragment, this_pane_fragment_type);else console.log("ERROR in compose-panes.js: pane fragment type not found."); // add the composed pane fragment

      let thisClass = `paneFragment paneFragment__view paneFragment__view--${data?.state?.viewport?.viewport?.key}`;
      composedPaneFragments.push( /*#__PURE__*/React.createElement("div", {
        className: thisClass,
        key: pane_fragment?.id
      }, /*#__PURE__*/React.createElement(IsVisible, {
        id: `fragment-${pane_fragment?.id}`,
        className: "paneFragment",
        key: pane_fragment?.id
      }, react_fragment)));
    }); // skip if empty pane

    if (composedPaneFragments.length === 0) return; // now render the pane
    // may we wrap this in animation?

    if (data?.state?.prefersReducedMotion?.prefersReducedMotion === false) {
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
    }, /*#__PURE__*/React.createElement(IsVisible, {
      id: pane?.id,
      hooks: data?.hooks
    }, /*#__PURE__*/React.createElement(StyledWrapperDiv, {
      className: `pane pane__view pane__view--${data?.state?.viewport?.viewport?.key}`,
      css: pane_css
    }, composedPaneFragments)));
  }); // this is the storyFragment

  return composedPanes;
}

export { ComposePanes };
//# sourceMappingURL=compose-panes.js.map