import React from "react";
import { MarkdownInjectGatsbyImage } from "./helpers";
import { toH } from "hast-to-hyperscript";
import h from "hyperscript";

const ComposePanes = data => {
  // loop through the panes
  return data.data.relationships.field_panes.map(pane => {
    return pane.relationships.field_pane_fragments.map(pane_fragment => {
      let imageData = pane_fragment.relationships.field_image.map(image => {
        return [image.id, image.filename, image.localFile.childImageSharp.gatsbyImageData];
      });
      let htmlAst = pane_fragment.childPaneFragment.childMarkdownRemark.htmlAst;
      let html = MarkdownInjectGatsbyImage(htmlAst, imageData);
      const paneFragment = html.map((tag, index) => {
        if (typeof tag === "string") {
          return /*#__PURE__*/React.createElement("div", {
            key: index,
            dangerouslySetInnerHTML: {
              __html: tag
            }
          });
        } else {
          return tag;
        }
      });
      return paneFragment;
    });
  });
};

export { ComposePanes };
//# sourceMappingURL=compose-panes.js.map