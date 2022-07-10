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

function PreParseMenuItems(items, useHookEndPoint) {
  // pre-parses menu items and injects hooks, if any
  let options;
  return items?.map((e) => {
    try {
      options = JSON.parse(e?.field_options);
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.log("ERROR parsing json in {}: ", e);
      }
    }
    if (typeof options?.callbackPayload === "string") {
      e.callbackPayload = options.callbackPayload;
      e.useHookEndPoint = useHookEndPoint;
    } else {
      e.callbackPayload = false;
      e.useHookEndPoint = false;
    }
    return e;
  });
}

function ParseMenuItems(items, index = 0, level = 0) {
  if (typeof items === "undefined") return <></>;
  let recurse;
  let payload_ast = lispLexer(items[index]?.callbackPayload);
  function injectPayload() {
    lispCallback(payload_ast[0], "", items[index]?.useHookEndPoint);
  }
  let this_menu_item = (
    <a key={index} href="#" onClick={() => injectPayload()}>
      {items[index]?.field_title}
    </a>
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
            <li>
              {this_menu_item}
              <ul>{sub}</ul>
            </li>
            {recurse}
          </>
        );
      } else {
        return (
          <>
            <li>
              {this_menu_item}
              <ul>{sub}</ul>
            </li>
          </>
        );
      }
    }
  }
}

export { PreParseMenuItems, ParseMenuItems };
