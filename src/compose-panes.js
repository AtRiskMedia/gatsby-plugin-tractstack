import React, { useEffect, useRef } from "react";
import { sanitize } from "hast-util-sanitize";
import {
  MarkdownParagraph,
  InjectGatsbyBackgroundImage,
  InjectGatsbyBackgroundVideo,
  InjectSvg,
} from "./helpers";
import { gsap } from "gsap";

function ComposePanes(data) {
  // if viewport is not yet defined, return empty fragment
  if (typeof data?.viewport?.key === "undefined") return <></>;
  // loop through the panes in view and render each pane fragment
  const composedPanes = data?.data?.relationships?.field_panes
    // compose current pane plus lookahead
    .map((pane) => {
      const composedPane = pane?.relationships?.field_pane_fragments.map(
        (pane_fragment, index) => {
          let react_fragment, alt_text, imageData;
          // switch on internal.type
          switch (pane_fragment?.internal?.type) {
            case "paragraph__markdown":
              // get image data (if available)
              imageData = pane_fragment?.relationships?.field_image?.map(
                (image) => {
                  return [
                    image.id,
                    image.filename,
                    image.localFile?.childImageSharp?.gatsbyImageData,
                  ];
                }
              );

              // replaces images with Gatsby Images and prepares html
              let htmlAst = sanitize(
                pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst
              );
              react_fragment = MarkdownParagraph(
                htmlAst,
                imageData,
                index,
                pane_fragment?.field_css_styles_parent,
                pane_fragment?.field_css_styles,
                pane_fragment?.field_zindex
              );
              break;

            case "paragraph__background_video":
              react_fragment = InjectGatsbyBackgroundVideo(
                pane_fragment?.id,
                pane_fragment?.field_cdn_url,
                pane_fragment?.field_alt_text,
                index
              );
              break;

            case "paragraph__background_image":
              imageData = pane_fragment?.relationships?.field_image?.map(
                (image) => {
                  let key = data?.viewport?.key;
                  let this_image_data = image[key];
                  if (typeof this_image_data !== "undefined") {
                    return this_image_data.childImageSharp?.gatsbyImageData;
                  }
                }
              );
              react_fragment = InjectGatsbyBackgroundImage(
                imageData[0],
                pane_fragment?.field_alt_text,
                index
              );
              break;

            case "paragraph__svg":
              alt_text = pane_fragment?.field_svg_file?.description;
              let publicURL =
                pane_fragment?.relationships?.field_svg_file?.localFile
                  ?.publicURL;
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
        }
      );
      let paneRef = useRef();
      useEffect(() => {
        gsap.from(paneRef.current, 1, { opacity: 0, delay: 0 });
      });
      return (
        <div
          key={pane?.id}
          className={"pane pane__view--" + data?.viewport?.key}
          ref={paneRef}
        >
          {composedPane}
        </div>
      );
    });
  return composedPanes;
}

export { ComposePanes };
