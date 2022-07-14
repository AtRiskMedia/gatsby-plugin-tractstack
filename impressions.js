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

const Slide = props => {
  return /*#__PURE__*/React.createElement("div", {
    className: "keen-slider__slide",
    key: props?.this_id
  }, /*#__PURE__*/React.createElement("div", {
    className: "keen-slider__slide--hud"
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, props?.title), props?.hook && /*#__PURE__*/React.createElement("div", {
    className: "more",
    onClick: () => props?.hook()
  }, "Read\xA0>")), /*#__PURE__*/React.createElement("div", {
    className: "headline"
  }, props?.headline));
};

const ImpressionsCarousel = props => {
  const slots = {
    mobile: 2,
    tablet: 4,
    desktop: 5
  };
  const [refCallback, slider, sliderNode] = useKeenSlider({
    loop: true,
    mode: "free-snap",
    slides: {
      perView: `${slots[props?.viewportKey]}`
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
      }, 2200);
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
        if (typeof this_impression?.wordmark === "string") title = wordmark(this_impression?.wordmark);else title = this_impression?.title;
        console.log(`*${this_impression?.headline}$`);
        impressions.push(Slide({
          this_id: this_impression?.icon,
          title: title,
          headline: this_impression?.headline,
          hook: injectPayload
        }));
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
  }, "Learning science powered product-market-fit finder for start-ups, brand evangelists and community builders."))); // add fillers

  if (impressions.length < slots[props?.viewportKey]) {
    let emptySlots = slots[props?.viewportKey] - impressions.length;

    while (emptySlots) {
      impressions.push( /*#__PURE__*/React.createElement("div", {
        className: "keen-slider__slide",
        key: `blank-${emptySlots}`
      }, /*#__PURE__*/React.createElement("div", {
        className: "blank"
      }, emptySlots)));
      emptySlots = emptySlots - 1;
    }
  }

  console.log("*", impressions);
  return /*#__PURE__*/React.createElement("div", {
    id: "controller-carousel",
    className: `controller__container--carousel controller__container--carousel-${props?.viewportKey} keen-slider`,
    ref: refCallback
  }, impressions);
};

export { ImpressionsCarousel, ImpressionsIcons };
//# sourceMappingURL=impressions.js.map