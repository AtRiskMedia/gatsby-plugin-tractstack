import React from "react";
import { GatsbyImage } from "gatsby-plugin-image";
import { lispCallback, StyledWrapperDiv, InjectCssAnimation } from "./helpers";
import { lispLexer } from "./lexer";

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

function PreParseMenuItems(items, hooks) {
  // pre-parses menu items and injects hooks, if any
  let options;
  return items?.map(e => {
    try {
      options = JSON.parse(e?.field_options);
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.log("ERROR parsing json in {}: ", e);
      }
    }

    if (typeof options?.callbackPayload === "string") {
      e.callbackPayload = options.callbackPayload;
      e.hooksData = hooks;
    } else {
      e.callbackPayload = false;
      e.hooksData = false;
    }

    return e;
  });
}

function ParseMenuItems(items, index = 0, level = 0) {
  if (typeof items === "undefined") return /*#__PURE__*/React.createElement(React.Fragment, null);
  let recurse;
  let payload_ast = lispLexer(items[index]?.callbackPayload);

  function injectPayload() {
    lispCallback(payload_ast[0], "", items[index]?.hooksData);
  }

  let this_menu_item = /*#__PURE__*/React.createElement("a", {
    key: index,
    href: "#",
    onClick: () => injectPayload()
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
  if (!data?.state?.viewport?.viewport?.key) return /*#__PURE__*/React.createElement(React.Fragment, null);
  let logo; // svg or image logo?

  if (typeof data?.payload?.relationships?.field_svg_logo?.localFile?.publicURL === "string") {
    // svg logo
    let this_image_id = data?.payload?.relationships?.field_svg_logo?.id;
    let this_image = data?.payload?.relationships?.field_svg_logo?.localFile?.publicURL;
    logo = /*#__PURE__*/React.createElement("img", {
      src: this_image,
      className: `menu__logo menu__logo--${data?.state?.viewport?.viewport?.key}`,
      alt: "Logo"
    });
  } else if (typeof data?.payload?.relationships?.field_image_logo?.localFile?.childImageSharp[data?.state?.viewport?.viewport?.key] !== "undefined") {
    let this_image_id = data?.payload?.relationships?.field_image_logo?.id;
    let this_image = data?.payload?.relationships?.field_image_logo?.localFile?.childImageSharp[data?.state?.viewport?.viewport?.key]; // image logo

    logo = /*#__PURE__*/React.createElement(GatsbyImage, {
      key: this_image_id,
      className: `menu__logo menu__logo--${data?.state?.viewport?.viewport?.key}`,
      alt: "Logo",
      image: this_image,
      objectFit: "contain"
    });
  }

  let menuItemsRaw = PreParseMenuItems(data?.payload?.relationships?.field_menu_items, data?.hooks);
  let menuItems = ParseMenuItems(menuItemsRaw);
  let slogan = /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, "Power-ups for creatives since 2002."));
  let branding = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, logo), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", {
    className: "menu__main--wordmark wordmark wordmark__ARm"
  }, "At Risk Media")));
  let viewport = data?.state?.viewport?.viewport?.key;
  let contents;

  switch (viewport) {
    case "mobile":
    case "tablet":
      contents = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "menu__left menu__left--a"
      }, /*#__PURE__*/React.createElement("div", {
        className: "menu__branding"
      }, branding), /*#__PURE__*/React.createElement("div", {
        className: "menu__slogan"
      }, slogan)), /*#__PURE__*/React.createElement("div", {
        className: "menu__right menu__right--a"
      }, /*#__PURE__*/React.createElement("div", {
        className: "menu__menuitems"
      }, menuItems)));
      break;

    case "desktop":
      contents = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        className: "menu__left menu__left--b"
      }, /*#__PURE__*/React.createElement("div", {
        className: "menu__branding"
      }, branding)), /*#__PURE__*/React.createElement("div", {
        className: "menu__right menu__right--b"
      }, /*#__PURE__*/React.createElement("div", {
        className: "menu__slogan"
      }, slogan), /*#__PURE__*/React.createElement("div", {
        className: "menu__menuitems"
      }, menuItems)));
      break;
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("header", {
    role: "banner"
  }, /*#__PURE__*/React.createElement("nav", {
    role: "navigation",
    className: `menu menu-default ${viewport}`
  }, contents)));
}

export { PreParseMenuItems, ParseMenuItems };
//# sourceMappingURL=build-menu.js.map