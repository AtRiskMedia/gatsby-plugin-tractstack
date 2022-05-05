import React from "react";
import { Link } from "gatsby";
import { SvgPane, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { StyledWrapperDiv, InjectCssAnimation } from "./helpers";

function BuildController(data) {
  let next, prev, link, react_fragment, effects_payload;
  if (data?.state?.storyStep?.storyStepGraph?.next?.field_slug)
    next = `/${data?.state?.storyStep?.storyStepGraph?.next?.field_slug}`;
  if (data?.state?.storyStep?.storyStepGraph?.previous?.field_slug)
    prev = `/${data?.state?.storyStep?.storyStepGraph?.previous?.field_slug}`;
  let controller_pane = SvgPane(
    "pane",
    data?.state?.viewport?.viewport?.key,
    true
  );
  react_fragment = (
    <div
      id={"tractstack-controller"}
      className={`controller__view controller__view--${data?.state?.viewport?.viewport?.key}`}
    >
      <div id="calls-to-action"></div>
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
    </div>
  );

  // can we wrap this in animation?
  if (data?.state?.prefersReducedMotion?.prefersReducedMotion === false) {
    effects_payload = {
      in: ["fadeInLeft", 2, 1],
    };
  }
  let css = InjectCssAnimation(effects_payload, "tractstack-controller");
  return (
    <section
      key={data?.state?.storyStep?.storyStepGraph?.current?.id}
      className="controller"
    >
      <div className="controller__container">
        <div className="controller__container--view">
          <StyledWrapperDiv css={css}>{react_fragment}</StyledWrapperDiv>
        </div>
      </div>
    </section>
  );
  //<div className="controller__container--view">{controller_pane}</div>
}

export { BuildController };
