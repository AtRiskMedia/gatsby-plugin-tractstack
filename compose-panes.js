import React, { useEffect, useRef } from "react";
import { sanitize } from "hast-util-sanitize";
import { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg } from "./helpers";

function ComposePanes(data) {
  // if viewport is not yet defined, return empty fragment
  if (typeof data?.viewport?.key === "undefined") return /*#__PURE__*/React.createElement(React.Fragment, null); // loop through the panes in view and render each pane fragment

  const composedPanes = data?.data?.relationships?.field_panes.map(pane => {
    const composedPane = pane?.relationships?.field_pane_fragments.map((pane_fragment, index) => {
      let react_fragment, alt_text, imageData;

      switch (pane_fragment?.internal?.type) {
        case "paragraph__markdown":
          // get image data (if available)
          imageData = pane_fragment?.relationships?.field_image?.map(image => {
            return [image.id, image.filename, image.localFile?.childImageSharp?.gatsbyImageData];
          }); // replaces images with Gatsby Images and prepares html

          let htmlAst = sanitize(pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst);
          let css_styles, css_styles_parent;

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
          }

          react_fragment = MarkdownParagraph(htmlAst, imageData, index, css_styles_parent, css_styles, pane_fragment?.field_zindex);
          break;

        case "paragraph__background_video":
          react_fragment = InjectGatsbyBackgroundVideo(pane_fragment?.id, pane_fragment?.field_cdn_url, pane_fragment?.field_alt_text, index);
          break;

        case "paragraph__background_image":
          imageData = pane_fragment?.relationships?.field_image?.map(image => {
            let key = data?.viewport?.key;
            let this_image_data = image[key];

            if (typeof this_image_data !== "undefined") {
              return this_image_data.childImageSharp?.gatsbyImageData;
            }
          });
          react_fragment = InjectGatsbyBackgroundImage(imageData[0], pane_fragment?.field_alt_text, index);
          break;

        case "paragraph__svg":
          alt_text = pane_fragment?.field_svg_file?.description;
          let publicURL = pane_fragment?.relationships?.field_svg_file?.localFile?.publicURL;
          react_fragment = InjectSvg(publicURL, alt_text, index);
          break;

        case "paragraph__d3":
          //
          break;

        case "paragraph__h5p":
          //
          break;
      }

      return react_fragment;
    });
    return /*#__PURE__*/React.createElement("div", {
      key: pane?.id,
      className: "pane pane__view--" + data?.viewport?.key
    }, composedPane);
  });
  return composedPanes;
}

export { ComposePanes };
//# sourceMappingURL=compose-panes.js.map