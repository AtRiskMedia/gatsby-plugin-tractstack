import React from "react";
import { Link } from "gatsby";
import { IsVisible } from "./is-visible";
import { SvgPane, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { lispLexer } from "./lexer";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

function BuildController(data) {
  console.log("TODO: BuildController", data); //
  //const input = "(goto (storyfragment welcome))";
  //const [output] = lispLexer(input);
  //console.log("actions payload:", output,actions);

  let next, prev, link, react_fragment, effects_payload;
  if (data?.graph?.next?.field_slug) next = `/${data?.graph?.next?.field_slug}`;
  if (data?.graph?.previous?.field_slug) prev = `/${data?.graph?.previous?.field_slug}`;
  let controller_pane = SvgPane("pane", data?.viewport?.key, true);
  react_fragment = /*#__PURE__*/React.createElement("div", {
    id: "tractstack-controller",
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
      out: []
    };
  }

  let css = InjectCssAnimation(effects_payload, "tractstack-controller");
  console.log(css);
  return /*#__PURE__*/React.createElement("section", {
    key: data?.graph?.current?.id,
    className: "controller"
  }, /*#__PURE__*/React.createElement("div", {
    className: "controller__container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "controller__container--view"
  }, /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    css: css
  }, react_fragment)))); //<div className="controller__container--view">{controller_pane}</div>
}

export { BuildController };
//# sourceMappingURL=build-controller.js.map