function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from "react";
import { toH } from "hast-to-hyperscript";
import h from "hyperscript";
import { graphql, useStaticQuery } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";

const InjectGatsbyBackgroundImage = (imageData, alt_text) => {
  const image = getImage(imageData);
  const bgImage = convertToBgImage(image);
  return /*#__PURE__*/React.createElement(BackgroundImage, _extends({
    className: "paneFragmentImage",
    Tag: "section"
  }, bgImage, {
    preserveStackingContext: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(GatsbyImage, {
    image: image,
    alt: alt_text
  })));
};

const InjectGatsbyBackgroundVideo = (id, url, alt_text) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "paneFragmentVideo"
  }, /*#__PURE__*/React.createElement("video", {
    autoPlay: true,
    muted: true,
    loop: true,
    id: id,
    title: alt_text
  }, /*#__PURE__*/React.createElement("source", {
    src: url,
    type: "video/mp4"
  })));
};

const InjectSvg = (publicURL, alt_text) => {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("img", {
    src: publicURL,
    alt: alt_text,
    className: "paneFragmentCSS"
  }));
};

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
        }); // only supports one image each with its own dedicated paragraph

        return gatsbyImageData[0];
      }
    } // otherwise


    return toH(h, child).outerHTML;
  }); // render with styled-components and css

  return html.map((tag, index) => {
    // is either html as string OR is already a react element
    if (typeof tag === "object") {
      return tag;
    } else if (typeof tag === "string") {
      return /*#__PURE__*/React.createElement("div", {
        key: index,
        dangerouslySetInnerHTML: {
          __html: tag
        }
      });
    }
  });
};

const getStoryStepGraph = (graph, targetId) => {
  return graph.edges.filter(e => e?.node?.id === targetId)[0];
};

export { MarkdownInjectGatsbyImage, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, getStoryStepGraph };
//# sourceMappingURL=helpers.js.map