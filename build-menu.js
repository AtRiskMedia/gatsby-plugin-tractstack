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

function CountChildrenOffset(items, index = 0, level = 0) {
  while (1) {
    let next = items[index + 1] && items[index + 1]?.field_level;
    index = index + 1;

    if (index + 1 === items.length && items[index]?.field_level === level) {
      return index;
    }

    if (next === level) {
      return index;
    }

    if (index > items.length) {
      return false;
    }
  }
}

function ParseMenuItems(items, index = 0, level = 0) {
  if (typeof items === "undefined") return /*#__PURE__*/React.createElement(React.Fragment, null);
  let recurse,
      this_menu_item = /*#__PURE__*/React.createElement(NavLink, {
    to: `/${items[index]?.field_slug}`
  }, items[index]?.field_title);

  if (index === 0 && level === 0) {
    // initial bootstrap of menu ul
    if (items.length) recurse = ParseMenuItems(items, 0, 1);
    return /*#__PURE__*/React.createElement("ul", null, recurse);
  }

  if (level) {
    let this_level = items[index]?.field_level - level;
    let next = items[index + 1] && items[index + 1]?.field_level - items[index]?.field_level;

    if (next === 0) {
      recurse = ParseMenuItems(items, index + 1, level);
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("li", null, this_menu_item), " ", recurse);
    } else if (next === -1 || typeof next === "undefined") {
      return /*#__PURE__*/React.createElement("li", null, this_menu_item);
    } else if (next === 1) {
      // smart split sub-menu from remainder
      let sub = ParseMenuItems(items, index + 1, level);
      let skip_children = CountChildrenOffset(items, index, items[index]?.field_level);

      if (skip_children) {
        recurse = ParseMenuItems(items, skip_children, items[skip_children]?.field_level);
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("li", null, this_menu_item, /*#__PURE__*/React.createElement("ul", null, sub)), recurse);
      } else {
        return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("li", null, this_menu_item, /*#__PURE__*/React.createElement("ul", null, sub)));
      }
    }
  }
}

function BuildMenu(data) {
  //console.log("BuildMenu", data?.payload, data?.state, data?.hooks);
  let logo; // svg or image logo?

  if (typeof data?.payload?.relationships?.field_svg_logo?.localFile?.publicURL === "string") {
    // svg logo
    let this_image_id = data?.payload?.relationships?.field_svg_logo?.id;
    let this_image = data?.payload?.relationships?.field_svg_logo?.localFile?.publicURL;
    logo = /*#__PURE__*/React.createElement("img", {
      src: this_image,
      className: "menu__logo",
      alt: "Logo"
    });
  } else if (typeof data?.payload?.relationships?.field_image_logo?.localFile?.childImageSharp[data?.state?.viewport?.viewport?.key] !== "undefined") {
    let this_image_id = data?.payload?.relationships?.field_image_logo?.id;
    let this_image = data?.payload?.relationships?.field_image_logo?.localFile?.childImageSharp[data?.state?.viewport?.viewport?.key]; // image logo

    logo = /*#__PURE__*/React.createElement(GatsbyImage, {
      key: this_image_id,
      className: "menu__logo",
      alt: "Logo",
      image: this_image,
      objectFit: "contain"
    });
  }

  let menuItems = ParseMenuItems(data?.payload?.relationships?.field_menu_items);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("header", {
    role: "banner"
  }, logo, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    id: "nav-toggle",
    className: "nav-toggle"
  }), /*#__PURE__*/React.createElement("nav", {
    role: "navigation",
    className: "menu-default"
  }, menuItems), /*#__PURE__*/React.createElement("label", {
    htmlFor: "nav-toggle",
    className: "nav-toggle-label"
  }, /*#__PURE__*/React.createElement("div", {
    className: "innernav__toggle"
  }, "menu"), /*#__PURE__*/React.createElement("span", null)))); //<div>{menuItems}</div>;
}

export { BuildMenu };
//# sourceMappingURL=build-menu.js.map