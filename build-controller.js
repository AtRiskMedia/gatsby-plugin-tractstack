import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import { Link } from "gatsby";
import { SvgShape, SvgPlay, SvgRewind, TractStackLogo } from "./shapes";
import { lispCallback, StyledWrapperDiv, InjectCssAnimation } from "./helpers";
import { lispLexer } from "./lexer";
import { ImpressionsCarousel, ImpressionsIcons } from "./impressions";

const BuildController = data => {
  let viewportKey = data?.viewportKey;
  if (viewportKey === "none") return /*#__PURE__*/React.createElement(React.Fragment, null);

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

  if (data?.prefersReducedMotion?.prefersReducedMotion === false) return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    id: "controller__minimized",
    className: "controller__minimized hidden none"
  }, /*#__PURE__*/React.createElement("div", {
    id: "controller__minimized--icons",
    className: "controller__minimized--icons"
  }, /*#__PURE__*/React.createElement(ImpressionsIcons, {
    payload: data?.controller?.payload?.impressions,
    activePanes: data?.controller?.activePanes,
    useHookEndPoint: data?.useHookEndPoint
  })), /*#__PURE__*/React.createElement("div", {
    className: "controller__minimized--toggle",
    onClick: () => injectPayloadExpand(),
    title: "Activate Controller"
  }, /*#__PURE__*/React.createElement("div", null, ">"))), /*#__PURE__*/React.createElement("div", {
    id: "controller__expanded",
    className: "controller__expanded hidden none"
  }, /*#__PURE__*/React.createElement("div", {
    className: "controller__expanded--toggle",
    onClick: () => injectPayloadMinimize(),
    title: "Minimize the Controller"
  }, /*#__PURE__*/React.createElement("div", null, "<")), /*#__PURE__*/React.createElement("div", {
    className: "controller__expanded--carousel"
  }, /*#__PURE__*/React.createElement(ImpressionsCarousel, {
    payload: data?.controller?.payload?.impressions,
    activePanes: data?.controller?.activePanes,
    useHookEndPoint: data?.useHookEndPoint,
    viewportKey: viewportKey
  })), /*#__PURE__*/React.createElement("div", {
    id: "controller__expanded--icons",
    className: "controller__expanded--icons"
  }, /*#__PURE__*/React.createElement(ImpressionsIcons, {
    payload: data?.controller?.payload?.impressions,
    activePanes: data?.controller?.activePanes,
    useHookEndPoint: data?.useHookEndPoint,
    viewportKey: viewportKey
  }))));
  return /*#__PURE__*/React.createElement("p", null, "ul");
};

export { BuildController };
//# sourceMappingURL=build-controller.js.map