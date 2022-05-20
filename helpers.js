function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React from "react";
import { sanitize } from "hast-util-sanitize";
import styled from "styled-components";
import { graphql, useStaticQuery, Link } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";
import Ajv from "ajv";
import { SvgPane } from "./shapes";
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
};

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

const HtmlAstToReact = (fragment, depth = 0, element = false) => {
  // recursive function
  let contents,
      raw,
      raw_element,
      this_key = `${fragment?.id}-${depth}`;
  if (depth) raw = element;else if (typeof fragment?.children?.children === "object") raw = fragment?.children?.children;else return null;
  const composed = raw.map(e => {
    if (e?.type === "text") return /*#__PURE__*/React.createElement("span", {
      key: this_key
    }, e?.value);

    switch (e?.tagName) {
      case "p":
        contents = e?.children?.map((p, i) => {
          // use recursion to compose the MarkdownParagraph
          depth = depth + 1;
          return HtmlAstToReact(fragment, depth, [p]);
        });
        this_key = `${fragment?.id}-${depth}`; // is this an image? (only uses first image)

        if (contents && contents?.length && contents[0] && contents[0][0] && contents[0][0].props?.image) return /*#__PURE__*/React.createElement("div", {
          key: this_key
        }, contents[0][0]); // else it's a paragraph

        return /*#__PURE__*/React.createElement("div", {
          key: this_key
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
          key: this_key
        }, /*#__PURE__*/React.createElement(Tag, null, e?.children[0].value));

      case "a":
        if (typeof e?.properties?.href === "string" && e?.children[0]?.type === "text" && typeof e?.children[0]?.value === "string") {
          // check for buttons action payload
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
              lispCallback(payload_ast[0], "button", fragment?.payload?.hooksData);
            }

            return /*#__PURE__*/React.createElement("button", {
              key: this_key,
              className: is_button?.className,
              onClick: () => injectPayload()
            }, e?.children[0]?.value);
          } // else, treat at internal link
          // ...TODO: add check here and use a href for external links


          return /*#__PURE__*/React.createElement("a", {
            onClick: () => fragment?.payload?.hooksData?.hookGotoStoryFragment(e?.properties?.href),
            key: this_key
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
            key: this_key,
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
        if (e?.tagName === "ol") list = /*#__PURE__*/React.createElement("ol", null, contents);
        if (e?.tagName === "ul") list = /*#__PURE__*/React.createElement("ul", null, contents);
        return /*#__PURE__*/React.createElement("div", {
          key: this_key
        }, list);
        break;

      case "li":
        contents = e?.children?.map((li, i) => {
          depth = depth + 1;
          return HtmlAstToReact(fragment, depth, [li]);
        });
        this_key = `${fragment?.id}-${depth}`;
        return /*#__PURE__*/React.createElement("li", {
          key: this_key
        }, contents);
        break;

      case "br":
        return /*#__PURE__*/React.createElement("br", {
          key: this_key
        });

      case "em":
        if (typeof e?.children[0]?.value === "string") {
          return /*#__PURE__*/React.createElement("em", {
            key: this_key
          }, e?.children[0]?.value);
        }

        break;

      case "strong":
        if (typeof e?.children[0]?.value === "string") {
          return /*#__PURE__*/React.createElement("strong", {
            key: this_key
          }, e?.children[0]?.value);
        }

        break;

      case "blockquote":
        raw_element = e?.children.filter(e => !(e.type === "text" && e.value === "\n"));
        depth = depth + 1;
        contents = HtmlAstToReact(fragment, depth, raw_element);

        if (typeof e?.children[0]?.value === "string") {
          this_key = `${fragment?.id}-${depth}`;
          return /*#__PURE__*/React.createElement("blockquote", {
            key: this_key
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

const TextShapeOutside = (shape, viewport) => {
  return SvgPane(shape, viewport, "shape-outside");
};

const PaneFragment = (id, child, css) => {
  let this_css = `height:100%; ${css}`;
  return /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    key: id,
    css: this_css
  }, child);
};

const InjectSvgShape = fragment => {
  if (!validateSchema(fragment)) return /*#__PURE__*/React.createElement(React.Fragment, null);
  let this_id = `${fragment?.id}-svg-shape`;
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof fragment?.css?.parent === "string") css = `${css} ${fragment?.css?.parent}`;
  return PaneFragment(this_id, fragment?.children, css);
};

const InjectSvg = fragment => {
  if (!validateSchema(fragment)) return /*#__PURE__*/React.createElement(React.Fragment, null);
  let this_id = `${fragment?.id}-svg`;
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof fragment?.css?.parent === "string") css = `${css} ${fragment?.css?.parent}`;
  let child = /*#__PURE__*/React.createElement("img", {
    src: fragment?.payload?.imageData?.url,
    alt: fragment?.payload?.imageData?.alt_text,
    className: "paneFragmentSvg"
  });
  return PaneFragment(this_id, fragment?.children, css);
};

const InjectGatsbyBackgroundImage = fragment => {
  if (!validateSchema(fragment)) return /*#__PURE__*/React.createElement(React.Fragment, null); // always uses the first image only

  let this_id = `${fragment?.id}-background-image`;
  const this_imageData = getImage(fragment?.payload?.imageData[0]?.data);
  const bgImage = convertToBgImage(this_imageData);
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof parent_css === "string") css = `${css} img {${fragment?.css?.parent}}`;
  let child = /*#__PURE__*/React.createElement("div", {
    className: "paneFragmentImage"
  }, /*#__PURE__*/React.createElement(BackgroundImage, _extends({
    Tag: "section"
  }, bgImage, {
    preserveStackingContext: true
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(GatsbyImage, {
    image: this_imageData,
    alt: fragment?.payload?.imageData[0]?.alt_text,
    objectFit: "cover"
  }))));
  return PaneFragment(this_id, child, css);
};

const InjectGatsbyBackgroundVideo = fragment => {
  if (!validateSchema(fragment)) return /*#__PURE__*/React.createElement(React.Fragment, null);
  let this_id = `${fragment?.id}-background-video`;
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof parent_css === "string") css = `${css} ${fragment?.parent_css}`;
  if (typeof child_css === "string") css = `${css} ${fragment?.child_css}`;
  let child = /*#__PURE__*/React.createElement("video", {
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
};

const MarkdownParagraph = fragment => {
  if (!validateSchema(fragment)) return /*#__PURE__*/React.createElement(React.Fragment, null);
  let this_id = `${fragment?.id}-paragraph`;
  const paragraph = HtmlAstToReact(fragment);
  let has_shape_outside,
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

export { MarkdownParagraph, InjectGatsbyBackgroundImage, InjectGatsbyBackgroundVideo, InjectSvg, InjectSvgShape, TextShapeOutside, StyledWrapperDiv, StyledWrapperSection, PaneFragment, getStoryStepGraph, InjectCssAnimation, lispCallback, getCurrentPane, getScrollbarSize, thisViewportValue, viewportWidth };
//# sourceMappingURL=helpers.js.map