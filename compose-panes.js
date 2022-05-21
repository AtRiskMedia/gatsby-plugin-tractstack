import React, { useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import animateScrollTo from "animated-scroll-to";
import { IsVisible } from "./is-visible.js";
import { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, InjectSvgShape, StyledWrapperDiv, InjectCssAnimation, getCurrentPane, thisViewportValue } from "./helpers";
import { SvgPane } from "./shapes";

function ComposePanes(data) {
  // if viewport is not yet defined, return empty fragment
  if (typeof data?.state?.viewport?.viewport?.key === "undefined") return /*#__PURE__*/React.createElement(React.Fragment, null); // is there a current pane to scroll to?

  let visiblePane = getCurrentPane(data?.state?.viewport?.currentPane, data?.state?.viewport?.panes);

  if (visiblePane) {
    let ref = document.getElementById(visiblePane);
    if (ref) animateScrollTo(ref);
  } // loop through the panes in view and render each pane fragment


  const composedPanes = data?.fragments?.relationships?.field_panes.map((pane, i) => {
    let css = "",
        imageMaskShapes = {},
        textShapeOutsides = {}; // check for background colour

    let background_colour = pane?.relationships?.field_pane_fragments.filter(e => e?.internal?.type === "paragraph__background_colour"); // compose this pane

    let this_selector, shape;
    let pane_height = thisViewportValue(data?.state?.viewport?.viewport?.key, {
      mobile: `calc((100vw - (var(--offset) * 1px)) * ${pane?.field_height_ratio_mobile} / 100)`,
      tablet: `calc((100vw - (var(--offset) * 1px)) * ${pane?.field_height_ratio_tablet} / 100)`,
      desktop: `calc((100vw - (var(--offset) * 1px)) * ${pane?.field_height_ratio_desktop} / 100)`
    });
    let height_offset = thisViewportValue(data?.state?.viewport?.viewport?.key, {
      mobile: `calc((100vw - (var(--offset) * 1px)) / 600 * ${pane?.field_height_offset_mobile})`,
      tablet: `calc((100vw - (var(--offset) * 1px)) / 1080 * ${pane?.field_height_offset_tablet})`,
      desktop: `calc((100vw - (var(--offset) * 1px)) / 1920 * ${pane?.field_height_offset_desktop})`
    }); // generate imageMaskShape(s)

    imageMaskShapes = pane?.relationships?.field_pane_fragments.map(e => {
      let imageMaskShapeSelector;
      let this_pane = thisViewportValue(data?.state?.viewport?.viewport?.key, {
        mobile: e?.field_image_mask_shape_mobile,
        tablet: e?.field_image_mask_shape_tablet,
        desktop: e?.field_image_mask_shape_desktop
      });

      if (typeof this_pane === "string" && this_pane !== "none") {
        shape = SvgPane(this_pane, data?.state?.viewport?.viewport?.key);

        switch (e?.internal?.type) {
          case "paragraph__background_video":
            imageMaskShapeSelector = ".paneFragmentVideo";
            break;

          case "paragraph__background_image":
            imageMaskShapeSelector = ".paneFragmentImage";
            break;

          case "paragraph__svg":
            imageMaskShapeSelector = ".paneFragmentSvg";
            break;

          case "paragraph__markdown":
            imageMaskShapeSelector = ".paneFragmentParagraph";
            break;

          default:
            console.log("compose-panes.js > imageMaskShapes: miss on", e?.internal?.type);
        }
      }

      if (typeof shape === "undefined") return null;
      return {
        selector: imageMaskShapeSelector,
        shape: shape,
        paneFragment: e?.id
      };
    }).filter(Boolean); // now compose the paneFragments for this pane

    let composedPaneFragments = pane?.relationships?.field_pane_fragments // skip if current viewport is listed in field_hidden_viewports
    .filter(e => e.field_hidden_viewports.replace(/\s+/g, "").split(",").indexOf(data?.state?.viewport?.viewport?.key) == -1) // already processed background_colour
    .filter(e => e?.internal?.type !== "paragraph__background_colour") // sort by zIndex ***important
    .sort((a, b) => a?.field_zindex > b?.field_zindex ? 1 : -1).map((pane_fragment, index) => {
      let react_fragment,
          tractStackFragment,
          shape,
          maskData,
          buttonData,
          imageData = [],
          css_child,
          css_parent; // select css for viewport

      css_child = thisViewportValue(data?.state?.viewport?.viewport?.key, {
        mobile: pane_fragment?.field_css_styles_mobile || "",
        tablet: pane_fragment?.field_css_styles_tablet || "",
        desktop: pane_fragment?.field_css_styles_desktop || ""
      });
      css_parent = thisViewportValue(data?.state?.viewport?.viewport?.key, {
        mobile: pane_fragment?.field_css_styles_parent_mobile || "",
        tablet: pane_fragment?.field_css_styles_parent_tablet || "",
        desktop: pane_fragment?.field_css_styles_parent_desktop || ""
      });
      if (pane_fragment?.internal?.type === "paragraph__background_pane") shape = thisViewportValue(data?.state?.viewport?.viewport?.key, {
        mobile: pane_fragment?.field_shape_mobile,
        tablet: pane_fragment?.field_shape_tablet,
        desktop: pane_fragment?.field_shape_desktop
      });
      let has_shape_outside = thisViewportValue(data?.state?.viewport?.viewport?.key, {
        mobile: pane_fragment?.field_text_shape_outside_mobile,
        tablet: pane_fragment?.field_text_shape_outside_tablet,
        desktop: pane_fragment?.field_text_shape_outside_desktop
      });

      if (has_shape_outside && has_shape_outside !== "none") {
        let textShapeOutside = SvgPane(has_shape_outside, data?.state?.viewport?.viewport?.key, "shape-outside");
        if (textShapeOutside) maskData = {
          textShapeOutside: textShapeOutside
        }; // store and inject into pane

        textShapeOutsides[Object.keys(textShapeOutsides).length] = {
          left: textShapeOutside?.left_mask,
          right: textShapeOutside?.right_mask
        };
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
          imageData.push(this_imageData);
        }
      }); // prepare structured data for this paneFragment

      tractStackFragment = {
        id: pane_fragment?.id,
        mode: pane_fragment?.internal?.type,
        viewport: {
          device: data?.state?.viewport?.viewport?.key,
          width: data?.state?.viewport?.viewport?.width
        },
        z_index: pane_fragment?.field_zindex,
        css: {
          parent: css_parent,
          child: css_child
        },
        payload: {
          imageData: imageData,
          maskData: maskData,
          hooksData: data?.hooks
        }
      }; // all source data for this paneFragment

      switch (tractStackFragment?.mode) {
        case "paragraph__markdown":
          let action;
          tractStackFragment.children = pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst;
          tractStackFragment.children.children = pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst?.children?.filter(e => !(e.type === "text" && e.value === "\n"));

          try {
            action = JSON.parse(pane_fragment?.field_options);
            if (typeof action?.buttons === "object") tractStackFragment.payload.buttonData = action?.buttons;
          } catch (e) {
            if (e instanceof SyntaxError) {
              console.log("ERROR parsing json in {}: ", e);
            }
          }

          react_fragment = MarkdownParagraph(tractStackFragment);
          break;

        case "paragraph__background_pane":
          let child = SvgPane(shape, data?.state?.viewport?.viewport?.key);
          tractStackFragment.children = child;
          react_fragment = InjectSvgShape(tractStackFragment);
          break;

        case "paragraph__background_video":
          tractStackFragment.payload.videoData = {
            url: pane_fragment?.field_cdn_url,
            alt_text: pane_fragment?.field_alt_text
          };
          react_fragment = InjectGatsbyBackgroundVideo(tractStackFragment);
          break;

        case "paragraph__background_image":
          react_fragment = InjectGatsbyBackgroundImage(tractStackFragment);
          break;

        case "paragraph__svg":
          tractStackFragment.payload.imageData = [{
            url: pane_fragment?.relationships?.field_svg_file?.localFile?.publicURL,
            alt_text: pane_fragment?.field_svg_file?.description
          }];
          react_fragment = InjectSvg(tractStackFragment);
          break;

        case "paragraph__d3":
          //
          break;

        case "paragraph__h5p":
          //
          break;
      }

      let thisClass = `paneFragment paneFragment__view--${data?.state?.viewport?.viewport?.key}`;
      return /*#__PURE__*/React.createElement("div", {
        className: thisClass,
        key: pane_fragment?.id
      }, /*#__PURE__*/React.createElement(IsVisible, {
        id: pane_fragment?.id,
        className: "paneFragment",
        key: pane_fragment?.id
      }, react_fragment));
    }); // skip if empty pane

    if (Object.keys(composedPaneFragments).length === 0) return; // prepare css for pane

    css = `${css} height: ${pane_height}; margin-bottom: ${height_offset};`;
    if (background_colour.length) css = `${css} background-color: ${background_colour[0].field_background_colour};`; // inject imageMaskShape(s) (if available)

    if (Object.keys(imageMaskShapes).length) imageMaskShapes.map(e => {
      if (typeof e?.shape === "object") {
        let svgString = renderToStaticMarkup(e?.shape);
        let b64 = window.btoa(svgString);
        let dataUri = `data:image/svg+xml;base64,${b64}`;
        css = `${css} ${e?.selector} {-webkit-mask-image: url("${dataUri}"); mask-image: url("${dataUri}");` + ` mask-repeat: no-repeat; -webkit-mask-size: 100% AUTO; mask-size: 100% AUTO; }`;
      }
    }); // inject textShapeOutside(s) (if available)

    if (Object.keys(textShapeOutsides).length) Object.keys(textShapeOutsides).map(i => {
      css = `${css} .paneFragmentParagraph { .svg-shape-outside-left {float:left;shape-outside:url(${textShapeOutsides[i]?.left})} .svg-shape-outside-right {float:right;shape-outside:url(${textShapeOutsides[i]?.right})} }`;
    }); // may we wrap this in animation?

    let effects_payload = {};

    if (data?.state?.prefersReducedMotion?.prefersReducedMotion === false) {
      let effects = data?.state?.controller?.payload?.effects;
      let effects_payload;

      for (const key in effects) {
        if (effects[key]?.pane === pane?.id) {
          effects_payload = {
            in: [effects[key]?.function, effects[key]?.speed, effects[key]?.delay]
          };
          let this_effects_css = InjectCssAnimation(effects_payload, effects[key]?.paneFragment);
          css = css + this_effects_css;
        }
      }
    }

    return /*#__PURE__*/React.createElement("section", {
      key: pane?.id
    }, /*#__PURE__*/React.createElement(IsVisible, {
      id: pane?.id,
      hooks: data?.hooks
    }, /*#__PURE__*/React.createElement(StyledWrapperDiv, {
      className: `pane pane__view pane__view--${data?.state?.viewport?.viewport?.key}`,
      css: css
    }, composedPaneFragments)));
  }); // this is the storyFragment

  return composedPanes;
}

export { ComposePanes };
//# sourceMappingURL=compose-panes.js.map