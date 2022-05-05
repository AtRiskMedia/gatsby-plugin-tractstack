import React, { useRef } from "react";
import { IsVisible } from "./is-visible.js";
import animateScrollTo from "animated-scroll-to";
import {
  MarkdownParagraph,
  InjectGatsbyBackgroundImage,
  InjectGatsbyBackgroundVideo,
  InjectSvg,
  InjectSvgShape,
  StyledWrapperDiv,
  InjectCssAnimation,
  lispCallback,
  getVisiblePane,
} from "./helpers";

function ComposePanes(data) {
  console.log("ComposePanes", data?.state);
  // if viewport is not yet defined, return empty fragment
  if (typeof data?.state?.viewport?.viewport?.key === "undefined") return <></>;

  // is there a current pane to scroll to?
  let visiblePane = getVisiblePane(
    data?.state?.viewport?.lastVisiblePane,
    data?.state?.viewport?.panes
  );
  if (visiblePane) {
    let ref = document.getElementById(visiblePane);
    if (ref) animateScrollTo(ref);
  }

  // loop through the panes in view and render each pane fragment
  let css = "";
  const composedPanes = data?.fragments?.relationships?.field_panes.map(
    (pane, i) => {
      // check for background colour
      let background_colour = pane?.relationships?.field_pane_fragments.filter(
        (e) => e?.internal?.type === "paragraph__background_colour"
      );

      // now compose the paneFragments for this pane
      let composedPane = pane?.relationships?.field_pane_fragments
        // skip if current viewport is listed in field_hidden_viewports
        .filter(
          (e) =>
            e.field_hidden_viewports
              .replace(/\s+/g, "")
              .split(",")
              .indexOf(data?.state?.viewport?.viewport?.key) == -1
        )
        // already processed background_colour
        .filter((e) => e?.internal?.type !== "paragraph__background_colour")
        // sort by zIndex ***important
        .sort((a, b) => (a?.field_zindex > b?.field_zindex ? 1 : -1))
        .map((pane_fragment, index) => {
          let react_fragment,
            alt_text,
            imageData,
            shape = "",
            css_styles = "",
            css_styles_parent = "";

          // select css for viewport
          switch (data?.state?.viewport?.viewport?.key) {
            case "mobile":
              css_styles = pane_fragment?.field_css_styles_mobile;
              css_styles_parent = pane_fragment?.field_css_styles_parent_mobile;
              if (
                pane_fragment?.internal?.type === "paragraph__background_pane"
              )
                shape = pane_fragment?.field_shape_mobile;
              break;
            case "tablet":
              css_styles = pane_fragment?.field_css_styles_tablet;
              css_styles_parent = pane_fragment?.field_css_styles_parent_tablet;
              if (
                pane_fragment?.internal?.type === "paragraph__background_pane"
              )
                shape = pane_fragment?.field_shape_tablet;
              break;
            case "desktop":
              css_styles = pane_fragment?.field_css_styles_desktop;
              css_styles_parent =
                pane_fragment?.field_css_styles_parent_desktop;
              if (
                pane_fragment?.internal?.type === "paragraph__background_pane"
              )
                shape = pane_fragment?.field_shape_desktop;
              break;
          }

          // render this paneFragment
          switch (pane_fragment?.internal?.type) {
            case "paragraph__markdown":
              // now pre-render MarkdownParagraph elements and inject images
              let action,
                buttonData = {};
              let child =
                pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst;
              child.children =
                pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst?.children?.filter(
                  (e) => !(e.type === "text" && e.value === "\n")
                );
              try {
                action = JSON.parse(pane_fragment?.field_options);
                if (typeof action?.buttons === "object")
                  buttonData = action?.buttons;
              } catch (e) {
                if (e instanceof SyntaxError) {
                  console.log("ERROR parsing json in {}: ", e);
                }
              }
              react_fragment = MarkdownParagraph(
                pane_fragment?.id,
                child,
                pane_fragment?.relationships?.field_image,
                buttonData,
                css_styles_parent,
                css_styles,
                pane_fragment?.field_zindex,
                data?.hooks
              );
              break;

            case "paragraph__background_pane":
              react_fragment = InjectSvgShape(
                pane_fragment?.id,
                shape,
                data?.state?.viewport?.viewport?.key,
                css_styles_parent,
                pane_fragment?.field_zindex
              );
              break;

            case "paragraph__background_video":
              react_fragment = InjectGatsbyBackgroundVideo(
                pane_fragment?.id,
                pane_fragment?.field_cdn_url,
                pane_fragment?.field_alt_text,
                css_styles_parent,
                css_styles,
                pane_fragment?.field_zindex
              );
              break;

            case "paragraph__background_image":
              react_fragment = InjectGatsbyBackgroundImage(
                pane_fragment?.id,
                pane_fragment?.relationships?.field_image[0] &&
                  pane_fragment?.relationships?.field_image[0][
                    data?.state?.viewport?.viewport?.key
                  ],
                pane_fragment?.field_alt_text,
                css_styles_parent,
                pane_fragment?.field_zindex
              );
              break;

            case "paragraph__svg":
              react_fragment = InjectSvg(
                pane_fragment?.id,
                pane_fragment?.relationships?.field_svg_file?.localFile
                  ?.publicURL,
                pane_fragment?.field_svg_file?.description,
                css_styles_parent,
                pane_fragment?.field_zindex
              );
              break;

            case "paragraph__d3":
              //
              break;

            case "paragraph__h5p":
              //
              break;
          }
          let thisClass = `paneFragment paneFragment__view--${data?.state?.viewport?.viewport?.key}`;
          return (
            <div className={thisClass} key={pane_fragment?.id}>
              <IsVisible
                id={pane_fragment?.id}
                className="paneFragment"
                key={pane_fragment?.id}
              >
                {react_fragment}
              </IsVisible>
            </div>
          );
        });

      // compose this pane
      let pane_height;
      switch (data?.state?.viewport?.viewport?.key) {
        case "mobile":
          pane_height = pane?.field_height_ratio_mobile;
          break;
        case "tablet":
          pane_height = pane?.field_height_ratio_tablet;
          break;
        case "desktop":
          pane_height = pane?.field_height_ratio_desktop;
          break;
      }
      // skip if empty pane
      if (Object.keys(composedPane).length === 0) return;

      // may we wrap this in animation?
      let effects_payload = {};
      if (data?.state?.prefersReducedMotion?.prefersReducedMotion === false) {
        let effects = data?.state?.controller?.payload?.effects;
        let effects_payload;
        for (const key in effects) {
          if (effects[key]?.pane === pane?.id) {
            // inject css animation for each
            effects_payload = {
              in: [
                effects[key]?.function,
                effects[key]?.speed,
                effects[key]?.delay,
              ],
            };

            let this_effects_css = InjectCssAnimation(
              effects_payload,
              effects[key]?.paneFragment
            );
            css = css + this_effects_css;
          }
        }
      }

      // prepare css for pane
      css = css + "height:" + parseInt(pane_height) + "vw;\n";
      if (background_colour.length)
        css =
          css +
          " background-color:" +
          background_colour[0].field_background_colour +
          ";\n";

      return (
        <section key={pane?.id}>
          <IsVisible id={pane?.id} hooks={data?.hooks}>
            <StyledWrapperDiv
              className={
                "pane pane__view--" + data?.state?.viewport?.viewport?.key
              }
              css={css}
            >
              {composedPane}
            </StyledWrapperDiv>
          </IsVisible>
        </section>
      );
    }
  );
  // this is the storyFragment
  return composedPanes;
}

export { ComposePanes };
