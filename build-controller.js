import React from "react";
import { Link } from "gatsby";
import { SvgPane, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

function BuildController(data) {
  let next, prev, link, react_fragment, effects_payload;
  if (data?.state?.storyStep?.storyStepGraph?.next?.field_slug) next = `/${data?.state?.storyStep?.storyStepGraph?.next?.field_slug}`;
  if (data?.state?.storyStep?.storyStepGraph?.previous?.field_slug) prev = `/${data?.state?.storyStep?.storyStepGraph?.previous?.field_slug}`;
  let controller_pane = SvgPane("pane", data?.state?.viewport?.viewport?.key, true);
  react_fragment = /*#__PURE__*/React.createElement("div", {
    id: "tractstack-controller",
    className: `controller__view controller__view--${data?.state?.viewport?.viewport?.key}`
  }, /*#__PURE__*/React.createElement("div", {
    id: "calls-to-action"
  }), /*#__PURE__*/React.createElement("div", {
    className: "controller__graph"
  }, next ? /*#__PURE__*/React.createElement("a", {
    onClick: () => data?.hooks?.hookGoto(next)
  }, /*#__PURE__*/React.createElement(SvgPlay, null)) : "", prev ? /*#__PURE__*/React.createElement("a", {
    onClick: () => data?.hooks?.hookGoto(prev)
  }, /*#__PURE__*/React.createElement(SvgRewind, null)) : "")); // can we wrap this in animation?

  if (data?.state?.prefersReducedMotion?.prefersReducedMotion === false) {
    effects_payload = {
      in: ["fadeInLeft", 2, 1]
    };
  }

  let css = InjectCssAnimation(effects_payload, "tractstack-controller");
  return /*#__PURE__*/React.createElement("section", {
    key: data?.state?.storyStep?.storyStepGraph?.current?.id,
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