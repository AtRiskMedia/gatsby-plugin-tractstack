import React from "react";
import { sanitize } from "hast-util-sanitize";
import styled from "styled-components";
import { graphql, useStaticQuery, Link } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";
import Ajv from "ajv";
import { v4 as uuidv4 } from "uuid";
import { SvgPane, SvgModal } from "./shapes";
import { lispLexer } from "./lexer";
import { tractStackFragmentSchema } from "./schema";

const viewportWidth = {
  mobile: 600,
  tablet: 1080,
  desktop: 1920,
};

const ajv = new Ajv();
const validateSchema = (fragment) => {
  let validate = ajv.compile(tractStackFragmentSchema);
  let valid = validate(fragment);
  if (!valid) {
    console.log(
      "Render error in helpers.js > validateSchema:",
      validate.errors,
      fragment
    );
    return false;
  }
  return true;
};

const thisViewportValue = (viewport, value) => {
  return value[viewport];
};

const getCurrentPane = (paneId = "", panes = []) => {
  if (!paneId) return panes[0];
  // return first element in panes
  return paneId;
};

// from https://tobbelindstrom.com/blog/measure-scrollbar-width-and-height/
const getScrollbarSize = () => {
  if (typeof window !== "undefined") {
    const { body } = document;
    const scrollDiv = document.createElement("div");

    // Append element with defined styling
    scrollDiv.setAttribute(
      "style",
      "width: 1337px; height: 1337px; position: absolute; left: -9999px; overflow: scroll;"
    );
    body.appendChild(scrollDiv);

    // Collect width & height of scrollbar
    const calculateValue = (type) =>
      scrollDiv[`offset${type}`] - scrollDiv[`client${type}`];
    const scrollbarWidth = calculateValue("Width");

    // Remove element
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
  }
  // now process the command
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
          console.log(`todo: add ${icon} icon to controller`);
          // TODO: do something with the icon
          break;

        case "paneHidden":
          // process as "icon" function
          icon = parameter_one;
          command = parameter_two[0];
          parameter_one = parameter_two[1];
          parameter_two = parameter_three;
          parameter_three = false;
          console.log(`todo: remove ${icon} icon to controller`);
          // TODO: do something with the icon
          break;
      }
      break;

    case "alert":
      alert(parameter_one);
      break;

    case "goto":
      // calls hooks.hookGotoStoryFragment for gatsby navigate
      if (
        parameter_one === "storyFragment" &&
        typeof parameter_two === "string"
      )
        hooks.hookGotoStoryFragment(`/${parameter_two}`);
      if (parameter_one === "pane" && typeof parameter_two === "string")
        hooks.hookSetCurrentPane(parameter_two);
      break;

    default:
      console.log("MISS on helpers.js lispCallback:", context, command);
  }
};

const HtmlAstToReact = (fragment, element = false) => {
  // recursive function
  let contents, raw_element, raw;
  if (element) raw = element;
  else if (typeof fragment?.children?.children === "object")
    raw = fragment?.children?.children;
  else return null;
  const composed = raw.map((e) => {
    let this_id = uuidv4();
    if (e?.type === "text") return <span key={this_id}>{e?.value}</span>;
    switch (e?.tagName) {
      case "p":
        contents = e?.children?.map((p, i) => {
          // use recursion to compose the MarkdownParagraph
          return HtmlAstToReact(fragment, [p]);
        });
        // is this an image? (only uses first image)
        if (
          contents &&
          contents?.length &&
          contents[0] &&
          contents[0][0] &&
          contents[0][0].props?.image
        )
          return <div key={this_id}>{contents[0][0]}</div>;
        // else it's a paragraph
        return (
          <div key={this_id}>
            <p>{contents}</p>
          </div>
        );
        break;

      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        const Tag = e?.tagName;
        return (
          <div key={this_id}>
            <Tag>{e?.children[0].value}</Tag>
          </div>
        );

      case "a":
        if (
          typeof e?.properties?.href === "string" &&
          e?.children[0]?.type === "text" &&
          typeof e?.children[0]?.value === "string"
        ) {
          // check for buttons action payload
          let is_button;
          if (
            typeof fragment?.payload?.buttonData === "object" &&
            Object.keys(fragment?.payload?.buttonData).length
          ) {
            let key = Object.keys(fragment?.payload?.buttonData).find(
              (target) =>
                fragment?.payload?.buttonData[target]?.urlTarget ===
                e?.properties?.href
            );
            is_button = fragment?.payload?.buttonData[key];
          }
          if (is_button) {
            // inject button with callback function, add css className
            let payload = is_button?.callbackPayload;
            let payload_ast = lispLexer(payload);
            function injectPayload() {
              lispCallback(
                payload_ast[0],
                "button",
                fragment?.payload?.hooksData
              );
            }
            return (
              <button
                key={this_id}
                className={is_button?.className}
                onClick={() => injectPayload()}
              >
                {e?.children[0]?.value}
              </button>
            );
          }
          // else, treat at internal link
          // ...TODO: add check here and use a href for external links
          return (
            <a
              onClick={() =>
                fragment?.payload?.hooksData?.hookGotoStoryFragment(
                  e?.properties?.href
                )
              }
              key={this_id}
            >
              {e?.children[0]?.value}
            </a>
          );
        }
        break;

      case "img":
        // is this case for gatsby image? = png, jpg ... != svg
        let pass = /\.[A-Za-z0-9]+$/;
        let extcheck = e?.properties?.src?.match(pass);
        if (extcheck && (extcheck[0] === ".png" || extcheck[0] === ".jpg")) {
          // imageData in this case is an array ... assumes image is first element
          let this_imageData = fragment?.payload?.imageData?.filter(
            (image) => image.filename === e?.properties?.src
          )[0]?.data?.childImageSharp?.gatsbyImageData;
          let objectFitMode;
          if (fragment?.mode === "paragraph__markdown")
            objectFitMode = "contain";
          else objectFitMode = "cover";
          let image = (
            <GatsbyImage
              key={this_id}
              alt={e?.properties?.alt}
              image={this_imageData}
              objectFit={objectFitMode}
            />
          );
          return image;
        }
        break;

      case "ul":
      case "ol":
        raw_element = e?.children.filter(
          (e) => !(e.type === "text" && e.value === "\n")
        );
        contents = HtmlAstToReact(fragment, raw_element);
        if (e?.tagName === "ol") contents = <ol>{contents}</ol>;
        if (e?.tagName === "ul") contents = <ul>{contents}</ul>;
        return <div key={this_id}>{contents}</div>;
        break;

      case "li":
        contents = e?.children?.map((li, i) => {
          return HtmlAstToReact(fragment, [li]);
        });
        return <li key={this_id}>{contents}</li>;
        break;

      case "br":
        return <br key={this_id} />;

      case "em":
        if (typeof e?.children[0]?.value === "string") {
          return <em key={this_id}>{e?.children[0]?.value}</em>;
        }
        break;

      case "strong":
        if (typeof e?.children[0]?.value === "string") {
          return <strong key={this_id}>{e?.children[0]?.value}</strong>;
        }
        break;

      case "blockquote":
        raw_element = e?.children.filter(
          (e) => !(e.type === "text" && e.value === "\n")
        );
        contents = HtmlAstToReact(fragment, raw_element);
        if (typeof e?.children[0]?.value === "string") {
          return <blockquote key={this_id}>{contents}</blockquote>;
        }
        break;

      default:
        console.log("helpers.js: MISS on", e);
    }
  });
  return composed;
};

const StyledWrapperDiv = styled.div`
  ${(props) => props.css};
`;
const StyledWrapperSection = styled.section`
  ${(props) => props.css};
`;

const TextShapeOutside = (shape, viewport) => {
  return SvgPane(shape, viewport, "shape-outside");
};

const PaneFragment = (id, child, css) => {
  let this_css = `height:100%; ${css}`;
  return (
    <StyledWrapperDiv key={id} css={this_css}>
      {child}
    </StyledWrapperDiv>
  );
};

const InjectSvgModal = (shape, options) => {
  // react fragment, not tractStackFragment
  let this_id = `${options?.id}-svg-modal`;

  let css =
    `svg { width: calc((100vw - (var(--offset) * 1px)) / ${options?.viewport?.width} * ${options?.width}); ` +
    `margin-left: calc((100vw - (var(--offset) * 1px)) / ${options?.viewport?.width} * ${options?.padding_left}); ` +
    `margin-top: calc((100vw - (var(--offset) * 1px)) / ${options?.viewport?.width} * ${options?.padding_top}); ` +
    `z-index: ${options?.z_index - 2}; ` +
    `}`;
  let fragment = PaneFragment(this_id, shape, css);
  return <div className="paneFragmentModal">{fragment}</div>;
};

const InjectSvgShape = (fragment) => {
  if (!validateSchema(fragment)) return <></>;
  let this_id = `${fragment?.id}-svg-shape`;
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof fragment?.css?.parent === "string")
    css = `${css} ${fragment?.css?.parent}`;
  return PaneFragment(this_id, fragment?.payload?.paneData, css);
};

const InjectSvg = (fragment) => {
  if (!validateSchema(fragment)) return <></>;
  let this_id = `${fragment?.id}-svg`;
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof fragment?.css?.parent === "string")
    css = `${css} ${fragment?.css?.parent}`;
  let child = (
    <img
      src={fragment?.payload?.imageData[0]?.url}
      alt={fragment?.payload?.imageData[0]?.alt_text}
      className="paneFragmentSvg"
    />
  );
  return PaneFragment(this_id, child, css);
};

const InjectGatsbyBackgroundImage = (fragment) => {
  if (!validateSchema(fragment)) return <></>;
  // always uses the first image only
  let this_id = `${fragment?.id}-background-image`;
  const this_imageData = getImage(fragment?.payload?.imageData[0]?.data);
  const bgImage = convertToBgImage(this_imageData);
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof parent_css === "string")
    css = `${css} img {${fragment?.css?.parent}}`;
  let child = (
    <div className="paneFragmentImage">
      <BackgroundImage
        Tag="section"
        {...bgImage}
        objectFit="cover"
        preserveStackingContext
      >
        <div>
          <GatsbyImage
            image={this_imageData}
            alt={fragment?.payload?.imageData[0]?.alt_text}
            objectFit="cover"
          />
        </div>
      </BackgroundImage>
    </div>
  );
  return PaneFragment(this_id, child, css);
};

const InjectGatsbyBackgroundVideo = (fragment) => {
  if (!validateSchema(fragment)) return <></>;
  let this_id = `${fragment?.id}-background-video`;
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof parent_css === "string") css = `${css} ${fragment?.parent_css}`;
  if (typeof child_css === "string") css = `${css} ${fragment?.child_css}`;
  let child = (
    <video
      autoPlay={true}
      muted
      loop
      title={fragment?.payload?.videoData?.alt_text}
      className="paneFragmentVideo"
    >
      <source src={fragment?.payload?.videoData?.url} type="video/mp4" />
    </video>
  );
  return PaneFragment(this_id, child, css);
};

const MarkdownParagraph = (fragment) => {
  if (!validateSchema(fragment)) return <></>;
  let this_id = `${fragment?.id}-paragraph`;
  const paragraph = HtmlAstToReact(fragment);
  let css = `z-index: ${parseInt(fragment?.z_index)};`;
  if (typeof fragment?.css?.parent === "string")
    css = `${css} ${fragment?.css?.parent}`;
  if (typeof fragment?.css?.child === "string")
    css = `${css} ${fragment?.css?.child}`;
  let composed = PaneFragment(this_id, paragraph, css);
  // inject textShapeOutside(s) (if available)
  if (
    fragment?.payload?.maskData &&
    Object.keys(fragment?.payload?.maskData).length &&
    typeof fragment?.payload?.maskData?.textShapeOutside?.left_mask ===
      "string" &&
    typeof fragment?.payload?.maskData?.textShapeOutside?.right_mask ===
      "string"
  ) {
    return (
      <div className="paneFragmentParagraph">
        {fragment?.payload?.maskData?.textShapeOutside?.left}
        {fragment?.payload?.maskData?.textShapeOutside?.right}
        {composed}
      </div>
    );
  }
  // else render paragraph with shapeOutside
  return <div className="paneFragmentParagraph">{composed}</div>;
};

const getStoryStepGraph = (graph, targetId) => {
  return graph?.edges?.filter((e) => e?.node?.id === targetId)[0];
};

const InjectCssAnimation = (payload, paneFragmentId) => {
  let css = "",
    selector_in,
    selector_out;
  if (paneFragmentId !== "tractstack-controller") {
    selector_in = `div#${paneFragmentId}.visible`;
    selector_out = `div#${paneFragmentId}.hidden`;
  } else {
    selector_in = "div#tractstack-controller";
  }
  let animationIn = payload?.in[0],
    animationInSpeed = payload?.in[1],
    animationInDelay = payload?.in[2];
  if (typeof animationIn === "string") {
    css =
      `${css} ${selector_in} { height:100%; opacity:0; animation-fill-mode: both; ` +
      `animation-name: ${animationIn}; -webkit-animation-name: ${animationIn}; `;
    if (typeof animationInSpeed === "number") {
      css = `${css} animation-duration: ${animationInSpeed}s; -webkit-animation-duration: ${animationInSpeed}s; `;
    }
    if (typeof animationInDelay === "number") {
      css = `${css} animation-delay: ${animationInDelay}s; `;
    }
    css = css + "}";
    if (selector_out)
      css =
        `${css} ${selector_out} { height:100%; opacity:0; animation-fill-mode: both; ` +
        `animation-name: fadeOut; -webkit-animation-name: fadeOut; ` +
        `animation-duration: 1s; -webkit-animation-duration: 1s; ` +
        `}`;
  }
  return css;
};

export {
  MarkdownParagraph,
  InjectGatsbyBackgroundImage,
  InjectGatsbyBackgroundVideo,
  InjectSvg,
  InjectSvgShape,
  InjectSvgModal,
  TextShapeOutside,
  StyledWrapperDiv,
  StyledWrapperSection,
  PaneFragment,
  getStoryStepGraph,
  InjectCssAnimation,
  lispCallback,
  getCurrentPane,
  getScrollbarSize,
  thisViewportValue,
  viewportWidth,
};
