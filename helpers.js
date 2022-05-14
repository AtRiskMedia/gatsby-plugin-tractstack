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

const getCurrentPane = (paneId = "", panes = []) => {
  if (!paneId) return panes[0]; // return first element in panes

  return paneId;
}; // from https://tobbelindstrom.com/blog/measure-scrollbar-width-and-height/


const getScrollbarSize = () => {
  if (typeof window !== "undefined") {
    const {
      body
    } = document;
    const scrollDiv = document.createElement("div"); // Append element with defined styling

    scrollDiv.setAttribute("style", "width: 1337px; height: 1337px; position: absolute; left: -9999px; overflow: scroll;");
    body.appendChild(scrollDiv); // Collect width & height of scrollbar

    const calculateValue = type => scrollDiv[`offset${type}`] - scrollDiv[`client${type}`];

    const scrollbarWidth = calculateValue("Width"); // Remove element

    body.removeChild(scrollDiv);
    return scrollbarWidth;
  }

  return 12;
};

const lispCallback = (payload, context = "", hooks = []) => {
  let icon;
  let lisp_data = payload[Object.keys(payload)[0]];
  let command = lisp_data[0] || false;
  let parameter_one, parameter_two, parameter_three;

  if (typeof lisp_data[1] === "object") {
    parameter_one = lisp_data[1][0] || false;
    parameter_two = lisp_data[1][1] || false;
    parameter_three = lisp_data[1][2] || false;
  } // now process the command


  switch (command) {
    case "icon":
      // pre-process on context
      switch (context) {
        case "paneVisible":
          // process as "icon" function
          icon = parameter_one;
          command = parameter_two[0];
          parameter_one = parameter_two[1];
          parameter_two = parameter_three;
          parameter_three = false;
          console.log(`todo: add ${icon} icon to controller`); // TODO: do something with the icon

          break;

        case "paneHidden":
          // process as "icon" function
          icon = parameter_one;
          command = parameter_two[0];
          parameter_one = parameter_two[1];
          parameter_two = parameter_three;
          parameter_three = false;
          console.log(`todo: remove ${icon} icon to controller`); // TODO: do something with the icon

          break;
      }

      break;

    case "alert":
      alert(parameter_one);
      break;

    case "goto":
      // calls hooks.hookGotoStoryFragment for gatsby navigate
      if (parameter_one === "storyFragment" && typeof parameter_two === "string") hooks.hookGotoStoryFragment(`/${parameter_two}`);
      if (parameter_one === "pane" && typeof parameter_two === "string") hooks.hookSetCurrentPane(parameter_two);
      break;

    default:
      console.log("MISS on helpers.js lispCallback:", context, command);
  }
};

const HtmlAstToReact = (children, imageData = [], buttonData = [], maskData = [], hooks = []) => {
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
              lispCallback(payload_ast[0], "button", hooks);
            }

            return /*#__PURE__*/React.createElement("button", {
              key: index,
              className: is_button?.className,
              onClick: () => injectPayload()
            }, e?.children[0]?.value);
          } // else, treat at internal link
          // ...TODO: add check here and use a href for external links


          return /*#__PURE__*/React.createElement("a", {
            onClick: () => hooks?.hookGotoStoryFragment(e?.properties?.href),
            key: index
          }, e?.children[0]?.value);
        }

        break;

      case "img":
        // is this case for gatsby image? = png, jpg ... != svg
        let pass = /\.[A-Za-z0-9]+$/;
        let extcheck = e?.properties?.src?.match(pass);

        if (extcheck && (extcheck[0] === ".png" || extcheck[0] === ".jpg")) {
          // imageData in this case is an array ... assumes image is first element
          let this_imageData = imageData.filter(image => image.filename === e?.properties?.src)[0]?.localFile?.childImageSharp?.gatsbyImageData;
          let image = /*#__PURE__*/React.createElement(GatsbyImage, {
            key: index,
            alt: e?.properties?.alt,
            image: this_imageData
          });
          /*
          if (
            typeof maskData.imageMaskShape === "object" &&
            maskData.imageMaskShape
          ) {
            maskData.imageMaskShape.map(e => {
              let this_css = `clip-path:url(#${e?.paneFragment});`;
              image = (
                <div key={e?.id} style={{ this_css }}>
                  {image}
                </div>
              );
            });
          }
          //in css paneFragment__mask;
          */

          return image;
        }

        break;

      case "p":
        contents = e?.children?.map((p, i) => {
          // use recursion to compose the MarkdownParagraph
          return HtmlAstToReact([p], imageData, buttonData, maskData, hooks);
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
        contents = HtmlAstToReact(raw, imageData, buttonData, maskData, hooks);
        let list;
        if (e?.tagName === "ol") list = /*#__PURE__*/React.createElement("ol", null, contents);
        if (e?.tagName === "ul") list = /*#__PURE__*/React.createElement("ul", null, contents);
        return /*#__PURE__*/React.createElement("div", {
          key: index
        }, list);

      case "li":
        contents = e?.children?.map((li, i) => {
          // use recursion to compose the MarkdownParagraph
          return HtmlAstToReact([li], imageData, buttonData, maskData, hooks);
        });
        return /*#__PURE__*/React.createElement("li", {
          key: index
        }, contents);

      case "blockquote":
        raw = e?.children.filter(e => !(e.type === "text" && e.value === "\n"));
        let contents = HtmlAstToReact(raw, imageData, buttonData, maskData, hooks);

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
  let this_css = `height:100%; ${css}`;
  return /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    key: id,
    css: this_css
  }, child);
}; // pre-rendered svg shapes for each viewport
// relies on shapes.js


const InjectSvgShape = (id, shape, viewport, parent_css = "", zIndex) => {
  let css = `z-index: ${parseInt(zIndex)};`;
  if (typeof parent_css === "string") css = `${css} ${parent_css}`;
  let child = SvgPane(shape, viewport);
  return PaneFragment(id, child, css);
};

const InjectSvg = (id, url, alt_text, parent_css = "", zIndex) => {
  let css = `z-index: ${parseInt(zIndex)};`;
  if (typeof parent_css === "string") css = `${css} ${parent_css}`;
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
  let css = `z-index: ${parseInt(zIndex)};`;
  if (typeof parent_css === "string") css = `${css} img {${parent_css}}`;
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
  let css = `z-index: ${parseInt(zIndex)};`;
  if (typeof parent_css === "string") css = `${css} ${parent_css}`;
  if (typeof child_css === "string") css = `${css} ${child_css}`;
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

const MarkdownParagraph = (id, htmlAst, imageData = {}, buttonData = {}, maskData = {}, parent_css = "", child_css = "", zIndex, hooks = []) => {
  const paragraph = HtmlAstToReact(htmlAst?.children, imageData, buttonData, maskData, hooks);
  let css = `z-index: ${parseInt(zIndex)};`;
  if (typeof parent_css === "string") css = `${css} ${parent_css}`;
  if (typeof child_css === "string") css = `${css} ${child_css}`;
  return PaneFragment(id, paragraph, css);
};

const getStoryStepGraph = (graph, targetId) => {
  return graph?.edges?.filter(e => e?.node?.id === targetId)[0];
};

const InjectCssAnimation = (payload, paneFragmentId) => {
  let css = "",
      selector;

  if (paneFragmentId !== "tractstack-controller") {
    selector = `div#${paneFragmentId}.visible`;
  } else {
    selector = "div#tractstack-controller";
  }

  let animationIn = payload?.in[0],
      animationInSpeed = payload?.in[1],
      animationInDelay = payload?.in[2];

  if (typeof animationIn === "string") {
    css = `${css} ${selector} { height:100%; opacity: 0; animation-fill-mode: both; ` + `animation-name: ${animationIn}; -webkit-animation-name: ${animationIn}; `;

    if (typeof animationInSpeed === "number") {
      css = `${css} animation-duration: ${animationInSpeed}s; -webkit-animation-duration: ${animationInSpeed}s; `;
    }

    if (typeof animationInDelay === "number") {
      css = `${css} animation-delay: ${animationInDelay}s; `;
    }

    css = css + "}";
  }

  return css;
};

const TextShapeOutside = (shape, viewport, uuid) => {
  return SvgPane(shape, viewport, uuid, "shape-outside");
};

export { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, InjectSvgShape, TextShapeOutside, StyledWrapperDiv, StyledWrapperSection, PaneFragment, getStoryStepGraph, InjectCssAnimation, lispCallback, getCurrentPane, getScrollbarSize };
//# sourceMappingURL=helpers.js.map