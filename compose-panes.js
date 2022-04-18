import React, { useRef } from "react";
import { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, StyledWrapper } from "./helpers";
import { IsVisible } from "./is-visible.js";

function ComposePanes(data) {
  // if viewport is not yet defined, return empty fragment
  if (typeof data?.viewport?.key === "undefined") return /*#__PURE__*/React.createElement(React.Fragment, null); // loop through the panes in view and render each pane fragment

  const composedPanes = data?.data?.relationships?.field_panes.map((pane, i) => {
    // check for background colour
    const background_colour = pane?.relationships?.field_pane_fragments // skip if current viewport is listed in field_hidden_viewports
    .filter(e => e.field_hidden_viewports.replace(/\s+/g, "").split(",").indexOf(data?.viewport?.key) == -1).filter(e => e?.internal?.type === "paragraph__background_colour");
    let composedPane = pane?.relationships?.field_pane_fragments // skip if current viewport is listed in field_hidden_viewports
    .filter(e => e.field_hidden_viewports.replace(/\s+/g, "").split(",").indexOf(data?.viewport?.key) == -1) // and filter out paneFragment if background_colour
    .filter(e => e?.internal?.type !== "paragraph__background_colour").map((pane_fragment, index) => {
      let react_fragment,
          alt_text,
          imageData,
          css_styles = "",
          css_styles_parent = "";

      switch (data?.viewport?.key) {
        case "mobile":
          css_styles = pane_fragment?.field_css_styles_mobile;
          css_styles_parent = pane_fragment?.field_css_styles_parent_mobile;
          break;

        case "tablet":
          css_styles = pane_fragment?.field_css_styles_tablet;
          css_styles_parent = pane_fragment?.field_css_styles_parent_tablet;
          break;

        case "desktop":
          css_styles = pane_fragment?.field_css_styles_desktop;
          css_styles_parent = pane_fragment?.field_css_styles_parent_desktop;
          break;
      } // render this paneFragment


      switch (pane_fragment?.internal?.type) {
        case "paragraph__markdown":
          // get image data (if available)
          imageData = pane_fragment?.relationships?.field_image?.map(image => {
            return [image.id, image.filename, image.localFile?.childImageSharp?.gatsbyImageData];
          }); // replaces images with Gatsby Images and prepares html

          react_fragment = MarkdownParagraph(pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst, imageData, index, css_styles_parent, css_styles, pane_fragment?.field_zindex);
          break;

        case "paragraph__background_video":
          react_fragment = InjectGatsbyBackgroundVideo(pane_fragment?.id, pane_fragment?.field_cdn_url, pane_fragment?.field_alt_text, index, css_styles_parent, pane_fragment?.field_zindex);
          break;

        case "paragraph__background_image":
          imageData = pane_fragment?.relationships?.field_image?.map(image => {
            let key = data?.viewport?.key;
            let this_image_data = image[key];

            if (typeof this_image_data !== "undefined") {
              return this_image_data.childImageSharp?.gatsbyImageData;
            }
          });
          react_fragment = InjectGatsbyBackgroundImage(imageData[0], pane_fragment?.field_alt_text, index, css_styles_parent, pane_fragment?.field_zindex);
          break;

        case "paragraph__svg":
          alt_text = pane_fragment?.field_svg_file?.description;
          let publicURL = pane_fragment?.relationships?.field_svg_file?.localFile?.publicURL;
          react_fragment = InjectSvg(publicURL, alt_text, index, css_styles_parent, pane_fragment?.field_zindex);
          break;

        case "paragraph__d3":
          //
          break;

        case "paragraph__h5p":
          //
          break;
      }

      if (data?.prefersReducedMotion) {
        return /*#__PURE__*/React.createElement("div", {
          className: "paneFragment",
          key: pane_fragment?.id
        }, react_fragment);
      } // check for options payload


      const actions = JSON.parse(pane_fragment?.field_options);

      if (!"onscreen" in actions && !"offscreen" in actions) {
        // if no options, do not animate

        /*#__PURE__*/
        React.createElement("div", {
          className: "paneFragment",
          key: pane_fragment?.id
        }, react_fragment);
      } // else animate


      let payload = {
        in: [actions?.onscreen?.function, actions?.onscreen?.speed, actions?.onscreen?.delay],
        out: [actions?.offscreen?.function, actions?.offscreen?.speed, actions?.offscreen?.delay]
      };
      return /*#__PURE__*/React.createElement("div", {
        className: "paneFragment",
        key: pane_fragment?.id
      }, /*#__PURE__*/React.createElement(IsVisible, {
        payload: payload
      }, react_fragment));
    }); // compose this pane

    let pane_height;

    switch (data?.viewport?.key) {
      case "mobile":
        pane_height = pane?.field_height_ratio_mobile;
        break;

      case "tablet":
        pane_height = pane?.field_height_ratio_tablet;
        break;

      case "desktop":
        pane_height = pane?.field_height_ratio_desktop;
        break;
    } // skip if empty pane


    if (Object.keys(composedPane).length === 0) return;
    let this_css = "height:" + parseInt(pane_height) + "vw;";
    if (background_colour.length) this_css = this_css + " background-color:" + background_colour[0].field_background_colour + ";";
    return /*#__PURE__*/React.createElement(StyledWrapper, {
      key: pane?.id,
      className: "pane pane__view--" + data?.viewport?.key,
      css: this_css
    }, composedPane);
  }); // this is the storyFragment

  return composedPanes;
}

export { ComposePanes };
//# sourceMappingURL=compose-panes.js.map