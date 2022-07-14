import React from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { wordmark, icon } from "./shapes";
import { lispLexer } from "./lexer";
import { lispCallback } from "./helpers";

const ImpressionsIcons = (props) => {
  let iconsContainer = `controller__icons controller__icons--${props?.viewportKey}`,
    iconsMode,
    icons = [];
  let impressionsRaw = props?.payload;
  if (impressionsRaw)
    Object.keys(impressionsRaw).forEach((pane) => {
      if (props?.activePanes?.includes(pane))
        Object.keys(impressionsRaw[pane]).forEach((paneFragment) => {
          Object.keys(impressionsRaw[pane][paneFragment]).forEach(
            (impression, index) => {
              let this_impression =
                impressionsRaw[pane][paneFragment][impression];
              let this_icon = icon(this_impression?.icon);
              function injectPayload() {
                let payload_ast = lispLexer(this_impression?.actionsLisp);
                lispCallback(payload_ast[0], "", props?.useHookEndPoint);
              }
              icons.push(
                <li
                  key={index}
                  className="action visible"
                  onClick={() => injectPayload()}
                >
                  {this_icon}
                </li>
              );
            }
          );
        });
    });
  if (icons.length <= 4) iconsMode = "default";
  else iconsMode = "full";

  return (
    <div className={iconsContainer}>
      <ul className={iconsMode}>{icons}</ul>
    </div>
  );
};

const ImpressionsCarousel = (props) => {
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
  let impressions = [];
  let impressionsRaw = props?.payload;
  if (impressionsRaw)
    Object.keys(impressionsRaw).forEach((pane) => {
      if (props?.activePanes?.includes(pane))
        Object.keys(impressionsRaw[pane]).forEach((paneFragment) => {
          Object.keys(impressionsRaw[pane][paneFragment]).forEach(
            (impression, index) => {
              function injectPayload() {
                let payload_ast = lispLexer(this_impression?.actionsLisp);
                lispCallback(payload_ast[0], "", props?.useHookEndPoint);
              }
              let this_impression =
                impressionsRaw[pane][paneFragment][impression];
              let title;
              if (typeof this_impression?.wordmark === "string")
                title = wordmark(this_impression?.wordmark);
              else
                title = impressionsRaw[pane][paneFragment][impression]?.title;
              impressions.push(
                <div className="keen-slider__slide" key={index} id={impression}>
                  <div className="title">{title}</div>
                  <div className="headline">
                    {impressionsRaw[pane][paneFragment][impression]?.headline}
                    <span className="more" onClick={() => injectPayload()}>
                      Read&nbsp;&gt;
                    </span>
                  </div>
                </div>
              );
            }
          );
        });
    });

  let title = wordmark("tractstack");
  impressions.push(
    <div className="keen-slider__slide" key="tractstack">
      <div className="title">{title}</div>
      <div className="headline">
        Learning science powered product-market-fit finder for start-ups, brand
        evangelists and community builders.
      </div>
    </div>
  );

  return (
    <div
      id="controller-carousel"
      className={`controller__container--carousel controller__container--carousel-${props?.viewportKey} keen-slider`}
      ref={refCallback}
    >
      {impressions}
    </div>
  );
};

export { ImpressionsCarousel, ImpressionsIcons };
