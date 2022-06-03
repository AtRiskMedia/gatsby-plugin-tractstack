import React from "react";
import { Link } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

const NavLink = ({ children, to }) => (
  <Link to={to} activeClassName="is-active">
    {children}
  </Link>
);

function CountChildrenOffset(items, index = 0, level = 0) {
  while (1) {
    let next = items[index + 1] && items[index + 1]?.field_level;
    console.log(`i${index} cur ${level} next ${next}`);
    index = index + 1;
    if (index + 1 === items.length && items[index]?.field_level === level) {
      console.log("gives", index);
      return index;
    }
    if (next === level) {
      console.log("-gives", index);
      return index;
    }
    if (index > items.length) {
      return false;
    }
  }
}

function ParseMenuItems(items, index = 0, level = 0) {
  if (typeof items === "undefined") return <></>;
  let recurse,
    this_menu_item = (
      <NavLink to={`/${items[index]?.field_slug}`}>
        {items[index]?.field_title}
      </NavLink>
    );

  if (index === 0 && level === 0) {
    // initial bootstrap of menu ul
    if (items.length) recurse = ParseMenuItems(items, 0, 1);
    return <ul>{recurse}</ul>;
  }
  if (level) {
    let this_level = items[index]?.field_level - level;
    let next =
      items[index + 1] &&
      items[index + 1]?.field_level - items[index]?.field_level;

    if (next === 0) {
      recurse = ParseMenuItems(items, index + 1, level);
      return (
        <>
          <li>{this_menu_item}</li> {recurse}
        </>
      );
    } else if (next === -1 || typeof next === "undefined") {
      return <li>{this_menu_item}</li>;
    } else if (next === 1) {
      // smart split sub-menu from remainder
      let sub = ParseMenuItems(items, index + 1, level);
      let skip_children = CountChildrenOffset(
        items,
        index,
        items[index]?.field_level
      );
      if (skip_children) {
        recurse = ParseMenuItems(
          items,
          skip_children,
          items[skip_children]?.field_level
        );
        return (
          <>
            <li>{this_menu_item}</li>
            <ul>{sub}</ul>
            {recurse}
          </>
        );
      }
    }
  }
}

function BuildMenu(data) {
  //console.log("BuildMenu", data?.payload, data?.state, data?.hooks);

  let logo;
  // svg or image logo?
  if (
    typeof data?.payload?.relationships?.field_svg_logo?.localFile
      ?.publicURL === "string"
  ) {
    // svg logo
    //console.log("svg", data?.payload?.relationships?.field_svg_logo);
    let this_image_id = data?.payload?.relationships?.field_svg_logo?.id;
    let this_image = data?.payload?.relationships?.field_svg_logo?.publicURL;
    logo = <img src={this_image} alt="Logo" />;
    //console.log("svg", logo);
  }
  //else
  if (
    typeof data?.payload?.relationships?.field_image_logo?.localFile
      ?.childImageSharp[data?.state?.viewport?.viewport?.key] !== "undefined"
  ) {
    let this_image_id = data?.payload?.relationships?.field_image_logo?.id;
    let this_image =
      data?.payload?.relationships?.field_image_logo?.localFile
        ?.childImageSharp[data?.state?.viewport?.viewport?.key];
    // image logo
    logo = (
      <GatsbyImage
        key={this_image_id}
        alt="Logo"
        image={this_image}
        objectFit="contain"
      />
    );
    //console.log("img", logo);
  } else {
    // no logo
  }

  data?.payload?.relationships?.field_menu_items.map((i) => {
    //console.log("MenuItem", i);
  });

  let menuItems = ParseMenuItems(
    data?.payload?.relationships?.field_menu_items
  );

  return <div>{menuItems}</div>;
}

export { BuildMenu };
