import React from "react";
import { Link } from "gatsby";
import { SvgShape, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

function BuildController(data) {
  let next,
    prev,
    link,
    react_fragment,
    effects_payload,
    controller_pane,
    controller_pane_minimized;
  if (data?.state?.storyStep?.storyStepGraph?.next?.field_slug)
    next = `/${data?.state?.storyStep?.storyStepGraph?.next?.field_slug}`;
  if (data?.state?.storyStep?.storyStepGraph?.previous?.field_slug)
    prev = `/${data?.state?.storyStep?.storyStepGraph?.previous?.field_slug}`;
  controller_pane = SvgShape("controller", {
    viewport: data?.state?.viewport?.viewport,
  }).shape;
  controller_pane_minimized = SvgShape("mini", {
    viewport: data?.state?.viewport?.viewport,
  }).shape;

  /*
  <div className="controller__graph">
    {next ? (
      <a onClick={() => data?.hooks?.hookGotoStoryFragment(next)}>
        <SvgPlay />
      </a>
    ) : (
      ""
    )}
    {prev ? (
      <a onClick={() => data?.hooks?.hookGotoStoryFragment(prev)}>
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
      in: ["fadeInRight", 2, 1],
    };
  }
  let css = InjectCssAnimation(effects_payload, "controller");
  return (
    <>
      <section
        key={data?.state?.storyStep?.storyStepGraph?.current?.id}
        id="controller"
      >
        <StyledWrapperDiv css={css}>
          <div id="controller-expanded">{controller_pane}</div>
          <div id="controller-minimized">{controller_pane_minimized}</div>
        </StyledWrapperDiv>
      </section>
    </>
  );
}

export { BuildController };
