import React from "react";
import { toH } from "hast-to-hyperscript";
import h from "hyperscript";
import styled from "styled-components";
import { graphql, useStaticQuery } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";

const StyledWrapper = styled.div`
  ${(props) => props.css};
`;

const InjectGatsbyBackgroundImage = (
  imageData,
  alt_text,
  index,
  parent_css,
  css,
  zIndex
) => {
  const image = getImage(imageData);
  const bgImage = convertToBgImage(image);
  return (
    <div className="paneFragment" key={index}>
      <StyledWrapper
        css={parent_css + "z-index:" + parseInt(zIndex) + ";" + css}
      >
        <BackgroundImage Tag="section" {...bgImage} preserveStackingContext>
          <div>
            <GatsbyImage image={image} alt={alt_text} />
          </div>
        </BackgroundImage>
      </StyledWrapper>
    </div>
  );
};

const InjectGatsbyBackgroundVideo = (
  id,
  url,
  alt_text,
  index,
  parent_css,
  css,
  zIndex
) => {
  return (
    <StyledWrapper
      className="paneFragment"
      key={index}
      css={parent_css + "z-index:" + parseInt(zIndex) + ";" + css}
    >
      <video autoPlay={true} muted loop id={id} title={alt_text}>
        <source src={url} type="video/mp4" />
      </video>
    </StyledWrapper>
  );
};

const InjectSvg = (publicURL, alt_text, index, parent_css, css, zIndex) => {
  return (
    <StyledWrapper
      className="paneFragment"
      key={index}
      css={parent_css + "z-index:" + parseInt(zIndex) + ";" + css}
    >
      <img src={publicURL} alt={alt_text} className="paneFragmentCSS" />
    </StyledWrapper>
  );
};

const MarkdownParagraph = (
  htmlAst,
  imageData = [],
  index,
  parent_css = "",
  css = "",
  zIndex
) => {
  const html = htmlAst.children
    .filter((child) => child?.type && child.type === "element")
    .map((child, index) => {
      for (const [i, tag] of Object.entries(child.children)) {
        if (tag?.tagName && tag.tagName === "img") {
          const gatsbyImageData = child.children.map((image) => {
            let thisImageData = imageData.filter(
              (matchImage) => matchImage[1] === image?.properties?.src
            );
            if (thisImageData && thisImageData[0] && thisImageData[0][2]) {
              return (
                <GatsbyImage
                  key={thisImageData[0][0]}
                  alt={image.properties.alt}
                  image={thisImageData[0][2]}
                />
              );
            }
          });
          // only supports one image each with its own dedicated paragraph
          return gatsbyImageData[0];
        }
      }
      // otherwise this tag is not an image
      return (
        <div
          key={index}
          dangerouslySetInnerHTML={{ __html: toH(h, child).outerHTML }}
        />
      );
    });
  return (
    <StyledWrapper
      key={index}
      className="paneFragment"
      css={parent_css + "z-index:" + parseInt(zIndex) + ";" + css}
    >
      {html}
    </StyledWrapper>
  );
};

const getStoryStepGraph = (graph, targetId) => {
  return graph.edges.filter((e) => e?.node?.id === targetId)[0];
};

export {
  MarkdownParagraph,
  InjectGatsbyBackgroundImage,
  InjectGatsbyBackgroundVideo,
  InjectSvg,
  StyledWrapper,
  getStoryStepGraph,
};
