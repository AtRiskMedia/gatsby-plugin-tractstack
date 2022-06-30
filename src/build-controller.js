import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import { Link } from "gatsby";
import { SvgShape, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { lispCallback, StyledWrapperDiv, InjectCssAnimation } from "./helpers";
import { lispLexer } from "./lexer";

function BuildController(data) {
  let next,
    prev,
    link,
    react_fragment,
    effects_payload,
    controller_pane,
    controller_pane_minimized;
  if (data?.storyStep?.storyStepGraph?.next?.field_slug)
    next = `/${data?.storyStep?.storyStepGraph?.next?.field_slug}`;
  if (data?.storyStep?.storyStepGraph?.previous?.field_slug)
    prev = `/${data?.storyStep?.storyStepGraph?.previous?.field_slug}`;
  controller_pane = SvgShape("controller", {
    viewport: data?.viewport?.viewport,
  }).shape;
  controller_pane_minimized = SvgShape("mini", {
    viewport: data?.viewport?.viewport,
  }).shape;

  let svgString = renderToStaticMarkup(controller_pane_minimized);
  let b64 = window.btoa(svgString);
  let dataUri = `data:image/svg+xml;base64,${b64}`;
  let css,
    mask_css =
      `.controller__container--minimized {-webkit-mask-image: url("${dataUri}"); mask-image: url("${dataUri}");` +
      ` mask-repeat: no-repeat; -webkit-mask-size: 100% AUTO; mask-size: 100% AUTO; }`;

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
  function injectPayloadMinimize() {
    let payload = "(controller (minimize))";
    let payload_ast = lispLexer(payload);
    lispCallback(payload_ast[0], "controller", data?.hookEndPoint);
  }

  function injectPayloadExpand() {
    let payload = "(controller (expand))";
    let payload_ast = lispLexer(payload);
    lispCallback(payload_ast[0], "controller", data?.hookEndPoint);
  }
  // can we wrap this in animation?
  if (data?.prefersReducedMotion?.prefersReducedMotion === false) {
    effects_payload = {
      in: ["fadeInRight", 2, 1],
    };
    let animateController = InjectCssAnimation(effects_payload, "controller");
    effects_payload = {
      in: ["pulseExpand", 2, 10],
    };
    let animateControllerExpand = InjectCssAnimation(
      effects_payload,
      "controller-expand"
    );
    css = `${animateController} ${animateControllerExpand}`;
  }
  css = `${css} ${mask_css}`;
  return (
    <>
      <section
        key={data?.storyStep?.storyStepGraph?.current?.id}
        id="controller"
      >
        <StyledWrapperDiv css={css}>
          <div id="controller-expanded">
            <div className="controller">
              <div className="controller__container controller__container--expanded">
                {controller_pane}
              </div>
              <div className="controller__container controller__container--expanded">
                <div
                  className="controller__container--minimize"
                  onClick={() => injectPayloadMinimize()}
                  title="Minimize the Controller"
                >
                  &lt;
                </div>
              </div>
            </div>
          </div>
          <div id="controller-minimized">
            <div className="controller">
              <div className="controller__container controller__container--minimized">
                {controller_pane_minimized}
              </div>
              <div className="controller__container controller__container--minimized">
                <div className="controller__container--expand-bg">&gt;</div>
              </div>
              <div className="controller__container controller__container--minimized">
                <div
                  className="controller__container--expand"
                  onClick={() => injectPayloadExpand()}
                  title="Toggle Full Controller"
                >
                  &nbsp;
                </div>
              </div>
            </div>
          </div>
        </StyledWrapperDiv>
      </section>
    </>
  );
}

export { BuildController };
