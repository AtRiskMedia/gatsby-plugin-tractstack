import React from "react";
import { Link } from "gatsby";
import { IsVisible, PrepareCss } from "./is-visible.js";
import { StyledWrapperSection } from "./helpers.js";

function BuildController(data) {
  console.log("TODO: BuildController", data);
  let next, prev, link;
  if (data?.graph?.next?.field_slug) next = `/${data?.graph?.next?.field_slug}`;
  if (data?.graph?.previous?.field_slug) prev = `/${data?.graph?.previous?.field_slug}`;
  let effects = data?.effects;
  let payload = {
    in: ["fadeInLeft", 2, 1],
    out: ["fadeOut", 0.5, 0]
  };
  return /*#__PURE__*/React.createElement(StyledWrapperSection, {
    key: data?.graph?.current?.id,
    css: PrepareCss(payload),
    className: "controller controller__view--" + data?.viewport?.key
  }, /*#__PURE__*/React.createElement(IsVisible, {
    payload: payload
  }, /*#__PURE__*/React.createElement("div", {
    className: "controller__graph"
  }, next ? /*#__PURE__*/React.createElement(Link, {
    to: next
  }, "NEXT") : "", prev ? /*#__PURE__*/React.createElement(Link, {
    to: prev
  }, "PREV") : "")));
}

export { BuildController };
//# sourceMappingURL=build-controller.js.map