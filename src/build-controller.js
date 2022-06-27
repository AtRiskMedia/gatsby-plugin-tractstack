import React from "react";
import { Link } from "gatsby";
import { SvgShape, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

function BuildController(data) {
  let next, prev, link, react_fragment, effects_payload, controller_pane;
  if (data?.state?.storyStep?.storyStepGraph?.next?.field_slug)
    next = `/${data?.state?.storyStep?.storyStepGraph?.next?.field_slug}`;
  if (data?.state?.storyStep?.storyStepGraph?.previous?.field_slug)
    prev = `/${data?.state?.storyStep?.storyStepGraph?.previous?.field_slug}`;
  let tempValue = SvgShape("mini", {
    viewport: data?.state?.viewport?.viewport,
  });
  if (tempValue) controller_pane = tempValue?.shape;

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
  let css = InjectCssAnimation(effects_payload, "tractstack-controller");

  return (
    <>
      <section
        key={data?.state?.storyStep?.storyStepGraph?.current?.id}
        className="controller"
      >
        <StyledWrapperDiv css={css}>
          <div id="tractstack-controller" className="controller__container">
            <div
              className={`controller__view controller__view--${data?.state?.viewport?.viewport?.key}`}
            >
              <div id="calls-to-action"></div>
            </div>
            <div
              className={`controller__view controller__view--${data?.state?.viewport?.viewport?.key}`}
            >
              {controller_pane}
            </div>
          </div>
        </StyledWrapperDiv>
      </section>
      <div className="controller-minimized"></div>
    </>
  );
}

export { BuildController };
