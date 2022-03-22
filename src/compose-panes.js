import React from "react";
import styled from "styled-components";
import { sanitize } from "hast-util-sanitize";
import {
  MarkdownInjectGatsbyImage,
  InjectGatsbyBackgroundImage,
} from "./helpers";

const StyledWrapper = styled.div`
  ${(props) => props.css};
`;
const StyleWrapper = ({ children, css, parent_css }) => {
  return (
    <StyledWrapper css={parent_css}>
      <StyledWrapper css={css}>{children}</StyledWrapper>
    </StyledWrapper>
  );
};

const ComposePanes = (data) => {
  // loop through the panes and render from markdown > htmlAst + css using styled-components
  return data.data.relationships.field_panes.map((pane, index) => {
    // each pane needs its field_css_styles_parent
    return pane.relationships.field_pane_fragments.map(
      (pane_fragment, index) => {
        let react_fragment;
        let imageData = pane_fragment.relationships.field_image.map((image) => {
          return [
            image.id,
            image.filename,
            image.localFile.childImageSharp.gatsbyImageData,
          ];
        });

        // switch on internal.type
        switch (pane_fragment.internal.type) {
          case "paragraph__markdown":
            // replace images with Gatsby Images and prepare html
            let htmlAst = sanitize(
              pane_fragment.childPaneFragment.childMarkdownRemark.htmlAst
            );
            react_fragment = MarkdownInjectGatsbyImage(htmlAst, imageData);
            break;

          case "paragraph__background_image":
            // create Gatsby Background Image ... imageData[2] has the image
            let alt_text = pane_fragment.field_alt_text;
            react_fragment = InjectGatsbyBackgroundImage(
              imageData[0][2],
              alt_text
            );
            break;

          case "paragraph__svg":
            //
            break;

          case "paragraph__video":
            //
            break;

          case "paragraph__d3":
            //
            break;

          case "paragraph__h5p":
            //
            break;
        }

        return (
          <StyleWrapper
            key={index}
            css={pane_fragment.field_css_styles}
            parent_css={pane_fragment.field_css_styles_parent}
          >
            {react_fragment}
          </StyleWrapper>
        );
      }
    );
  });
};

export { ComposePanes };