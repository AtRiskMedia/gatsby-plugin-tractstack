import React from "react";
import { Link } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

const NavLink = ({
  children,
  to
}) => /*#__PURE__*/React.createElement(Link, {
  to: to,
  activeClassName: "is-active"
}, children);

function MenuItems(items, index = 0) {
  if (typeof items === "undefined") return /*#__PURE__*/React.createElement(React.Fragment, null);
  let recurse,
      this_menu_item = /*#__PURE__*/React.createElement(NavLink, {
    to: `/${items[index]?.field_slug}`
  }, items[index]?.field_title);

  if (index) {
    if (items[index]?.field_level === items[index - 1]?.field_level && items[index]?.field_level > items[index + 1]?.field_level || items?.length === index + 1) {
      return /*#__PURE__*/React.createElement("li", null, this_menu_item);
    }

    if (items[index]?.field_level === items[index - 1]?.field_level && items[index]?.field_level <= items[index + 1]?.field_level) {
      recurse = MenuItems(items, index + 1);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("li", null, this_menu_item), recurse);
    }

    if (items[index]?.field_level > items[index - 1]?.field_level) {
      // smart split sub-menu from remainder
      let sub = MenuItems(items, index + 1);
      if (items?.length >= sub?.props?.children?.length + index + 1) recurse = MenuItems(items, sub?.props?.children?.length + index + 1);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, this_menu_item), sub), recurse);
    }
  }

  if (index === 0) {
    if (items.length) recurse = MenuItems(items, index + 1);
    return /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, this_menu_item), recurse);
  }
}

function BuildMenu(data) {
  //console.log("BuildMenu", data?.payload, data?.state, data?.hooks);
  let logo; // svg or image logo?

  if (typeof data?.payload?.relationships?.field_svg_logo?.localFile?.publicURL === "string") {
    // svg logo
    //console.log("svg", data?.payload?.relationships?.field_svg_logo);
    let this_image_id = data?.payload?.relationships?.field_svg_logo?.id;
    let this_image = data?.payload?.relationships?.field_svg_logo?.publicURL;
    logo = /*#__PURE__*/React.createElement("img", {
      src: this_image,
      alt: "Logo"
    }); //console.log("svg", logo);
  } //else


  if (typeof data?.payload?.relationships?.field_image_logo?.localFile?.childImageSharp[data?.state?.viewport?.viewport?.key] !== "undefined") {
    let this_image_id = data?.payload?.relationships?.field_image_logo?.id;
    let this_image = data?.payload?.relationships?.field_image_logo?.localFile?.childImageSharp[data?.state?.viewport?.viewport?.key]; // image logo

    logo = /*#__PURE__*/React.createElement(GatsbyImage, {
      key: this_image_id,
      alt: "Logo",
      image: this_image,
      objectFit: "contain"
    }); //console.log("img", logo);
  } else {// no logo
  }

  data?.payload?.relationships?.field_menu_items.map(i => {//console.log("MenuItem", i);
  });
  let menuItems = MenuItems(data?.payload?.relationships?.field_menu_items);
  return /*#__PURE__*/React.createElement("div", null, menuItems);
}

export { BuildMenu };
//# sourceMappingURL=build-menu.js.map