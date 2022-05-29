import React, { useRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import animateScrollTo from "animated-scroll-to";
import { IsVisible } from "./is-visible.js";
import { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, InjectSvgShape, InjectSvgModal, StyledWrapperDiv, InjectCssAnimation, getCurrentPane, thisViewportValue } from "./helpers";
import { SvgPane, SvgModal, SvgModals } from "./shapes";

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
        textShapeOutside = {},
        modals = {},
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
    }); // now compose the paneFragments for this pane

    let composedPaneFragments = [];
    pane?.relationships?.field_pane_fragments // skip if current viewport is listed in field_hidden_viewports
    .filter(e => e.field_hidden_viewports.replace(/\s+/g, "").split(",").indexOf(data?.state?.viewport?.viewport?.key) == -1) // already processed background_colour
    .filter(e => e?.internal?.type !== "paragraph__background_colour") // sort by zIndex ***important
    .sort((a, b) => a?.field_zindex > b?.field_zindex ? 1 : -1).map((pane_fragment, index) => {
      let react_fragment,
          tractStackFragment,
          payload = {},
          tempValue,
          shape;
      payload.imageData = []; // pre-pass paneFragment based on type

      switch (pane_fragment?.internal?.type) {
        case "paragraph__markdown":
          shape = thisViewportValue(data?.state?.viewport?.viewport?.key, {
            mobile: pane_fragment?.field_text_shape_outside_mobile,
            tablet: pane_fragment?.field_text_shape_outside_tablet,
            desktop: pane_fragment?.field_text_shape_outside_desktop
          });

          if (!pane_fragment?.field_modal) {
            // add shape outside if any
            if (shape && shape !== "none") {
              let tempValue = SvgPane(shape, data?.state?.viewport?.viewport?.key, "shape-outside");
              if (tempValue) payload.maskData = {
                textShapeOutside: tempValue
              }; // store shapeOutside to inject into pane

              textShapeOutside[pane_fragment?.id] = {
                id: tempValue?.id,
                left_mask: tempValue?.left_mask,
                right_mask: tempValue?.right_mask
              };
            } else if (pane_fragment?.field_modal) {
              // this is a modal
              tempValue = thisViewportValue(data?.state?.viewport?.viewport?.key, {
                mobile: pane_fragment?.field_render_mobile,
                tablet: pane_fragment?.field_render_tablet,
                desktop: pane_fragment?.field_render_desktop
              });

              if (tempValue) {
                let this_options, this_payload, this_fragment, this_shape, this_css, this_viewport;

                try {
                  this_options = JSON.parse(tempValue);

                  if (typeof this_options?.render === "object") {
                    this_payload = this_options?.render;
                    this_payload.id = pane_fragment?.id;
                    this_viewport = {
                      device: data?.state?.viewport?.viewport?.key,
                      width: data?.state?.viewport?.viewport?.width
                    };
                    this_payload.viewport = this_viewport;
                    this_payload.cut = SvgModals[pane_fragment?.field_modal_shape]["cut"];
                    this_payload.width = SvgModals[pane_fragment?.field_modal_shape]["viewBox"][0];
                    this_payload.height = SvgModals[pane_fragment?.field_modal_shape]["viewBox"][1];
                    this_payload.pane_height = pane_height;
                    this_payload.z_index = pane_fragment?.field_zindex;
                    this_shape = SvgModal(pane_fragment?.field_modal_shape, this_payload);
                    this_fragment = InjectSvgModal(this_shape?.modal_shape, this_payload);
                    this_css = thisViewportValue(data?.state?.viewport?.viewport?.key, {
                      mobile: pane_fragment?.field_css_styles_parent_mobile,
                      tablet: pane_fragment?.field_css_styles_parent_tablet,
                      desktop: pane_fragment?.field_css_styles_parent_desktop
                    }); // add modal to inject in pane later

                    modals[Object.keys(modals).length] = {
                      id: pane_fragment?.id,
                      fragment: this_fragment,
                      z_index: pane_fragment?.field_zindex,
                      css: {
                        parent: this_css
                      },
                      payload: {
                        modalData: {
                          render: this_options?.render,
                          shape: this_shape
                        }
                      }
                    };
                  } // store shapeOutside to inject into pane


                  textShapeOutside[pane_fragment?.id] = this_shape;
                  payload.maskData = {
                    textShapeOutside: this_shape
                  };
                } catch (e) {
                  if (e instanceof SyntaxError) {
                    console.log("ERROR parsing json in {}: ", e);
                  }
                }
              }
            }
          }

          break;

        case "paragraph__modal":
          tempValue = thisViewportValue(data?.state?.viewport?.viewport?.key, {
            mobile: pane_fragment?.field_render_mobile,
            tablet: pane_fragment?.field_render_tablet,
            desktop: pane_fragment?.field_render_desktop
          });

          if (tempValue) {
            let this_options, this_payload, this_fragment, this_shape, this_css, this_viewport;

            try {
              this_options = JSON.parse(tempValue);

              if (typeof this_options?.render === "object") {
                this_payload = this_options?.render;
                this_payload.id = pane_fragment?.id;
                this_viewport = {
                  device: data?.state?.viewport?.viewport?.key,
                  width: data?.state?.viewport?.viewport?.width
                };
                this_payload.viewport = this_viewport;
                this_payload.cut = SvgModals[pane_fragment?.field_modal_shape]["cut"];
                this_payload.width = SvgModals[pane_fragment?.field_modal_shape]["viewBox"][0];
                this_payload.height = SvgModals[pane_fragment?.field_modal_shape]["viewBox"][1];
                this_payload.pane_height = pane_height;
                this_payload.z_index = pane_fragment?.field_zindex;
                this_shape = SvgModal(pane_fragment?.field_modal_shape, this_payload);
                this_fragment = InjectSvgModal(this_shape?.modal_shape, this_payload);
                this_css = thisViewportValue(data?.state?.viewport?.viewport?.key, {
                  mobile: pane_fragment?.field_css_styles_parent_mobile,
                  tablet: pane_fragment?.field_css_styles_parent_tablet,
                  desktop: pane_fragment?.field_css_styles_parent_desktop
                }); // add modal to inject in pane later

                modals[Object.keys(modals).length] = {
                  id: pane_fragment?.id,
                  fragment: this_fragment,
                  z_index: pane_fragment?.field_zindex,
                  css: {
                    parent: this_css
                  },
                  payload: {
                    modalData: {
                      render: this_options?.render,
                      shape: this_shape
                    }
                  }
                };
              } // store shapeOutside to inject into pane


              textShapeOutside[pane_fragment?.id] = this_shape;
              payload.maskData = {
                textShapeOutside: this_shape
              };
            } catch (e) {
              if (e instanceof SyntaxError) {
                console.log("ERROR parsing json in {}: ", e);
              }
            }
          }

        case "paragraph__background_pane":
          shape = thisViewportValue(data?.state?.viewport?.viewport?.key, {
            mobile: pane_fragment?.field_shape_mobile,
            tablet: pane_fragment?.field_shape_tablet,
            desktop: pane_fragment?.field_shape_desktop
          });
          tempValue = SvgPane(shape, data?.state?.viewport?.viewport?.key);
          if (tempValue) payload.shapeData = tempValue;
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
      } // prepare any markdown for this paneFragment


      if (pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst) {
        payload.children = pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst;
        payload.children.children = pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst?.children?.filter(e => !(e.type === "text" && e.value === "\n"));
      } // extract animation effects and buttonData (if any)


      if (typeof pane_fragment?.field_options === "string") {
        let action;

        try {
          action = JSON.parse(pane_fragment?.field_options);
          if (typeof tempValue?.buttons === "object") payload.buttonData = tempValue?.buttons; // effects are directly injected into each pane below

          if (typeof action?.effects === "object") {
            for (const key in action?.effects) {
              // store animation
              effects[`fragment-${pane_fragment?.id}`] = action?.effects[key];
              effects[`fragment-${pane_fragment?.id}`]["paneFragment"] = `fragment-${pane_fragment?.id}`;
              effects[`fragment-${pane_fragment?.id}`]["pane"] = pane?.id; // clone and store animation for modal (if any)

              if (pane_fragment?.internal?.type === "paragraph__modal") {
                effects[`modal-${pane_fragment?.id}`] = structuredClone(action?.effects[key]);
                effects[`modal-${pane_fragment?.id}`]["paneFragment"] = `modal-${pane_fragment?.id}`;
              }
            }
          }
        } catch (e) {
          if (e instanceof SyntaxError) {
            console.log("ERROR parsing json in compose-panes.js: ", e);
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
          modalData: payload?.modalData || {}
        }
      }; // generate react for this paneFragment

      switch (tractStackFragment?.mode) {
        case "paragraph__markdown":
        case "paragraph__modal":
          react_fragment = MarkdownParagraph(tractStackFragment);
          break;

        case "paragraph__background_pane":
          react_fragment = InjectSvgShape(tractStackFragment);
          break;

        case "paragraph__background_image":
          react_fragment = InjectGatsbyBackgroundImage(tractStackFragment);
          break;

        case "paragraph__background_video":
          react_fragment = InjectGatsbyBackgroundVideo(tractStackFragment);
          break;

        case "paragraph__svg":
          react_fragment = InjectSvg(tractStackFragment);
          break;

        case "paragraph__d3":
          //
          break;

        case "paragraph__h5p":
          //
          break;

        default:
          console.log("MISS on compose-panes.js:", tractStackFragment?.mode);
      } // inject modal(s) if any


      if (Object.keys(modals).length) Object.keys(modals).filter(i => modals[i]?.id === pane_fragment?.id).map(i => {
        let this_modal = modals[i]; // add this modal to composedPaneFragments

        composedPaneFragments.push( /*#__PURE__*/React.createElement("div", {
          className: `paneFragment paneFragment__view paneFragment__view--${data?.state?.viewport?.viewport?.key}`,
          key: `modal-${this_modal?.id}`
        }, /*#__PURE__*/React.createElement(IsVisible, {
          id: `modal-${this_modal?.id}`,
          className: "paneFragment",
          key: `${this_modal?.id}-visible`
        }, this_modal?.fragment)));
      }); // add the composed pane fragment

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
    // prepare css for pane

    css = `${css} height: ${pane_height_css}; margin-bottom: ${height_offset};`;
    if (background_colour.length) css = `${css} background-color: ${background_colour[0].field_background_colour};`; // inject imageMaskShape(s) (if any)

    let imageMaskShapes = pane?.relationships?.field_pane_fragments.map(e => {
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
    }).filter(Boolean);
    if (Object.keys(imageMaskShapes).length) imageMaskShapes.map(e => {
      if (typeof e?.shape === "object") {
        let svgString = renderToStaticMarkup(e?.shape);
        let b64 = window.btoa(svgString);
        let dataUri = `data:image/svg+xml;base64,${b64}`;
        css = `${css} ${e?.selector} {-webkit-mask-image: url("${dataUri}"); mask-image: url("${dataUri}");` + ` mask-repeat: no-repeat; -webkit-mask-size: 100% AUTO; mask-size: 100% AUTO; }`;
      }
    }); // inject textShapeOutside(s) (if any)

    Object.entries(textShapeOutside).forEach(([key, value]) => {
      css = `${css} #svg__${value?.id}--shape-outside-left {float:left;shape-outside:url(${value?.left_mask})} ` + `#svg__${value?.id}--shape-outside-right {float:right;shape-outside:url(${value?.right_mask})}`;
    }); // add this css for modal (if any)

    if (Object.keys(modals).length) Object.keys(modals).map(i => {
      let this_modal = modals[i];
      css = `${css} ${this_modal?.css?.parent} ` + `#fragment-${this_modal?.id} svg.svg-shape-outside-left { ` + `z-index: ${this_modal?.z_index - 1};` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_modal?.payload?.modalData?.render?.viewport?.width} * ${this_modal?.payload?.modalData?.render?.padding_left + this_modal?.payload?.modalData?.render?.cut}); ` + `} ` + `#fragment-${this_modal?.id} svg.svg-shape-outside-right { ` + `z-index: ${this_modal?.z_index - 1};` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_modal?.payload?.modalData?.render?.viewport?.width} * ${this_modal?.payload?.modalData?.render?.viewport?.width - this_modal?.payload?.modalData?.render?.width + this_modal?.payload?.modalData?.render?.cut - this_modal?.payload?.modalData?.render?.padding_left}); ` + `} ` + `#${this_modal?.id}-svg-modal svg { ` + `z-index: ${this_modal?.z_index - 1}; ` + `width: calc((100vw - (var(--offset) * 1px)) / ${this_modal?.payload?.modalData?.render?.viewport?.width} * ${this_modal?.payload?.modalData?.render?.width}); ` + `margin-left: calc((100vw - (var(--offset) * 1px)) / ${this_modal?.payload?.modalData?.render?.viewport?.width} * ${this_modal?.payload?.modalData?.render?.padding_left}); ` + `margin-top: calc((100vw - (var(--offset) * 1px)) / ${this_modal?.payload?.modalData?.render?.viewport?.width} * ${this_modal?.payload?.modalData?.render?.padding_top}); ` + `}`;
    }); // may we wrap this in animation?

    if (data?.state?.prefersReducedMotion?.prefersReducedMotion === false) {
      for (const key in effects) {
        if (effects[key]?.pane === pane?.id) {
          let this_effects_payload = {
            in: [effects[key]?.function, effects[key]?.speed, effects[key]?.delay]
          };
          let this_effects_css = InjectCssAnimation(this_effects_payload, effects[key]?.paneFragment);
          css = `${css} ${this_effects_css} `;
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
//# sourceMappingURL=x.js.map