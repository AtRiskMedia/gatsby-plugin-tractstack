function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from "react";
import { toH } from "hast-to-hyperscript";
import { sanitize } from "hast-util-sanitize";
import h from "hyperscript";
import styled from "styled-components";
import { graphql, useStaticQuery } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";
const StyledWrapperDiv = styled.div`
  ${props => props.css};
`;
const StyledWrapperSection = styled.section`
  ${props => props.css};
`;

const InjectGatsbyBackgroundImage = (imageData, alt_text, index, parent_css = "", zIndex) => {
  const image = getImage(imageData);
  const bgImage = convertToBgImage(image);
  return /*#__PURE__*/React.createElement("div", {
    className: "paneFragment",
    key: index
  }, /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    css: "z-index:" + parseInt(zIndex) + "; img {" + parent_css + "}"
  }, /*#__PURE__*/React.createElement(BackgroundImage, _extends({
    Tag: "section"
  }, bgImage, {
    preserveStackingContext: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(GatsbyImage, {
    image: image,
    alt: alt_text
  })))));
};

const InjectGatsbyBackgroundVideo = (id, url, alt_text, index, parent_css = "", css = "", zIndex) => {
  return /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    className: "paneFragment",
    key: index,
    css: parent_css + "z-index:" + parseInt(zIndex) + ";" + css
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

const InjectSvg = (publicURL, alt_text, index, parent_css, css, zIndex) => {
  return /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    className: "paneFragment",
    key: index,
    css: parent_css + "z-index:" + parseInt(zIndex) + ";" + css
  }, /*#__PURE__*/React.createElement("img", {
    src: publicURL,
    alt: alt_text,
    className: "paneFragmentCSS"
  }));
};

const MarkdownParagraph = (htmlAst, imageData = [], index, parent_css = "", css = "", zIndex) => {
  const html = sanitize(htmlAst).children.filter(child => child?.type && child.type === "element").map((child, index) => {
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
    } // otherwise this tag is not an image


    return /*#__PURE__*/React.createElement("div", {
      key: index,
      dangerouslySetInnerHTML: {
        __html: toH(h, child).outerHTML
      }
    });
  });
  return /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    key: index,
    css: parent_css + "z-index:" + parseInt(zIndex) + ";" + css
  }, html);
};

const getStoryStepGraph = (graph, targetId) => {
  return graph.edges.filter(e => e?.node?.id === targetId)[0];
};

export { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, StyledWrapperDiv, StyledWrapperSection, getStoryStepGraph };
//# sourceMappingURL=helpers.js.map