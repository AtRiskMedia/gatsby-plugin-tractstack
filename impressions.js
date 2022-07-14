import React from "react";
import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import { wordmark, icon } from "./shapes";
import { lispLexer } from "./lexer";
import { lispCallback } from "./helpers";

const ImpressionsIcons = props => {
  let iconsContainer = `controller__icons controller__icons--${props?.viewportKey}`,
      iconsMode,
      icons = [];
  let impressionsRaw = props?.payload;
  if (impressionsRaw) Object.keys(impressionsRaw).forEach(pane => {
    if (props?.activePanes?.includes(pane)) Object.keys(impressionsRaw[pane]).forEach(paneFragment => {
      Object.keys(impressionsRaw[pane][paneFragment]).forEach((impression, index) => {
        let this_impression = impressionsRaw[pane][paneFragment][impression];
        let this_icon = icon(this_impression?.icon);

        function injectPayload() {
          let payload_ast = lispLexer(this_impression?.actionsLisp);
          lispCallback(payload_ast[0], "", props?.useHookEndPoint);
        }

        icons.push( /*#__PURE__*/React.createElement("li", {
          key: index,
          className: "action visible",
          onClick: () => injectPayload()
        }, this_icon));
      });
    });
  });
  if (icons.length <= 4) iconsMode = "default";else iconsMode = "full";
  return /*#__PURE__*/React.createElement("div", {
    className: iconsContainer
  }, /*#__PURE__*/React.createElement("ul", {
    className: iconsMode
  }, icons));
};

const ImpressionsCarousel = props => {
  const [refCallback, slider, sliderNode] = useKeenSlider({
    loop: true,
    mode: "free-snap",
    breakpoints: {
      "(min-width: 601px)": {
        slides: {
          perView: 3,
          spacing: 4
        }
      },
      "(min-width: 1367px)": {
        slides: {
          perView: 5,
          spacing: 6
        }
      }
    },
    slides: {
      perView: 2
    }
  }, [slider => {
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
  }]);
  let impressions = [];
  let impressionsRaw = props?.payload;
  if (impressionsRaw) Object.keys(impressionsRaw).forEach(pane => {
    if (props?.activePanes?.includes(pane)) Object.keys(impressionsRaw[pane]).forEach(paneFragment => {
      Object.keys(impressionsRaw[pane][paneFragment]).forEach((impression, index) => {
        function injectPayload() {
          let payload_ast = lispLexer(this_impression?.actionsLisp);
          lispCallback(payload_ast[0], "", props?.useHookEndPoint);
        }

        let this_impression = impressionsRaw[pane][paneFragment][impression];
        let title;
        if (typeof this_impression?.wordmark === "string") title = wordmark(this_impression?.wordmark);else title = impressionsRaw[pane][paneFragment][impression]?.title;
        impressions.push( /*#__PURE__*/React.createElement("div", {
          className: "keen-slider__slide",
          key: index,
          id: impression
        }, /*#__PURE__*/React.createElement("div", {
          className: "title"
        }, title), /*#__PURE__*/React.createElement("div", {
          className: "headline"
        }, impressionsRaw[pane][paneFragment][impression]?.headline, /*#__PURE__*/React.createElement("span", {
          className: "more",
          onClick: () => injectPayload()
        }, "Read\xA0>"))));
      });
    });
  });
  let title = wordmark("tractstack");
  impressions.push( /*#__PURE__*/React.createElement("div", {
    className: "keen-slider__slide",
    key: "tractstack"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "headline"
  }, "Learning science powered product-market-fit finder for start-ups, brand evangelists and community builders.")));
  return /*#__PURE__*/React.createElement("div", {
    id: "controller-carousel",
    className: `controller__container--carousel controller__container--carousel-${props?.viewportKey} keen-slider`,
    ref: refCallback
  }, impressions);
};

export { ImpressionsCarousel, ImpressionsIcons };
//# sourceMappingURL=impressions.js.map