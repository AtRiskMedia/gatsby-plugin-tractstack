function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from "react";
import { sanitize } from "hast-util-sanitize";
import styled from "styled-components";
import { graphql, useStaticQuery, Link } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";
import { SvgPane } from "./shapes";
import { lispLexer } from "./lexer";

const lispCallback = (payload, context) => {
  let lisp_data = payload[Object.keys(payload)[0]][0];
  let command = lisp_data[0];
  let parameter_one = lisp_data[1][0];
  let parameter_two = lisp_data[1][1];

  switch (command) {
    case "alert":
      alert(parameter_one);
      break;

    case "goto":
      console.log("TODO: lispCallback, goto", parameter_one, parameter_two);
      break;

    default:
      console.log("MISS on helpers.js lispCallback:", callback, payload);
  }
};

const HtmlAstToReact = (children, imageData = [], buttonData = []) => {
  // recursive function
  // breaks gatsby images free of enclosing p tag
  let contents, raw;
  const fragment = children.map((e, index) => {
    if (e?.type === "text") return /*#__PURE__*/React.createElement("span", {
      key: index
    }, e?.value);

    switch (e?.tagName) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        const Tag = e?.tagName;
        return /*#__PURE__*/React.createElement("div", {
          key: index
        }, /*#__PURE__*/React.createElement(Tag, null, e?.children[0].value));

      case "br":
        return /*#__PURE__*/React.createElement("br", {
          key: index
        });

      case "em":
        if (typeof e?.children[0]?.value === "string") {
          return /*#__PURE__*/React.createElement("em", {
            key: index
          }, e?.children[0]?.value);
        }

        break;

      case "strong":
        if (typeof e?.children[0]?.value === "string") {
          return /*#__PURE__*/React.createElement("strong", {
            key: index
          }, e?.children[0]?.value);
        }

        break;

      case "a":
        if (typeof e?.properties?.href === "string" && e?.children[0]?.type === "text" && typeof e?.children[0]?.value === "string") {
          // check for buttons action payload
          let is_button;

          if (typeof buttonData === "object" && Object.keys(buttonData).length) {
            let key = Object.keys(buttonData).find(target => buttonData[target]?.urlTarget === e?.properties?.href);
            is_button = buttonData[key];
          }

          if (is_button) {
            // inject button with callback function, add css className
            let payload = is_button?.callbackPayload;
            let payload_ast = lispLexer(payload);

            function injectPayload() {
              lispCallback(payload_ast, "button");
            }

            return /*#__PURE__*/React.createElement("button", {
              key: index,
              className: is_button?.className,
              onClick: () => injectPayload()
            }, e?.children[0]?.value);
          } // else, treat at internal link
          // ...TODO: add check here and use a href for external links


          return /*#__PURE__*/React.createElement(Link, {
            to: e?.properties?.href,
            key: index
          }, e?.children[0]?.value);
        }

        break;

      case "img":
        // is this case for gatsby image? = png, jpg ... != svg
        let pass = /\.[A-Za-z0-9]+$/;
        let extcheck = e?.properties?.src?.match(pass);

        if (extcheck && (extcheck[0] === ".png" || extcheck[0] === ".jpg")) {
          // imageData in this case is an array ... must find correct element
          let this_imageData = imageData.filter(image => image.filename === e?.properties?.src)[0]?.localFile?.childImageSharp?.gatsbyImageData;
          return /*#__PURE__*/React.createElement(GatsbyImage, {
            key: index,
            alt: e?.properties?.alt,
            image: this_imageData
          });
        }

        break;

      case "p":
        contents = e?.children?.map((p, i) => {
          // use recursion to compose the MarkdownParagraph
          return HtmlAstToReact([p], imageData, buttonData);
        }); // is this an image?

        if (contents.length === 1 && contents[0][0].props?.image) {
          return /*#__PURE__*/React.createElement("div", {
            key: index
          }, contents[0][0]);
        }

        return /*#__PURE__*/React.createElement("div", {
          key: index
        }, /*#__PURE__*/React.createElement("p", null, contents));

      case "ul":
      case "ol":
        raw = e?.children.filter(e => !(e.type === "text" && e.value === "\n"));
        contents = HtmlAstToReact(raw, imageData, buttonData);
        let list;
        if (e?.tagName === "ol") list = /*#__PURE__*/React.createElement("ol", null, contents);
        if (e?.tagName === "ul") list = /*#__PURE__*/React.createElement("ul", null, contents);
        return /*#__PURE__*/React.createElement("div", {
          key: index
        }, list);

      case "li":
        contents = e?.children?.map((li, i) => {
          // use recursion to compose the MarkdownParagraph
          return HtmlAstToReact([li], imageData, buttonData);
        });
        return /*#__PURE__*/React.createElement("li", {
          key: index
        }, contents);

      case "blockquote":
        raw = e?.children.filter(e => !(e.type === "text" && e.value === "\n"));
        let contents = HtmlAstToReact(raw, imageData, buttonData);

        if (typeof e?.children[0]?.value === "string") {
          return /*#__PURE__*/React.createElement("blockquote", {
            key: index
          }, contents);
        }

        break;

      default:
        console.log("helpers.js: MISS on", e);
    }
  });
  return fragment;
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
}; // pre-rendered svg shapes for each viewport
// relies on shapes.js


const InjectSvgShape = (id, shape, viewport, parent_css, zIndex) => {
  let css = `${parent_css} z-index: ${parseInt(zIndex)};`;
  let child = SvgPane(shape, viewport);
  return PaneFragment(id, child, css);
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

const MarkdownParagraph = (id, htmlAst, imageData = [], buttonData = [], parent_css = "", child_css = "", zIndex) => {
  const paragraph = HtmlAstToReact(htmlAst?.children, imageData, buttonData);
  let css = `height:100%; ${parent_css} z-index: ${parseInt(zIndex)}; ${child_css}`;
  return PaneFragment(id, paragraph, css);
};

const getStoryStepGraph = (graph, targetId) => {
  return graph?.edges?.filter(e => e?.node?.id === targetId)[0];
};

const InjectCssAnimation = (payload, paneFragmentId) => {
  let css = "",
      selector;

  if (paneFragmentId !== "tractstack-controller") {
    selector = `#${paneFragmentId}.visible`;
  } else {
    selector = "#tractstack-controller";
  }

  let animationIn = payload?.in[0],
      animationInSpeed = payload?.in[1],
      animationInDelay = payload?.in[2];

  if (typeof animationIn === "string") {
    css = css + `${selector} { height:100%; opacity: 0; animation-fill-mode: both; animation-name: ` + animationIn + `; -webkit-animation-name: ` + animationIn + `; `;

    if (typeof animationInSpeed === "number") {
      css = css + `animation-duration: ` + animationInSpeed + `s; -webkit-animation-duration: ` + animationInSpeed + `s; `;
    }

    if (typeof animationInDelay === "number") {
      css = css + `animation-delay: ` + animationInDelay + `s; `;
    }

    css = css + "}\n";
  }

  return css;
};

export { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, InjectSvgShape, StyledWrapperDiv, StyledWrapperSection, PaneFragment, getStoryStepGraph, InjectCssAnimation, lispCallback };
//# sourceMappingURL=helpers.js.map