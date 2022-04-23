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
    if (e?.type === "text") return <span key={index}>{e?.value}</span>;
    switch (e?.tagName) {
      case "h1":
        return (
          <div key={index}>
            <h1>{e?.children[0].value}</h1>
          </div>
        );
      case "h2":
        return (
          <div key={index}>
            <h2>{e?.children[0].value}</h2>
          </div>
        );
      case "h3":
        return (
          <div key={index}>
            <h3>{e?.children[0].value}</h3>
          </div>
        );
      case "h4":
        return (
          <div key={index}>
            <h4>{e?.children[0].value}</h4>
          </div>
        );
      case "h5":
        return (
          <div key={index}>
            <h5>{e?.children[0].value}</h5>
          </div>
        );
      case "h6":
        return (
          <div key={index}>
            <h6>{e?.children[0].value}</h6>
          </div>
        );

      case "p":
        let breakout = false;
        contents = e?.children?.map((p, i) => {
          if (p?.type === "text") {
            let value = p?.value?.replace(/\r?\n|\r/g, "");
            if (value.length) return <span key={i}>{value}</span>;
          }
          if (p?.type === "element") {
            // determine which element ... could be p, img, br, a, ?
            switch (p?.tagName) {
              case "br":
                return <br key={i} />;

              case "em":
                if (typeof p?.children[0]?.value === "string") {
                  return <em key={i}>{p?.children[0]?.value}</em>;
                }
                break;

              case "strong":
                if (typeof p?.children[0]?.value === "string") {
                  return <strong key={i}>{p?.children[0]?.value}</strong>;
                }
                break;

              case "a":
                if (
                  typeof p?.properties?.href === "string" &&
                  p?.children[0]?.type === "text" &&
                  typeof p?.children[0]?.value === "string"
                ) {
                  // is this an internal link?
                  // TODO
                  return (
                    <Link to={p?.properties?.href} key={i}>
                      {p?.children[0]?.value}
                    </Link>
                  );
                }
                break;

              case "img":
                // is this case for gatsby image? = png, jpg ... != svg
                let pass = /\.[A-Za-z0-9]+$/;
                let extcheck = p?.properties?.src?.match(pass);
                if (
                  extcheck &&
                  (extcheck[0] === ".png" || extcheck[0] === ".jpg")
                ) {
                  // imageData in this case is an array ... must find correct element
                  let this_imageData = imageData.filter(
                    (image) => image.filename === p?.properties?.src
                  )[0]?.localFile?.childImageSharp?.gatsbyImageData;
                  breakout = true;
                  return (
                    <GatsbyImage
                      key={i}
                      alt={p?.properties?.alt}
                      image={this_imageData}
                    />
                  );
                }
                break;

              default:
                console.log("helpers.js > p: MISS on", p?.tagName);
            }
            // use recursion to compose the MarkdownParagraph
            return HtmlAstToReact(p?.children, imageData);
          }
        });
        // breakout is true when contents is gatsby image
        if (breakout) return <div key={index}>{contents}</div>;
        return (
          <div key={index}>
            <p>{contents}</p>
          </div>
        );

      case "ul":
      case "ol":
        contents = e?.children?.map((li, i) => {
          if (li?.type === "element") {
            // assumes link contains text only
            return <li key={i}>{li?.children[0].value}</li>;
          }
        });
        let list;
        if (e?.tagName === "ol") list = <ol>{contents}</ol>;
        if (e?.tagName === "ul") list = <ul>{contents}</ul>;
        return <div key={index}>{list}</div>;

      case "blockquote":
        let raw = e?.children.filter(
          (e) => !(e.type === "text" && e.value === "\n")
        );
        let quote = HtmlAstToReact(raw, imageData);
        if (typeof e?.children[0]?.value === "string") {
          return <blockquote key={index}>{quote}</blockquote>;
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
  StyledWrapperDiv,
  StyledWrapperSection,
  PaneFragment,
  getStoryStepGraph,
};
