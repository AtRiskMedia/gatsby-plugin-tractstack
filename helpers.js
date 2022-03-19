import React from "react";
import { toH } from "hast-to-hyperscript";
import h from "hyperscript";
import { GatsbyImage } from "gatsby-plugin-image";

const MarkdownInjectGatsbyImage = (htmlAst, imageData = []) => {
  const html = htmlAst.children.filter(child => child?.type && child.type === "element").map(child => {
    for (const [i, tag] of Object.entries(child.children)) {
      if (tag?.tagName && tag.tagName === "img") {
        const gatsbyImageData = child.children.map(image => {
          let thisImageData = imageData.filter(matchImage => matchImage[1] === image?.properties?.src);

          if (thisImageData && thisImageData[0] && thisImageData[0][2]) {
            return /*#__PURE__*/React.createElement(GatsbyImage, {
              key: thisImageData[0][0],
              alt: image.properties.alt,
              image: thisImageData[0][2]
            });
          }
        }); // only supports one image with own dedicated paragraph

        return gatsbyImageData[0];
      }
    } // otherwise


    return toH(h, child).outerHTML;
  });
  return html;
};

export { MarkdownInjectGatsbyImage };
//# sourceMappingURL=helpers.js.map