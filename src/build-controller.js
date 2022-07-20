import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import { Link } from "gatsby";
import { SvgShape, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { lispCallback, StyledWrapperDiv, InjectCssAnimation } from "./helpers";
import { lispLexer } from "./lexer";
import { ImpressionsCarousel, ImpressionsIcons } from "./impressions";

const BuildController = (data) => {
  let viewportKey = data?.viewportKey;
  if (viewportKey === "none") return <></>;
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

  if (data?.prefersReducedMotion?.prefersReducedMotion === false)
    return (
      <>
        <div
          id="controller__minimized"
          className="controller__minimized hidden none"
        >
          <div
            id="controller__minimized--icons"
            className="controller__minimized--icons"
          >
            <ImpressionsIcons
              payload={data?.controller?.payload?.impressions}
              activePanes={data?.controller?.activePanes}
              useHookEndPoint={data?.useHookEndPoint}
            />
          </div>
          <div
            className="controller__minimized--toggle"
            onClick={() => injectPayloadExpand()}
            title="Activate Controller"
          >
            <div>&gt;</div>
          </div>
        </div>
        <div
          id="controller__expanded"
          className="controller__expanded hidden none"
        >
          <div
            className="controller__expanded--toggle"
            onClick={() => injectPayloadMinimize()}
            title="Minimize the Controller"
          >
            <div>&lt;</div>
          </div>
          <div className="controller__expanded--carousel">
            <ImpressionsCarousel
              payload={data?.controller?.payload?.impressions}
              activePanes={data?.controller?.activePanes}
              useHookEndPoint={data?.useHookEndPoint}
              viewportKey={viewportKey}
            />
          </div>
          <div
            id="controller__expanded--icons"
            className="controller__expanded--icons"
          >
            <ImpressionsIcons
              payload={data?.controller?.payload?.impressions}
              activePanes={data?.controller?.activePanes}
              useHookEndPoint={data?.useHookEndPoint}
              viewportKey={viewportKey}
            />
          </div>
        </div>
      </>
    );
  return <p>ul</p>;
};

export { BuildController };
