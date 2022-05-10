import React from "react";
import { Link } from "gatsby";
import { SvgPane, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

function BuildController(data) {
  let next, prev, link, react_fragment, effects_payload;
  if (data?.state?.storyStep?.storyStepGraph?.next?.field_slug) next = `/${data?.state?.storyStep?.storyStepGraph?.next?.field_slug}`;
  if (data?.state?.storyStep?.storyStepGraph?.previous?.field_slug) prev = `/${data?.state?.storyStep?.storyStepGraph?.previous?.field_slug}`;
  let controller_pane = SvgPane("mini", data?.state?.viewport?.viewport?.key);
  /*
  <div className="controller__graph">
    {next ? (
      <a onClick={() => data?.hooks?.hookGoto(next)}>
        <SvgPlay />
      </a>
    ) : (
      ""
    )}
    {prev ? (
      <a onClick={() => data?.hooks?.hookGoto(prev)}>
        <SvgRewind />
      </a>
    ) : (
      ""
    )}
  </div>
  */
  // can we wrap this in animation?

  if (data?.state?.prefersReducedMotion?.prefersReducedMotion === false) {
    effects_payload = {
      in: ["fadeInRight", 2, 1]
    };
  }

  let css = InjectCssAnimation(effects_payload, "tractstack-controller");
  return /*#__PURE__*/React.createElement("section", {
    key: data?.state?.storyStep?.storyStepGraph?.current?.id,
    className: "controller"
  }, /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    css: css
  }, /*#__PURE__*/React.createElement("div", {
    id: "tractstack-controller",
    className: "controller__container"
  }, /*#__PURE__*/React.createElement("div", {
    className: `controller__view controller__view--${data?.state?.viewport?.viewport?.key}`
  }, /*#__PURE__*/React.createElement("div", {
    id: "calls-to-action"
  })), /*#__PURE__*/React.createElement("div", {
    className: `controller__view controller__view--${data?.state?.viewport?.viewport?.key}`
  }, controller_pane))));
}

export { BuildController };
//# sourceMappingURL=build-controller.js.map