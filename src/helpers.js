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

const lispCallback = (payload, context = "", useHookEndPoint) => {
  let lispData = payload[Object.keys(payload)[0]];
  let command = (lispData && lispData[0]) || false;
  let parameter_one, parameter_two, parameter_three;
  if (lispData && typeof lispData[1] === "object") {
    parameter_one = lispData[1][0] || false;
    parameter_two = lispData[1][1] || false;
    parameter_three = lispData[1][2] || false;
  }
  // now process the command
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
      if (
        parameter_one === "storyFragment" &&
        typeof parameter_two === "string"
      )
        useHookEndPoint("hookGotoStoryFragment", `/${parameter_two}`);
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
          // requires match on button's urlTarget === link's href
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
                fragment?.payload?.useHookEndPoint
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
                fragment?.payload?.useHookEndPoint(
                  "hookGotoStoryFragment",
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

const InjectSvgModal = (shape, options) => {
  // react fragment, not tractStackFragment
  let this_id = `${options?.id}-svg-modal`;
  let this_width = viewportWidth[options?.viewportKey];
  let css =
    `height: 100%; svg { width: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${options?.width}); ` +
    `margin-left: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${options?.padding_left}); ` +
    `margin-top: calc((100vw - (var(--offset) * 1px)) / ${this_width} * ${options?.padding_top}); ` +
    `z-index: ${options?.z_index - 2}; ` +
    `}`;
  let this_fragment = (
    <div className="paneFragmentModal">
      <div key={`modal-svg-${this_id}`} css={css} id={`c-${this_id}-container`}>
        {shape}
      </div>
    </div>
  );
  return { modal: this_fragment, id: this_id, css: css };
};

const InjectCssAnimation = (payload, paneFragmentId) => {
  let css = "",
    looped = "",
    opacity = "opacity:0;",
    selector_in,
    selector_out;
  if (paneFragmentId === "controller") {
    selector_in =
      "div#controller-container-minimized.visible,div#controller-container-expanded.visible";
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
    css =
      `${css} ${selector_in} { ${opacity} ${looped} animation-fill-mode: both; ` +
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
        `${css} ${selector_out} { ${opacity} animation-fill-mode: both; ` +
        `animation-name: fadeOut; -webkit-animation-name: fadeOut; ` +
        `animation-duration: 2s; -webkit-animation-duration: 2s; ` +
        `}`;
  }
  return css;
};

const InjectPaneFragment = (fragment, mode) => {
  if (!validateSchema(fragment)) return <></>;
  let this_id, this_fragment, css, child;
  switch (mode) {
    case "CodeHook":
      this_id = `${fragment?.id}-code-hook`;
      let code = fragment?.payload?.useHookEndPoint(
        "codeHook",
        fragment?.payload?.codeHooks
      );
      css = `${fragment?.css?.parent}`;
      this_fragment = (
        <div key={`fragment-code-${this_id}`} id={`c-${this_id}-container`}>
          {code}
        </div>
      );
      break;

    case "MarkdownParagraph":
      this_id = `${fragment?.id}-paragraph`;
      const paragraph = HtmlAstToReact(fragment);
      css = `height:100%; z-index: ${parseInt(fragment?.z_index)};`;
      if (typeof fragment?.css?.parent === "string")
        css = `${css} ${fragment?.css?.parent}`;
      if (typeof fragment?.css?.child === "string")
        css = `${css} ${fragment?.css?.child}`;
      let composed = (
        <div
          key={`fragment-paragraph-${this_id}`}
          id={`c-${this_id}-container`}
        >
          {paragraph}
        </div>
      );
      // inject textShapeOutside(s) (if available)
      if (
        fragment?.payload?.maskData &&
        Object.keys(fragment?.payload?.maskData).length &&
        typeof fragment?.payload?.maskData?.textShapeOutside?.left_mask ===
          "string" &&
        typeof fragment?.payload?.maskData?.textShapeOutside?.right_mask ===
          "string"
      ) {
        this_fragment = (
          <div className="paneFragmentParagraph">
            {fragment?.payload?.maskData?.textShapeOutside?.left}
            {fragment?.payload?.maskData?.textShapeOutside?.right}
            {composed}
          </div>
        );
        break;
      }
      // else render paragraph with shapeOutside
      this_fragment = <div className="paneFragmentParagraph">{composed}</div>;
      break;

    case "Shape":
      this_id = `${fragment?.id}-svg-shape`;
      css = `height:100%; z-index: ${parseInt(fragment?.z_index)};`;
      if (typeof fragment?.css?.parent === "string")
        css = `${css} ${fragment?.css?.parent}`;
      this_fragment = (
        <div key={`fragment-svg-${this_id}`} id={`c-${this_id}-container`}>
          {fragment?.payload?.shapeData}
        </div>
      );
      break;

    case "BackgroundImage":
      // always uses the first image only
      this_id = `${fragment?.id}-background-image`;
      const this_imageData = getImage(fragment?.payload?.imageData[0]?.data);
      const bgImage = convertToBgImage(this_imageData);
      css = `height:100%; z-index: ${parseInt(fragment?.z_index)}; `;
      if (typeof parent_css === "string")
        css = `${css} img {${fragment?.css?.parent}; }`;
      let this_object_fit = "cover";
      let this_background_position =
        fragment?.payload?.imageData[0]?.backgroundPosition || "center";
      child = (
        <div className="paneFragmentImage">
          <BackgroundImage
            id={`c-${this_id}-container-section`}
            Tag="section"
            style={{ backgroundPosition: this_background_position }}
            {...bgImage}
            objectFit={this_object_fit}
            preserveStackingContext
          >
            <div className="paneFragmentImage__inner">
              <GatsbyImage
                image={this_imageData}
                alt={fragment?.payload?.imageData[0]?.alt_text}
                style={{ backgroundPosition: this_background_position }}
                objectFit={this_object_fit}
              />
            </div>
          </BackgroundImage>
        </div>
      );
      this_fragment = (
        <div key={`fragment-image-${this_id}`} id={`c-${this_id}-container`}>
          {child}
        </div>
      );
      break;

    case "BackgroundVideo":
      this_id = `${fragment?.id}-background-video`;
      css = `height:100%; z-index: ${parseInt(
        fragment?.z_index
      )}; video{ object-fit: cover; } `;
      if (typeof parent_css === "string")
        css = `${css} ${fragment?.parent_css} `;
      if (typeof child_css === "string") css = `${css} ${fragment?.child_css}`;
      child = (
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
      this_fragment = (
        <div key={`fragment-video-${this_id}`} id={`c-${this_id}-container`}>
          {child}
        </div>
      );
      break;

    case "SvgSource":
      this_id = `${fragment?.id}-svg`;
      css = `height:100%; z-index: ${parseInt(fragment?.z_index)};`;
      if (typeof fragment?.css?.parent === "string")
        css = `${css} ${fragment?.css?.parent}`;
      child = (
        <img
          src={fragment?.payload?.imageData[0]?.url}
          alt={fragment?.payload?.imageData[0]?.alt_text}
          className="paneFragmentSvg"
        />
      );
      this_fragment = (
        <div
          key={`fragment-svgsource-${this_id}`}
          id={`c-${this_id}-container`}
        >
          {child}
        </div>
      );
      break;
  }
  return { fragment: this_fragment, id: this_id, css: css };
};

const getLogo = (field_svg_logo, field_image_logo) => {
  // svg or image logo?
  if (typeof field_svg_logo?.localFile?.publicURL === "string") {
    // svg logo
    let this_image_id = field_svg_logo?.id;
    let this_image = field_svg_logo?.localFile?.publicURL;
    return (
      <img
        key={this_image_id}
        src={this_image}
        className={`menu__logo`}
        alt="Logo"
      />
    );
  } else if (
    typeof field_image_logo?.localFile?.childImageSharp[viewportKey] !==
    "undefined"
  ) {
    let this_image_id = field_image_logo?.id;
    let this_image = field_image_logo?.localFile?.childImageSharp[viewportKey];
    // image logo
    return (
      <GatsbyImage
        key={this_image_id}
        className={`menu__logo`}
        alt="Logo"
        image={this_image}
        objectFit="contain"
      />
    );
  }
  return <></>;
};

const getIdHash = () => {
  return uuidv4();
};

const HasImageMask = {
  paragraph__background_video: ".paneFragmentVideo",
  paragraph__background_image: ".paneFragmentImage",
  paragraph__svg: ".paneFragmentSvg",
  paragraph__markdown: ".paneFragmentParagraph",
};

const HasPaneFragmentType = {
  paragraph__markdown: "MarkdownParagraph",
  paragraph__background_pane: "Shape",
  paragraph__background_image: "BackgroundImage",
  paragraph__background_video: "BackgroundVideo",
  paragraph__svg: "SvgSource",
  paragraph__d3: null,
  paragraph__h5p: null,
};

export {
  InjectSvgModal,
  InjectCssAnimation,
  StyledWrapperDiv,
  StyledWrapperSection,
  HasImageMask,
  HasPaneFragmentType,
  InjectPaneFragment,
  lispCallback,
  getScrollbarSize,
  thisViewportValue,
  viewportWidth,
  getLogo,
  getIdHash,
};
