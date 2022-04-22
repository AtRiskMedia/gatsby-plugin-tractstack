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
    if (e?.type === "text") return e?.value;
    switch (e?.tagName) {
      case "h1":
        return <h1 key={index}>{e?.children[0].value}</h1>;
      case "h2":
        return <h2 key={index}>{e?.children[0].value}</h2>;
      case "h3":
        return <h3 key={index}>{e?.children[0].value}</h3>;
      case "h4":
        return <h4 key={index}>{e?.children[0].value}</h4>;
      case "h5":
        return <h5 key={index}>{e?.children[0].value}</h5>;
      case "h6":
        return <h6 key={index}>{e?.children[0].value}</h6>;

      case "p":
        let breakout = false;
        contents = e?.children?.map((p, i) => {
          if (p?.type === "text") return p?.value;
          if (p?.type === "element") {
            // determine which element ... could be p, img, br, a, ?
            switch (p?.tagName) {
              case "br":
                return <br key={i} />;

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

              case "img":
                // is this case for gatsby image? = png, jpg ... != svg
                let pass = /\.[A-Za-z0-9]+$/;
                let extcheck = p?.properties?.src?.match(pass);
                if (
                  extcheck &&
                  (extcheck[0] === ".png" || extcheck[0] === ".jpg")
                ) {
                  // imageData contains an array of images, match this image on filename
                  let thisImageData = imageData.filter(
                    (matchImage) => matchImage[1] === p?.properties?.src
                  );
                  if (
                    thisImageData &&
                    thisImageData[0] &&
                    thisImageData[0][2]
                  ) {
                    breakout = true;
                    return (
                      <GatsbyImage
                        key={i}
                        alt={p?.properties?.alt}
                        image={thisImageData[0][2]}
                      />
                    );
                  }
                }

              default:
                console.log("helpers.js: MISS on", p?.tagName);
            }
            return HtmlAstToReact(p?.children, imageData);
          }
        });
        if (breakout) return <div key={index}>{contents}</div>;
        return <p key={index}>{contents}</p>;

      case "ul":
        contents = e?.children?.map((li, i) => {
          if (li?.type === "element") {
            // assumes link contains text only
            return <li key={i}>{li?.children[0].value}</li>;
          }
        });
        return <ul key={index}>{contents}</ul>;

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
    <div className="paneFragment" key={id}>
      <StyledWrapperDiv css={css}>{child}</StyledWrapperDiv>
    </div>
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
  const image = getImage(imageData);
  const bgImage = convertToBgImage(image);
  let css = `z-index: ${parseInt(zIndex)}; img { ${parent_css} }`;
  let child = (
    <BackgroundImage Tag="section" {...bgImage} preserveStackingContext>
      <div className="paneFragmentImage">
        <GatsbyImage image={image} alt={alt_text} />
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
  getStoryStepGraph,
};
