import React from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { wordmark } from "./shapes";

const ImpressionsCarousel = (payload, visible) => {
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
  let impressionsRaw = payload?.payload;
  if (impressionsRaw)
    Object.keys(impressionsRaw).forEach((pane) => {
      Object.keys(impressionsRaw[pane]).forEach((paneFragment) => {
        Object.keys(impressionsRaw[pane][paneFragment]).forEach(
          (impression, index) => {
            let this_impression =
              impressionsRaw[pane][paneFragment][impression];
            let title;
            if (typeof this_impression?.wordmark === "string")
              title = wordmark(this_impression?.wordmark);
            impressions.push(
              <div className="keen-slider__slide a" key={index} id={impression}>
                {title}
                <span>
                  {impressionsRaw[pane][paneFragment][impression]?.headline}
                </span>
              </div>
            );
          }
        );
      });
    });

  let title = wordmark("tractstack");
  impressions.push(
    <div className="keen-slider__slide b" key="tractstack">
      <span className="title">{title}</span>
      <span className="headline">
        Learning science powered product-market-fit finder for start-ups, brand
        evangelists and community builders.
      </span>
      <span className="more">Read &gt;</span>
    </div>
  );

  return (
    <div
      id="controller-carousel"
      className="controller__container--carousel keen-slider"
      ref={refCallback}
    >
      {impressions}
    </div>
  );
};

export { ImpressionsCarousel };
