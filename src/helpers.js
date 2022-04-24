import React from "react";
import { sanitize } from "hast-util-sanitize";
import styled from "styled-components";
import { graphql, useStaticQuery, Link } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";
import { SvgPane } from "./shapes.js";

const HtmlAstToReact = (children, imageData = [], naked = false) => {
  // recursive function
  // breaks gatsby images free of enclosing p tag
  let contents, raw;
  const fragment = children.map((e, index) => {
    if (e?.type === "text") return <span key={index}>{e?.value}</span>;
    switch (e?.tagName) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        const Tag = e?.tagName;
        return (
          <div key={index}>
            <Tag>{e?.children[0].value}</Tag>
          </div>
        );

      case "br":
        return <br key={index} />;

      case "em":
        if (typeof e?.children[0]?.value === "string") {
          return <em key={index}>{e?.children[0]?.value}</em>;
        }
        break;

      case "strong":
        if (typeof e?.children[0]?.value === "string") {
          return <strong key={index}>{e?.children[0]?.value}</strong>;
        }
        break;

      case "a":
        if (
          typeof e?.properties?.href === "string" &&
          e?.children[0]?.type === "text" &&
          typeof e?.children[0]?.value === "string"
        ) {
          // is this an internal link?
          // TODO
          return (
            <Link to={e?.properties?.href} key={index}>
              {e?.children[0]?.value}
            </Link>
          );
        }
        break;

      case "img":
        // is this case for gatsby image? = png, jpg ... != svg
        let pass = /\.[A-Za-z0-9]+$/;
        let extcheck = e?.properties?.src?.match(pass);
        if (extcheck && (extcheck[0] === ".png" || extcheck[0] === ".jpg")) {
          // imageData in this case is an array ... must find correct element
          let this_imageData = imageData.filter(
            (image) => image.filename === e?.properties?.src
          )[0]?.localFile?.childImageSharp?.gatsbyImageData;
          return (
            <GatsbyImage
              key={index}
              alt={e?.properties?.alt}
              image={this_imageData}
            />
          );
        }
        break;

      case "p":
        contents = e?.children?.map((p, i) => {
          // use recursion to compose the MarkdownParagraph
          return HtmlAstToReact([p], imageData);
        });
        // is this an image?
        if (contents.length === 1 && contents[0][0].props?.image) {
          return <div key={index}>{contents[0][0]}</div>;
        }
        return (
          <div key={index}>
            <p>{contents}</p>
          </div>
        );

      case "ul":
      case "ol":
        raw = e?.children.filter(
          (e) => !(e.type === "text" && e.value === "\n")
        );
        contents = HtmlAstToReact(raw, imageData);
        let list;
        if (e?.tagName === "ol") list = <ol>{contents}</ol>;
        if (e?.tagName === "ul") list = <ul>{contents}</ul>;
        return <div key={index}>{list}</div>;

      case "li":
        contents = e?.children?.map((li, i) => {
          // use recursion to compose the MarkdownParagraph
          return HtmlAstToReact([li], imageData);
        });
        return <li key={index}>{contents}</li>;

      case "blockquote":
        raw = e?.children.filter(
          (e) => !(e.type === "text" && e.value === "\n")
        );
        let contents = HtmlAstToReact(raw, imageData);
        if (typeof e?.children[0]?.value === "string") {
          return <blockquote key={index}>{contents}</blockquote>;
        }
        break;

      default:
        console.log("helpers.js: MISS on", e);
    }
  });
  return fragment;
};

const StyledWrapperDiv = styled.div`
  ${(props) => props.css};
`;
const StyledWrapperSection = styled.section`
  ${(props) => props.css};
`;

const PaneFragment = (id, child, css) => {
  return (
    <StyledWrapperDiv key={id} css={css}>
      {child}
    </StyledWrapperDiv>
  );
};

// pre-rendered svg shapes for each viewport
// TODO
// will rely on shapes.js
const InjectSvgShape = (id, shape, viewport, parent_css, zIndex) => {
  let css = `${parent_css} z-index: ${parseInt(zIndex)};`;
  let child = SvgPane(shape, viewport);
  return PaneFragment(id, child, css);
};

const InjectSvg = (id, url, alt_text, parent_css, zIndex) => {
  let css = `${parent_css} z-index: ${parseInt(zIndex)};`;
  let child = <img src={url} alt={alt_text} className="paneFragmentCSS" />;
  return PaneFragment(id, child, css);
};

const InjectGatsbyBackgroundImage = (
  id,
  imageData,
  alt_text,
  parent_css = "",
  zIndex
) => {
  const this_imageData = getImage(imageData);
  const bgImage = convertToBgImage(this_imageData);

  let css = `z-index: ${parseInt(zIndex)}; img { ${parent_css} }`;
  let child = (
    <BackgroundImage Tag="section" {...bgImage} preserveStackingContext>
      <div className="paneFragmentImage">
        <GatsbyImage image={this_imageData} alt={alt_text} />
      </div>
    </BackgroundImage>
  );
  return PaneFragment(id, child, css);
};

const InjectGatsbyBackgroundVideo = (
  id,
  url,
  alt_text,
  parent_css = "",
  child_css = "",
  zIndex
) => {
  let css = `${parent_css} z-index: ${parseInt(zIndex)}; ${child_css}`;
  let child = (
    <video
      autoPlay={true}
      muted
      loop
      id={id}
      title={alt_text}
      className="paneFragmentVideo"
    >
      <source src={url} type="video/mp4" />
    </video>
  );
  return PaneFragment(id, child, css);
};

const MarkdownParagraph = (
  id,
  htmlAst,
  imageData = [],
  parent_css = "",
  child_css = "",
  zIndex
) => {
  const paragraph = HtmlAstToReact(htmlAst?.children, imageData);
  const css = `${parent_css} z-index: ${parseInt(zIndex)}; ${child_css}`;
  return PaneFragment(id, paragraph, css);
};

const getStoryStepGraph = (graph, targetId) => {
  return graph?.edges?.filter((e) => e?.node?.id === targetId)[0];
};

export {
  MarkdownParagraph,
  InjectGatsbyBackgroundImage,
  InjectGatsbyBackgroundVideo,
  InjectSvg,
  InjectSvgShape,
  StyledWrapperDiv,
  StyledWrapperSection,
  PaneFragment,
  getStoryStepGraph,
};
