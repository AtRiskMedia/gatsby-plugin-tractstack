import React, { Component } from "react";
import Slider from "react-slick";
import { wordmark, icon } from "./shapes";
import { lispLexer } from "./lexer";
import { lispCallback } from "./helpers";

const ImpressionsIcons = (props) => {
  let iconsMode = "default",
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
              if (icons.length < 8)
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
  if (icons.length > 4) iconsMode = "full";
  return <ul className={iconsMode}>{icons}</ul>;
};

const Slide = (props) => {
  return (
    <div key={props?.this_id}>
      <div className="title">{props?.title}</div>
      <div className="headline">
        {props?.headline}{" "}
        <a className="more" onClick={() => props?.hook()}>
          Read&nbsp;&gt;
        </a>
      </div>
    </div>
  );
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
      autoplaySpeed: 22000,
    };
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
                else title = this_impression?.title;
                impressions.push(
                  Slide({
                    this_id: this_impression?.icon,
                    title: title,
                    headline: this_impression?.headline,
                    hook: injectPayload,
                  })
                );
              }
            );
          });
      });
    let title = wordmark("tractstack");
    impressions.push(
      <div key="powered-by-tractstack">
        <div className="title">{title}</div>
        <div className="headline">
          Learning science powered product-market-fit finder for start-ups,
          brand evangelists and community builders.
        </div>
      </div>
    );

    return (
      <div
        id={`controller-carousel-${props?.viewportKey}`}
        className={`controller-carousel controller-carousel-${props?.viewportKey} controller__container--carousel`}
      >
        <Slider {...settings}>{impressions}</Slider>
      </div>
    );
  }
}

export { ImpressionsCarousel, ImpressionsIcons };
