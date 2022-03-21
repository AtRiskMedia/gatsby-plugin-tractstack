import React from "react";
import styled from "styled-components";
import { toH } from "hast-to-hyperscript";
import { sanitize } from "hast-util-sanitize";
import h from "hyperscript";
import { MarkdownInjectGatsbyImage } from "./helpers";

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
        let imageData = pane_fragment.relationships.field_image.map((image) => {
          return [
            image.id,
            image.filename,
            image.localFile.childImageSharp.gatsbyImageData,
          ];
        });
        let htmlAst = sanitize(
          pane_fragment.childPaneFragment.childMarkdownRemark.htmlAst
        );
        // replace images with Gatsby Images
        let html = MarkdownInjectGatsbyImage(htmlAst, imageData);
        // render with styled-components and css
        let children = html.map((tag, index) => {
          // is either html as string OR is already a react element
          if (typeof tag === "object") {
            return tag;
          } else if (typeof tag === "string") {
            return (
              <div key={index} dangerouslySetInnerHTML={{ __html: tag }} />
            );
          }
        });
        return (
          <StyleWrapper
            key={index}
            css={pane_fragment.field_css_styles}
            parent_css={pane_fragment.field_css_styles_parent}
          >
            {children}
          </StyleWrapper>
        );
      }
    );
  });
};

export { ComposePanes };
