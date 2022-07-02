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
    svgString,
    b64,
    dataUri,
    css,
    mask_css,
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

  svgString = renderToStaticMarkup(controller_pane_minimized);
  b64 = window.btoa(svgString);
  dataUri = `data:image/svg+xml;base64,${b64}`;
  mask_css =
    `.controller__container--minimized {-webkit-mask-image: url("${dataUri}"); mask-image: url("${dataUri}");` +
    ` mask-repeat: no-repeat; -webkit-mask-size: 100% AUTO; mask-size: 100% AUTO; }`;

  svgString = renderToStaticMarkup(controller_pane);
  b64 = window.btoa(svgString);
  dataUri = `data:image/svg+xml;base64,${b64}`;
  mask_css =
    `${mask_css} .controller__container--expanded {-webkit-mask-image: url("${dataUri}"); mask-image: url("${dataUri}");` +
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
      in: ["fadeInRight", 0.65, 0],
    };
    let animateController = InjectCssAnimation(effects_payload, "controller");
    effects_payload = {
      in: ["pulseExpand", 2, 10],
    };
    let animateControllerExpand = InjectCssAnimation(
      effects_payload,
      "controller-expand"
    );
    let animateControllerMinimize = InjectCssAnimation(
      effects_payload,
      "controller-minimize"
    );
    css = `${animateController} ${animateControllerExpand} ${animateControllerMinimize}`;
  }
  css = `${css} ${mask_css}`;
  let icons = `controller__icons controller__icons--${data?.viewport?.viewport?.key}`; // to-do
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
                <ul className={icons} id="controller-expanded-icons"></ul>
              </div>
              <div className="controller__container controller__container--expanded">
                <div
                  className="controller__container--minimize"
                  onClick={() => injectPayloadMinimize()}
                  title="Minimize the Controller"
                >
                  <div>&lt;</div>
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
                <ul className={icons} id="controller-minimized-icons"></ul>
              </div>
              <div className="controller__container controller__container--minimized">
                <div
                  className="controller__container--expand"
                  onClick={() => injectPayloadExpand()}
                  title="Toggle Full Controller"
                >
                  <div>&gt;</div>
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
