import React from "react";
import { Link } from "gatsby";
import { IsVisible } from "./is-visible.js";
import { SvgPane, SvgPlay, SvgRewind, TractStackLogo } from "./shapes.js";

function BuildController(data) {
  console.log("TODO: BuildController", data);
  let next, prev, link, react_fragment, effects_payload;
  if (data?.graph?.next?.field_slug) next = `/${data?.graph?.next?.field_slug}`;
  if (data?.graph?.previous?.field_slug) prev = `/${data?.graph?.previous?.field_slug}`;
  let controller_pane = SvgPane("pane", data?.viewport?.key, true);
  react_fragment = /*#__PURE__*/React.createElement("div", {
    className: `controller__view controller__view--${data?.viewport?.key}`
  }, /*#__PURE__*/React.createElement("div", {
    className: "controller__graph"
  }, next ? /*#__PURE__*/React.createElement(Link, {
    to: next
  }, /*#__PURE__*/React.createElement(SvgPlay, null)) : "", prev ? /*#__PURE__*/React.createElement(Link, {
    to: prev
  }, /*#__PURE__*/React.createElement(SvgRewind, null)) : "")); // can we wrap this in animation?

  if (data?.prefersReducedMotion === false) {
    effects_payload = {
      in: ["fadeInLeft", 2, 1],
      out: ["fadeOut", 0.5, 0]
    };
    react_fragment = /*#__PURE__*/React.createElement(IsVisible, {
      effects: effects_payload
    }, react_fragment);
  }

  return /*#__PURE__*/React.createElement("section", {
    key: data?.graph?.current?.id,
    className: "controller"
  }, /*#__PURE__*/React.createElement("div", {
    className: "controller__container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "controller__container--view"
  }, react_fragment), /*#__PURE__*/React.createElement("div", {
    className: "controller__container--view"
  }, controller_pane)));
}

export { BuildController };
//# sourceMappingURL=build-controller.js.map