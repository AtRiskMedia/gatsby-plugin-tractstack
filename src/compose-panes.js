import React from "react";
import styled from "styled-components";
import { sanitize } from "hast-util-sanitize";
import {
  MarkdownInjectGatsbyImage,
  InjectGatsbyBackgroundImage,
  InjectGatsbyBackgroundVideo,
  InjectSvg,
} from "./helpers";

const StyledWrapper = styled.div`
  ${(props) => props.css};
`;
const StyledInner = ({ children, css, parent_css, viewport }) => {
  return (
    <StyledWrapper css={parent_css}>
      <div className={"pane pane__view--" + viewport}>
        <StyledWrapper css={css}>{children}</StyledWrapper>
      </div>
    </StyledWrapper>
  );
};
const StyledOuter = ({ children, css, viewport }) => {
  return (
    <StyledWrapper css={css}>
      <div className={"storyFragment storyFragment__view--" + viewport}>
        {children}
      </div>
    </StyledWrapper>
  );
};

const ComposePanes = (data) => {
  // if viewport is not yet defined, return empty fragment
  if (typeof data?.viewport?.key === "undefined") return <></>;
  let recall = data?.recall;
  let lookahead =
    data?.data?.relationships?.field_panes[recall - 1].field_lookahead;
  // loop through the panes in view and render each pane fragment
  const composedPanes = data?.data?.relationships?.field_panes
    // compose current pane plus lookahead
    .slice(recall - 1, recall + lookahead)
    .map((pane) => {
      return pane?.relationships?.field_pane_fragments.map(
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
                },
                recall
              );

              // replaces images with Gatsby Images and prepares html
              let htmlAst = sanitize(
                pane_fragment?.childPaneFragment?.childMarkdownRemark?.htmlAst
              );
              react_fragment = MarkdownInjectGatsbyImage(htmlAst, imageData);
              break;

            case "paragraph__background_video":
              react_fragment = InjectGatsbyBackgroundVideo(
                pane_fragment?.id,
                pane_fragment?.field_cdn_url,
                pane_fragment?.field_alt_text
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
                pane_fragment?.field_alt_text
              );
              break;

            case "paragraph__svg":
              alt_text = pane_fragment?.field_svg_file?.description;
              let publicURL =
                pane_fragment?.relationships?.field_svg_file?.localFile
                  ?.publicURL;
              react_fragment = InjectSvg(publicURL, alt_text);
              break;

            case "paragraph__d3":
              //
              break;

            case "paragraph__h5p":
              //
              break;
          }

          return (
            <StyledInner
              key={index}
              css={pane_fragment?.field_css_styles}
              parent_css={pane_fragment?.field_css_styles_parent}
              viewport={data?.viewport?.key}
            >
              {react_fragment}
            </StyledInner>
          );
        }
      );
    });
  return (
    <StyledOuter css={data?.parent_css} viewport={data?.viewport?.key}>
      {composedPanes}
    </StyledOuter>
  );
};

export { ComposePanes };
