import React, { Component } from "react";
import Slider from "react-slick";
import { wordmark, icon } from "./shapes";
import { lispLexer } from "./lexer";
import { lispCallback } from "./helpers";

const ImpressionsIcons = props => {
  let iconsMode,
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
  return /*#__PURE__*/React.createElement("ul", null, icons);
};

const Slide = props => {
  return /*#__PURE__*/React.createElement("div", {
    key: props?.this_id
  }, /*#__PURE__*/React.createElement("div", {
    className: "title"
  }, props?.title), /*#__PURE__*/React.createElement("div", {
    className: "headline"
  }, props?.headline, " ", /*#__PURE__*/React.createElement("a", {
    className: "more",
    onClick: () => props?.hook()
  }, "Read\xA0>")));
};

export default class ImpressionsCarousel extends Component {
  render() {
    let props = this?.props;
    var settings = {
      dots: false,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      fade: true,
      arrows: false,
      autoplaySpeed: 22000
    };
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
      key: "powered-by-tractstack"
    }, /*#__PURE__*/React.createElement("div", {
      className: "title"
    }, title), /*#__PURE__*/React.createElement("div", {
      className: "headline"
    }, "Learning science powered product-market-fit finder for start-ups, brand evangelists and community builders.")));
    return /*#__PURE__*/React.createElement("div", {
      id: `controller-carousel-${props?.viewportKey}`,
      className: `controller-carousel controller-carousel-${props?.viewportKey} controller__container--carousel`
    }, /*#__PURE__*/React.createElement(Slider, settings, impressions));
  }

}
export { ImpressionsCarousel, ImpressionsIcons };
//# sourceMappingURL=impressions.js.map