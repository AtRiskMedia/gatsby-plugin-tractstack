import React from "react";
import { Link } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

function BuildMenu(data) {
  console.log("BuildMenu", data?.payload, data?.state);
  let logo; // svg or image logo?

  if (typeof data?.payload?.relationships?.field_svg_logo?.localFile?.publicURL === "string") {
    // svg logo
    console.log("svg", data?.payload?.relationships?.field_svg_logo);
    let this_image_id = data?.payload?.relationships?.field_svg_logo?.id;
    let this_image = data?.payload?.relationships?.field_svg_logo?.publicURL;
    logo = /*#__PURE__*/React.createElement("img", {
      src: this_image,
      alt: "Logo"
    });
    console.log("svg", logo);
  } //else


  if (typeof data?.payload?.relationships?.field_image_logo?.localFile?.childImageSharp) {
    let this_image_id = data?.payload?.relationships?.field_image_logo?.id;
    let this_image = data?.payload?.relationships?.field_image_logo?.localFile?.childImageSharp[data?.state?.viewport?.viewport?.key]; // image logo

    logo = /*#__PURE__*/React.createElement(GatsbyImage, {
      key: this_image_id,
      alt: "Logo",
      image: this_image,
      objectFit: "contain"
    });
    console.log("img", logo);
  } else {// no logo
  }

  data?.payload?.relationships?.field_menu_items.map(i => {
    console.log("MenuItem", i);
  });
  return /*#__PURE__*/React.createElement(React.Fragment, null);
}

export { BuildMenu };
//# sourceMappingURL=build-menu.js.map