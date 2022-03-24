import React from "react";
import { toH } from "hast-to-hyperscript";
import h from "hyperscript";
import { graphql, useStaticQuery } from "gatsby";
import { getImage, GatsbyImage } from "gatsby-plugin-image";
import { convertToBgImage } from "gbimage-bridge";
import BackgroundImage from "gatsby-background-image";

const InjectGatsbyBackgroundImage = (imageData, alt_text) => {
  const image = getImage(imageData);
  const bgImage = convertToBgImage(image);
  return (
    <BackgroundImage
      className="paneFragmentImage"
      Tag="section"
      {...bgImage}
      preserveStackingContext
    >
      <div>
        <GatsbyImage image={image} alt={alt_text} />
      </div>
    </BackgroundImage>
  );
};

const InjectGatsbyBackgroundVideo = (id, url, alt_text) => {
  return (
    <div className="paneFragmentVideo">
      <video autoPlay={true} muted loop id={id} title={alt_text}>
        <source src={url} type="video/mp4" />
      </video>
    </div>
  );
};

const InjectSvg = (publicURL, alt_text) => {
  return (
    <>
      <img src={publicURL} alt={alt_text} className="paneFragmentCSS" />
    </>
  );
};

const MarkdownInjectGatsbyImage = (htmlAst, imageData = []) => {
  const html = htmlAst.children
    .filter((child) => child?.type && child.type === "element")
    .map((child) => {
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
      // otherwise
      return toH(h, child).outerHTML;
    });

  // render with styled-components and css
  return html.map((tag, index) => {
    // is either html as string OR is already a react element
    if (typeof tag === "object") {
      return tag;
    } else if (typeof tag === "string") {
      return <div key={index} dangerouslySetInnerHTML={{ __html: tag }} />;
    }
  });
};

export {
  MarkdownInjectGatsbyImage,
  InjectGatsbyBackgroundImage,
  InjectGatsbyBackgroundVideo,
  InjectSvg,
};
