function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from "react";
import { sanitize } from "hast-util-sanitize";
import styled from "styled-components";
import { graphql, useStaticQuery, Link } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";

const HtmlAstToReact = (children, imageData = []) => {
  // recursive function
  // breaks gatsby images free of enclosing p tag
  let contents;
  const fragment = children.map((e, index) => {
    if (e?.type === "text") return /*#__PURE__*/React.createElement("span", null, e?.value);

    switch (e?.tagName) {
      case "h1":
        return /*#__PURE__*/React.createElement("h1", {
          key: index
        }, e?.children[0].value);

      case "h2":
        return /*#__PURE__*/React.createElement("h2", {
          key: index
        }, e?.children[0].value);

      case "h3":
        return /*#__PURE__*/React.createElement("h3", {
          key: index
        }, e?.children[0].value);

      case "h4":
        return /*#__PURE__*/React.createElement("h4", {
          key: index
        }, e?.children[0].value);

      case "h5":
        return /*#__PURE__*/React.createElement("h5", {
          key: index
        }, e?.children[0].value);

      case "h6":
        return /*#__PURE__*/React.createElement("h6", {
          key: index
        }, e?.children[0].value);

      case "p":
        let breakout = false;
        contents = e?.children?.map((p, i) => {
          if (p?.type === "text") {
            let value = p?.value.replace(/\r?\n|\r/g, "");
            if (value.length) return /*#__PURE__*/React.createElement("span", {
              key: i
            }, value);
          }

          if (p?.type === "element") {
            // determine which element ... could be p, img, br, a, ?
            switch (p?.tagName) {
              case "br":
                return /*#__PURE__*/React.createElement("br", {
                  key: i
                });

              case "a":
                if (typeof p?.properties?.href === "string" && p?.children[0]?.type === "text" && typeof p?.children[0]?.value === "string") {
                  // is this an internal link?
                  // TODO
                  return /*#__PURE__*/React.createElement(Link, {
                    to: p?.properties?.href,
                    key: i
                  }, p?.children[0]?.value);
                }

              case "img":
                // is this case for gatsby image? = png, jpg ... != svg
                let pass = /\.[A-Za-z0-9]+$/;
                let extcheck = p?.properties?.src?.match(pass);

                if (extcheck && (extcheck[0] === ".png" || extcheck[0] === ".jpg")) {
                  // imageData in this case is an array ... must find correct element
                  let this_imageData = imageData.filter(image => image.filename === p?.properties?.src)[0]?.localFile?.childImageSharp?.gatsbyImageData;
                  breakout = true;
                  return /*#__PURE__*/React.createElement(GatsbyImage, {
                    key: i,
                    alt: p?.properties?.alt,
                    image: this_imageData
                  });
                }

              default:
                console.log("helpers.js: MISS on", p?.tagName);
            } // use recursion to compose the MarkdownParagraph


            return HtmlAstToReact(p?.children, imageData);
          }
        }); // breakout is true when contents is gatsby image

        if (breakout) return /*#__PURE__*/React.createElement("div", {
          key: index
        }, contents);
        return /*#__PURE__*/React.createElement("p", {
          key: index
        }, contents);

      case "ul":
        contents = e?.children?.map((li, i) => {
          if (li?.type === "element") {
            // assumes link contains text only
            return /*#__PURE__*/React.createElement("li", {
              key: i
            }, li?.children[0].value);
          }
        });
        return /*#__PURE__*/React.createElement("ul", {
          key: index
        }, contents);

      default:
        console.log("helpers.js: MISS on", e);
    }
  });
  return /*#__PURE__*/React.createElement("div", null, fragment);
};

const StyledWrapperDiv = styled.div`
  ${props => props.css};
`;
const StyledWrapperSection = styled.section`
  ${props => props.css};
`;

const PaneFragment = (id, child, css) => {
  return /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    key: id,
    css: css
  }, child);
};

const InjectSvg = (id, url, alt_text, parent_css, zIndex) => {
  let css = `${parent_css} z-index: ${parseInt(zIndex)};`;
  let child = /*#__PURE__*/React.createElement("img", {
    src: url,
    alt: alt_text,
    className: "paneFragmentCSS"
  });
  return PaneFragment(id, child, css);
};

const InjectGatsbyBackgroundImage = (id, imageData, alt_text, parent_css = "", zIndex) => {
  const this_imageData = getImage(imageData);
  const bgImage = convertToBgImage(this_imageData);
  let css = `z-index: ${parseInt(zIndex)}; img { ${parent_css} }`;
  let child = /*#__PURE__*/React.createElement(BackgroundImage, _extends({
    Tag: "section"
  }, bgImage, {
    preserveStackingContext: true
  }), /*#__PURE__*/React.createElement("div", {
    className: "paneFragmentImage"
  }, /*#__PURE__*/React.createElement(GatsbyImage, {
    image: this_imageData,
    alt: alt_text
  })));
  return PaneFragment(id, child, css);
};

const InjectGatsbyBackgroundVideo = (id, url, alt_text, parent_css = "", child_css = "", zIndex) => {
  let css = `${parent_css} z-index: ${parseInt(zIndex)}; ${child_css}`;
  let child = /*#__PURE__*/React.createElement("video", {
    autoPlay: true,
    muted: true,
    loop: true,
    id: id,
    title: alt_text,
    className: "paneFragmentVideo"
  }, /*#__PURE__*/React.createElement("source", {
    src: url,
    type: "video/mp4"
  }));
  return PaneFragment(id, child, css);
};

const MarkdownParagraph = (id, htmlAst, imageData = [], parent_css = "", child_css = "", zIndex) => {
  const paragraph = HtmlAstToReact(htmlAst?.children, imageData);
  const css = `${parent_css} z-index: ${parseInt(zIndex)}; ${child_css}`;
  return PaneFragment(id, paragraph, css);
};

const getStoryStepGraph = (graph, targetId) => {
  return graph?.edges?.filter(e => e?.node?.id === targetId)[0];
};

export { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, StyledWrapperDiv, StyledWrapperSection, getStoryStepGraph };
//# sourceMappingURL=helpers.js.map