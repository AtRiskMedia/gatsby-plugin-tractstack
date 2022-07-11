import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import { Link } from "gatsby";
import { SvgShape, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { lispCallback, StyledWrapperDiv, InjectCssAnimation } from "./helpers";
import { lispLexer } from "./lexer";
import { ImpressionsCarousel } from "./impressions";

const BuildController = (data) => {
  console.log("BuildController", data);
  let viewportKey = data?.viewportKey;
  if (viewportKey === "none") return <></>;
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
  controller_pane = SvgShape("controller", {
    viewportKey: viewportKey,
  }).shape;
  controller_pane_minimized = SvgShape("mini", {
    viewportKey: viewportKey,
  }).shape;

  svgString = renderToStaticMarkup(controller_pane_minimized);
  b64 = window.btoa(svgString);
  dataUri = `data:image/svg+xml;base64,${b64}`;
  mask_css =
    `#controller-container-minimized {-webkit-mask-image: url("${dataUri}"); mask-image: url("${dataUri}");` +
    ` mask-repeat: no-repeat; -webkit-mask-size: 100% AUTO; mask-size: 100% AUTO; }`;

  svgString = renderToStaticMarkup(controller_pane);
  b64 = window.btoa(svgString);
  dataUri = `data:image/svg+xml;base64,${b64}`;
  mask_css =
    `${mask_css} #controller-container-expanded {-webkit-mask-image: url("${dataUri}"); mask-image: url("${dataUri}");` +
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
    lispCallback(payload_ast[0], "controller", data?.useHookEndPoint);
  }

  function injectPayloadExpand() {
    let payload = "(controller (expand))";
    let payload_ast = lispLexer(payload);
    lispCallback(payload_ast[0], "controller", data?.useHookEndPoint);
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
  let icons = `controller__icons controller__icons--${viewportKey}`; // to-do

  return (
    <>
      <StyledWrapperDiv css={css} id="controller-container">
        <div
          id="controller-container-expanded"
          className={`controller__container--${viewportKey}`}
        >
          <div
            className="controller__container--minimize"
            onClick={() => injectPayloadMinimize()}
            title="Minimize the Controller"
          >
            <div>&lt;</div>
          </div>
          <ImpressionsCarousel
            payload={data?.controller?.payload?.impressions}
            activePanes={data?.viewport?.activePanes}
          />
        </div>
        <div
          id="controller-container-minimized"
          className={`controller__container--${viewportKey}`}
        >
          <div className={icons}>
            <ul id="controller-minimized-icons"></ul>
          </div>
          <div
            className="controller__container--expand"
            onClick={() => injectPayloadExpand()}
            title="Toggle Full Controller"
          >
            <div>&gt;</div>
          </div>
        </div>
      </StyledWrapperDiv>
    </>
  );
};

export { BuildController };
