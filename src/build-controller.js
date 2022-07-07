import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import styled from "styled-components";
import { Link } from "gatsby";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
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

  const [refCallback, slider, sliderNode] = useKeenSlider(
    {
      loop: true,
      mode: "free-snap",

      breakpoints: {
        "(min-width: 601px)": {
          slides: { perView: 3, spacing: 4 },
        },
        "(min-width: 1367px)": {
          slides: { perView: 5, spacing: 6 },
        },
      },
      slides: { perView: 2 },
    },
    [
      (slider) => {
        let timeout;
        let mouseOver = false;
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 22000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );

  return (
    <>
      <StyledWrapperDiv
        css={css}
        key={data?.storyStep?.storyStepGraph?.current?.id}
        id="controller-container"
      >
        <div
          id="controller-container-expanded"
          className={`controller__container--${data?.viewport?.viewport?.key}`}
        >
          <div
            className="controller__container--minimize"
            onClick={() => injectPayloadMinimize()}
            title="Minimize the Controller"
          >
            <div>&lt;</div>
          </div>
          <div
            className="controller__container--carousel keen-slider"
            ref={refCallback}
          >
            <div className="keen-slider__slide a">1</div>
            <div className="keen-slider__slide b">2</div>
            <div className="keen-slider__slide c">3</div>
          </div>
          <div className={icons}>
            <ul className={icons} id="controller-expanded-icons"></ul>
          </div>
        </div>
        <div
          id="controller-container-minimized"
          className={`controller__container--${data?.viewport?.viewport?.key}`}
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
}

export { BuildController };
