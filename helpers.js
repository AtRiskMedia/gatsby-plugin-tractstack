function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from "react";
import ReactDOM from "react-dom";
import { sanitize } from "hast-util-sanitize";
import styled from "styled-components";
import { graphql, useStaticQuery, Link } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";
import Ajv from "ajv";
import { v4 as uuidv4 } from "uuid";
import { SvgPane, SvgModal, icon, wordmark } from "./shapes";
import { lispLexer } from "./lexer";
import { tractStackFragmentSchema } from "./schema";
const viewportWidth = {
  mobile: 600,
  tablet: 1080,
  desktop: 1920
};
const ajv = new Ajv();

const validateSchema = fragment => {
  let validate = ajv.compile(tractStackFragmentSchema);
  let valid = validate(fragment);

  if (!valid) {
    console.log("Render error in helpers.js > validateSchema:", validate.errors, fragment);
    return false;
  }

  return true;
};

const thisViewportValue = (viewport, value) => {
  return value[viewport];
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

const lispCallback = (payload, context = "", useHookEndPoint) => {
  let lispData = payload[Object.keys(payload)[0]];
  let command = lispData && lispData[0] || false;
  let parameter_one, parameter_two, parameter_three;

  if (lispData && typeof lispData[1] === "object") {
    parameter_one = lispData[1][0] || false;
    parameter_two = lispData[1][1] || false;
    parameter_three = lispData[1][2] || false;
  } // now process the command


  switch (command) {
    case "controller":
      switch (parameter_one) {
        case "expand":
        case "minimize":
          useHookEndPoint("hookController", parameter_one);
          break;
      }

      break;

    case "alert":
      alert(parameter_one);
      break;

    case "goto":
      if (parameter_one === "storyFragment" && typeof parameter_two === "string") useHookEndPoint("hookGotoStoryFragment", `/${parameter_two}`);

      if (parameter_one === "pane" && typeof parameter_two === "string") {
        useHookEndPoint("hookSetCurrentPane", parameter_two);
      }

      break;

    default:
      console.log("MISS on helpers.js lispCallback:", context, command);
  }
};

const HtmlAstToReact = (fragment, element = false) => {
  // recursive function
  let contents, raw_element, raw;
  if (element) raw = element;else if (typeof fragment?.children?.children === "object") raw = fragment?.children?.children;else return null;
  const composed = raw.map(e => {
    let this_id = uuidv4();
    if (e?.type === "text") return /*#__PURE__*/React.createElement("span", {
      key: this_id
    }, e?.value);

    switch (e?.tagName) {
      case "p":
        contents = e?.children?.map((p, i) => {
          // use recursion to compose the MarkdownParagraph
          return HtmlAstToReact(fragment, [p]);
        }); // is this an image? (only uses first image)

        if (contents && contents?.length && contents[0] && contents[0][0] && contents[0][0].props?.image) return /*#__PURE__*/React.createElement("div", {
          key: this_id
        }, contents[0][0]); // else it's a paragraph

        return /*#__PURE__*/React.createElement("div", {
          key: this_id
        }, /*#__PURE__*/React.createElement("p", null, contents));
        break;

      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        const Tag = e?.tagName;
        return /*#__PURE__*/React.createElement("div", {
          key: this_id
        }, /*#__PURE__*/React.createElement(Tag, null, e?.children[0].value));

      case "a":
        if (typeof e?.properties?.href === "string" && e?.children[0]?.type === "text" && typeof e?.children[0]?.value === "string") {
          // check for buttons action payload
          // requires match on button's urlTarget === link's href
          let is_button;

          if (typeof fragment?.payload?.buttonData === "object" && Object.keys(fragment?.payload?.buttonData).length) {
            let key = Object.keys(fragment?.payload?.buttonData).find(target => fragment?.payload?.buttonData[target]?.urlTarget === e?.properties?.href);
            is_button = fragment?.payload?.buttonData[key];
          }

          if (is_button) {
            // inject button with callback function, add css className
            let payload = is_button?.callbackPayload;
            let payload_ast = lispLexer(payload);

            function injectPayload() {
              lispCallback(payload_ast[0], "button", fragment?.payload?.useHookEndPoint);
            }

            return /*#__PURE__*/React.createElement("button", {
              key: this_id,
              className: is_button?.className,
              onClick: () => injectPayload()
            }, e?.children[0]?.value);
          } // else, treat at internal link
          // ...TODO: add check here and use a href for external links


          return /*#__PURE__*/React.createElement("a", {
            onClick: () => fragment?.payload?.useHookEndPoint("hookGotoStoryFragment", e?.properties?.href),
            key: this_id
          }, e?.children[0]?.value);
        }

        break;

      case "img":
        // is this case for gatsby image? = png, jpg ... != svg
        let pass = /\.[A-Za-z0-9]+$/;
        let extcheck = e?.properties?.src?.match(pass);

        if (extcheck && (extcheck[0] === ".png" || extcheck[0] === ".jpg")) {
          // imageData in this case is an array ... assumes image is first element
          let this_imageData = fragment?.payload?.imageData?.filter(image => image.filename === e?.properties?.src)[0]?.data?.childImageSharp?.gatsbyImageData;
          let objectFitMode;
          if (fragment?.mode === "paragraph__markdown") objectFitMode = "contain";else objectFitMode = "cover";
          let image = /*#__PURE__*/React.createElement(GatsbyImage, {
            key: this_id,
            alt: e?.properties?.alt,
            image: this_imageData,
            objectFit: objectFitMode
          });
          return image;
        }

        break;

      case "ul":
      case "ol":
        raw_element = e?.children.filter(e => !(e.type === "text" && e.value === "\n"));
        contents = HtmlAstToReact(fragment, raw_element);
        if (e?.tagName === "ol") contents = /*#__PURE__*/React.createElement("ol", null, contents);
        if (e?.tagName === "ul") contents = /*#__PURE__*/React.createElement("ul", null, contents);
        return /*#__PURE__*/React.createElement("div", {
          key: this_id
        }, contents);
        break;

      case "li":
        contents = e?.children?.map((li, i) => {
          return HtmlAstToReact(fragment, [li]);
        });
        return /*#__PURE__*/React.createElement("li", {
          key: this_id
        }, contents);
        break;

      case "br":
        return /*#__PURE__*/React.createElement("br", {
          key: this_id
        });

      case "em":
        if (typeof e?.children[0]?.value === "string") {
          return /*#__PURE__*/React.createElement("em", {
            key: this_id
          }, e?.children[0]?.value);
        }

        break;

      case "strong":
        if (typeof e?.children[0]?.value === "string") {
          return /*#__PURE__*/React.createElement("strong", {
            key: this_id
          }, e?.children[0]?.value);
        }

        break;

      case "blockquote":
        raw_element = e?.children.filter(e => !(e.type === "text" && e.value === "\n"));
        contents = HtmlAstToReact(fragment, raw_element);

        if (typeof e?.children[0]?.value === "string") {
          return /*#__PURE__*/React.createElement("blockquote", {
            key: this_id
          }, contents);
        }

        break;

      default:
        console.log("helpers.js: MISS on", e);
    }
  });
  return composed;
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
};

const InjectSvgModal = (shape, options) => {
  // react fragment, not tractStackFragment
  let this_id = `${options?.id}-svg-modal`;
  let this_width = viewportWidth[options?.viewportKey];
  let css = `svg { width: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${options?.width}); ` + `margin-left: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${options?.padding_left}); ` + `margin-top: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${options?.padding_top}); ` + `z-index: ${options?.z_index - 2}; ` + `}`;
  let fragment = PaneFragment(this_id, shape, css);
  return /*#__PURE__*/React.createElement("div", {
    className: "paneFragmentModal"
  }, fragment);
};

const getStoryStepGraph = (graph, targetId) => {
  return graph?.edges?.filter(e => e?.node?.id === targetId)[0];
};

const InjectCssAnimation = (payload, paneFragmentId) => {
  let css = "",
      looped = "",
      opacity = "opacity:0;",
      selector_in,
      selector_out;

  if (paneFragmentId === "controller") {
    selector_in = "div#controller-container-minimized.visible,div#controller-container-expanded.visible";
  } else if (paneFragmentId === "controller-expand") {
    selector_in = "div.controller__container--expand";
    opacity = "";
    looped = "animation-iteration-count: infinite;";
  } else if (paneFragmentId === "controller-minimize") {
    selector_in = "div.controller__container--minimize";
    opacity = "";
    looped = "animation-iteration-count: infinite;";
  } else {
    selector_in = `div#${paneFragmentId}.visible`;
    selector_out = `div#${paneFragmentId}.hidden`;
  }

  let animationIn = payload?.in[0],
      animationInSpeed = payload?.in[1],
      animationInDelay = payload?.in[2];

  if (typeof animationIn === "string") {
    css = `${css} ${selector_in} { ${opacity} ${looped} animation-fill-mode: both; ` + `animation-name: ${animationIn}; -webkit-animation-name: ${animationIn}; `;

    if (typeof animationInSpeed === "number") {
      css = `${css} animation-duration: ${animationInSpeed}s; -webkit-animation-duration: ${animationInSpeed}s; `;
    }

    if (typeof animationInDelay === "number") {
      css = `${css} animation-delay: ${animationInDelay}s; `;
    }

    css = css + "}";
    if (selector_out) css = `${css} ${selector_out} { ${opacity} animation-fill-mode: both; ` + `animation-name: fadeOut; -webkit-animation-name: fadeOut; ` + `animation-duration: 2s; -webkit-animation-duration: 2s; ` + `}`;
  }

  return css;
};

const InjectPaneFragment = (fragment, mode) => {
  if (!validateSchema(fragment)) return /*#__PURE__*/React.createElement(React.Fragment, null);
  let this_id, css, child;

  switch (mode) {
    case "MarkdownParagraph":
      this_id = `${fragment?.id}-paragraph`;
      const paragraph = HtmlAstToReact(fragment);
      css = `z-index: ${parseInt(fragment?.z_index)};`;
      if (typeof fragment?.css?.parent === "string") css = `${css} ${fragment?.css?.parent}`;
      if (typeof fragment?.css?.child === "string") css = `${css} ${fragment?.css?.child}`;
      let composed = PaneFragment(this_id, paragraph, css); // inject textShapeOutside(s) (if available)

      if (fragment?.payload?.maskData && Object.keys(fragment?.payload?.maskData).length && typeof fragment?.payload?.maskData?.textShapeOutside?.left_mask === "string" && typeof fragment?.payload?.maskData?.textShapeOutside?.right_mask === "string") {
        return /*#__PURE__*/React.createElement("div", {
          className: "paneFragmentParagraph"
        }, fragment?.payload?.maskData?.textShapeOutside?.left, fragment?.payload?.maskData?.textShapeOutside?.right, composed);
      } // else render paragraph with shapeOutside


      return /*#__PURE__*/React.createElement("div", {
        className: "paneFragmentParagraph"
      }, composed);

    case "Shape":
      this_id = `${fragment?.id}-svg-shape`;
      css = `z-index: ${parseInt(fragment?.z_index)};`;
      if (typeof fragment?.css?.parent === "string") css = `${css} ${fragment?.css?.parent}`;
      return PaneFragment(this_id, fragment?.payload?.shapeData, css);

    case "BackgroundImage":
      // always uses the first image only
      this_id = `${fragment?.id}-background-image`;
      const this_imageData = getImage(fragment?.payload?.imageData[0]?.data);
      const bgImage = convertToBgImage(this_imageData);
      css = `z-index: ${parseInt(fragment?.z_index)}; section { height:100%; } `;
      if (typeof parent_css === "string") css = `${css} img {${fragment?.css?.parent}; }`;
      let this_object_fit = "cover";
      let this_background_position = fragment?.payload?.imageData[0]?.backgroundPosition || "center"; // TODO: background position isn't actually working

      let child = /*#__PURE__*/React.createElement("div", {
        className: "paneFragmentImage"
      }, /*#__PURE__*/React.createElement(BackgroundImage, _extends({
        Tag: "section",
        style: {
          backgroundPosition: this_background_position
        }
      }, bgImage, {
        objectFit: this_object_fit,
        preserveStackingContext: true
      }), /*#__PURE__*/React.createElement("div", {
        className: "paneFragmentImage__inner"
      }, /*#__PURE__*/React.createElement(GatsbyImage, {
        image: this_imageData,
        alt: fragment?.payload?.imageData[0]?.alt_text,
        style: {
          backgroundPosition: this_background_position
        },
        objectFit: this_object_fit
      }))));
      return PaneFragment(this_id, child, css);

    case "BackgroundVideo":
      this_id = `${fragment?.id}-background-video`;
      css = `z-index: ${parseInt(fragment?.z_index)}; video{ object-fit: cover; } `;
      if (typeof parent_css === "string") css = `${css} ${fragment?.parent_css} `;
      if (typeof child_css === "string") css = `${css} ${fragment?.child_css}`;
      child = /*#__PURE__*/React.createElement("video", {
        autoPlay: true,
        muted: true,
        loop: true,
        title: fragment?.payload?.videoData?.alt_text,
        className: "paneFragmentVideo"
      }, /*#__PURE__*/React.createElement("source", {
        src: fragment?.payload?.videoData?.url,
        type: "video/mp4"
      }));
      return PaneFragment(this_id, child, css);

    case "SvgSource":
      this_id = `${fragment?.id}-svg`;
      css = `z-index: ${parseInt(fragment?.z_index)};`;
      if (typeof fragment?.css?.parent === "string") css = `${css} ${fragment?.css?.parent}`;
      child = /*#__PURE__*/React.createElement("img", {
        src: fragment?.payload?.imageData[0]?.url,
        alt: fragment?.payload?.imageData[0]?.alt_text,
        className: "paneFragmentSvg"
      });
      return PaneFragment(this_id, child, css);
  }
};

const HasImageMask = {
  paragraph__background_video: ".paneFragmentVideo",
  paragraph__background_image: ".paneFragmentImage",
  paragraph__svg: ".paneFragmentSvg",
  paragraph__markdown: ".paneFragmentParagraph"
};
const HasPaneFragmentType = {
  paragraph__markdown: "MarkdownParagraph",
  paragraph__background_pane: "Shape",
  paragraph__background_image: "BackgroundImage",
  paragraph__background_video: "BackgroundVideo",
  paragraph__svg: "SvgSource",
  paragraph__d3: null,
  paragraph__h5p: null
};
export { InjectSvgModal, InjectCssAnimation, StyledWrapperDiv, StyledWrapperSection, PaneFragment, HasImageMask, HasPaneFragmentType, InjectPaneFragment, getStoryStepGraph, lispCallback, getScrollbarSize, thisViewportValue, viewportWidth };
//# sourceMappingURL=helpers.js.map