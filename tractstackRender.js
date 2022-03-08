/* global localStorage */

/* eslint-disable react/prop-types */
import React, { useContext } from 'react';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import DOMPurify from 'dompurify';
import { SvgPane, SvgLogo, SvgPlay, SvgRewind } from './svg';
import { TractStackContext } from './provider';
import ScrollRevealContainer from './ScrollRevealContainer';
export function TractStackRender(data) {
  console.log("TractStackRender"); //localStorage.clear();

  const context = useContext(TractStackContext);
  let storystep = context.storystep,
      pixelWidth = context.pixelWidth;
  const local_storystep = JSON.parse(localStorage.getItem('storystep')); // if no context exists yet with storystep, use 1
  // DEBUG: remove this

  if (!pixelWidth) {
    pixelWidth = "360";
  }

  if (!storystep) {
    storystep = 1;
    localStorage.setItem('storystep', JSON.stringify(1));
    localStorage.setItem('num_storysteps', JSON.stringify(data.value.relationships.field_storysteps.length));
  } else if (local_storystep && storystep !== local_storystep) {
    // use localStorage storystep if available
    storystep = local_storystep;
  }

  let slidedeck = {
    360: SlideDeck(360, storystep, data),
    1080: SlideDeck(1080, storystep, data),
    1920: SlideDeck(1920, storystep, data),
    storystep: {
      storystep: storystep,
      name: data.value.relationships.field_storysteps.filter(e => e.field_storystep_order === storystep)[0].field_storystep_name,
      num_storysteps: data.value.relationships.field_storysteps.length
    }
  };
  console.log(pixelWidth, typeof slidedeck);
  console.log(slidedeck);

  if (pixelWidth && typeof slidedeck !== 'undefined' && typeof slidedeck == 'object' && Object.prototype.hasOwnProperty.call(slidedeck, 360) && Object.prototype.hasOwnProperty.call(slidedeck, 1080) && Object.prototype.hasOwnProperty.call(slidedeck, 1920) && Object.prototype.hasOwnProperty.call(slidedeck, 'storystep')) {
    const Contents = ({
      children
    }) => /*#__PURE__*/React.createElement("div", null, children);

    const Revealed = ScrollRevealContainer(Contents);
    let rows = [...new Set(slidedeck[pixelWidth].filter(e => e.storystep === storystep).sort(function (a, b) {
      return a.row - b.row;
    }).map(function (slide) {
      return slide.row;
    }))];
    return /*#__PURE__*/React.createElement(TractStackContext.Consumer, null, tractstack => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: 'pixelWidth__' + pixelWidth
    }, /*#__PURE__*/React.createElement(TrackStackController, {
      value: {
        data: {
          slidedeck: slidedeck,
          context: tractstack
        }
      }
    }), rows.map(function (row) {
      return /*#__PURE__*/React.createElement("div", {
        className: 'tractstack tractstack__container row' + row.toString(),
        key: row
      }, slidedeck[pixelWidth].filter(e => e.storystep === storystep).filter(e => e.row === row).map(function (slide) {
        // build slide
        return /*#__PURE__*/React.createElement("div", {
          className: "pane .load-hidden",
          key: slide.key
        }, /*#__PURE__*/React.createElement(Revealed, {
          options: slide.scrollRevealOptions,
          interval: 50,
          target: '.tractstack__container--' + slide.className + '-' + pixelWidth.toString()
        }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(TractStackSlide, {
          value: {
            key: slide.key,
            copy: slide.copy,
            svg_name: slide.svg_name,
            className: slide.className,
            pixelWidth: pixelWidth
          }
        }))));
      }));
    }))));
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null);
}

function SlideDeck(width, storystep, data) {
  return data.value.relationships.field_storysteps.filter(e => e.field_storystep_order === storystep)[0].relationships.field_storystep_slides.map(function (e) {
    let row, svg;

    if (width === 360) {
      row = e.field_row_360;
      svg = e.field_svg_360;
    } else if (width === 1080) {
      row = e.field_row_1080;
      svg = e.field_svg_1080;
    } else if (width === 1920) {
      row = e.field_row_1920;
      svg = e.field_svg_1920;
    } else return {};

    if (row === -1) return {};
    return {
      key: parseInt(width.toString() + '0' + e.drupal_internal__nid),
      storystep: storystep,
      row: row,
      copy: e.relationships.field_content,
      scrollRevealOptions: e.field_scroll_reveal_options,
      className: e.field_classname,
      svg_name: svg
    };
  });
}

function ActionLink(button_text, className, key, action) {
  const context = useContext(TractStackContext);

  function handleClick(e) {
    e.preventDefault();

    switch (action) {
      case 'nextStorystep':
        context.actions.nextStorystep();
        break;

      case 'prevStorystep':
        context.actions.prevStorystep();
        break;
    }
  }

  return /*#__PURE__*/React.createElement("div", {
    className: 'pane pane__copy pane__copy--action pane__copy--action-' + className,
    key: key
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    href: "#",
    onClick: handleClick,
    className: "neon-button"
  }, button_text)));
}

function TractStackSlide(data) {
  if (typeof data !== 'undefined' && typeof data == 'object' && typeof data.value !== 'undefined' && typeof data.value.copy !== 'undefined' && typeof data.value.copy == 'object' && typeof data.value.svg_name !== 'undefined' && typeof data.value.svg_name == 'string' && typeof data.value.pixelWidth !== 'undefined' && typeof data.value.pixelWidth == 'number') {
    const allcopy = data.value.copy.map(function (copy) {
      switch (copy.internal.type) {
        case 'paragraph__text':
          var clean = DOMPurify.sanitize(copy.field_innerhtml);
          return /*#__PURE__*/React.createElement("div", {
            key: copy.drupal_internal__id,
            className: 'pane pane__copy pane__copy--' + copy.field_classname
          }, /*#__PURE__*/React.createElement("div", {
            dangerouslySetInnerHTML: {
              __html: clean
            }
          }));

        case 'paragraph__action':
          var button_text = DOMPurify.sanitize(copy.field_button_text);
          var actions_payload = JSON.parse(copy.field_actions_payload);
          return ActionLink(button_text, copy.field_classname, copy.drupal_internal__id, actions_payload['action']);

        case 'paragraph__image':
          return /*#__PURE__*/React.createElement("div", {
            key: copy.drupal_internal__id,
            className: 'pane pane__image pane__imagemask--' + copy.field_classname
          }, /*#__PURE__*/React.createElement(GatsbyImage, {
            image: getImage(copy.relationships.field_image.localFile.childImageSharp.gatsbyImageData),
            className: 'pane pane__image--' + copy.field_classname,
            alt: copy.field_alt_text
          }));
      }
    });
    return /*#__PURE__*/React.createElement("div", {
      className: 'tractstack tractstack__container--' + data.value.svg_name + ' tractstack__container--' + data.value.className + '-' + data.value.pixelWidth.toString()
    }, /*#__PURE__*/React.createElement("div", {
      className: 'pane tractstack__svg tractstack__svg--' + data.value.className
    }, SvgPane(data.value.pixelWidth.toString(), data.value.svg_name, data.value.className)), allcopy);
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null);
}

function pad(num, size) {
  num = num.toString();

  while (num.length < size) num = '0' + num;

  return num;
}

export function TrackStackController(data) {
  if (typeof data !== 'undefined' && typeof data == 'object' && typeof data.value !== 'undefined' && typeof data.value.data !== 'undefined' && typeof data.value.data == 'object' && Object.prototype.hasOwnProperty.call(data.value.data.slidedeck, 360) && Object.prototype.hasOwnProperty.call(data.value.data.slidedeck, 1080) && Object.prototype.hasOwnProperty.call(data.value.data.slidedeck, 1920) && Object.prototype.hasOwnProperty.call(data.value.data.slidedeck, 'storystep')) {
    const context = useContext(TractStackContext);
    let pixelWidth = context.pixelWidth; // DEBUG: remove this

    if (!pixelWidth) {
      pixelWidth = "360";
    }

    let num_storysteps = JSON.parse(localStorage.getItem('num_storysteps'));
    let storystep = data.value.data.slidedeck.storystep.storystep;
    let storystep_name = data.value.data.slidedeck.storystep.name;
    let svg = SvgPane(pixelWidth.toString(), 'controller', 'controller');
    let svg__storystep = SvgPane(pixelWidth.toString(), 'controller', 'storystep', 'clip');

    const Controls = () => {
      let play = false,
          rew = false;
      if (storystep < num_storysteps) play = true;
      if (storystep > 1) rew = true;
      return /*#__PURE__*/React.createElement("div", {
        className: "pane"
      }, /*#__PURE__*/React.createElement("div", {
        className: "tractstack__controller--controls"
      }, play && context && context.actions && context.actions.nextStorystep && /*#__PURE__*/React.createElement(SvgPlay, {
        value: context.actions.nextStorystep
      }), rew && context && context.actions && context.actions.prevStorystep && /*#__PURE__*/React.createElement(SvgRewind, {
        value: context.actions.prevStorystep
      })));
    };

    if (storystep && storystep_name && svg && svg__storystep) {
      return /*#__PURE__*/React.createElement("div", {
        className: "tractstack tractstack__controller"
      }, /*#__PURE__*/React.createElement("div", {
        className: "pane tractstack__svg svg__controller"
      }, svg), /*#__PURE__*/React.createElement("div", {
        className: "pane tractstack__svg svg__storystep"
      }, svg__storystep), /*#__PURE__*/React.createElement("div", {
        className: "pane"
      }, /*#__PURE__*/React.createElement("div", {
        className: "tractstack__controller--storystep"
      }, /*#__PURE__*/React.createElement("p", null, "Story", /*#__PURE__*/React.createElement("br", null), "step"), /*#__PURE__*/React.createElement("div", null, pad(storystep, 2)))), /*#__PURE__*/React.createElement("div", {
        className: "pane"
      }, /*#__PURE__*/React.createElement("div", {
        className: "tractstack__controller--name"
      }, /*#__PURE__*/React.createElement(SvgLogo, null), " ", /*#__PURE__*/React.createElement("h1", null, storystep_name))), /*#__PURE__*/React.createElement(Controls, null));
    }
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null);
}
//# sourceMappingURL=tractstackRender.js.map