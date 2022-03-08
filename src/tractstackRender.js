/* global localStorage */
/* eslint-disable react/prop-types */
import React, {useContext} from 'react';
import {GatsbyImage, getImage} from 'gatsby-plugin-image';
import DOMPurify from 'dompurify';
import {SvgPane, SvgLogo, SvgPlay, SvgRewind} from './svg';
import {TractStackContext} from './provider';
import ScrollRevealContainer from './ScrollRevealContainer';

export function TractStackRender(data) {
  console.log( "TractStackRender" );
  //localStorage.clear();
  const context = useContext(TractStackContext);
  let storystep = context.storystep,
    pixelWidth = context.pixelWidth;
  const local_storystep = JSON.parse(localStorage.getItem('storystep'));
  // if no context exists yet with storystep, use 1
  // DEBUG: remove this
  if (!pixelWidth) {
    pixelWidth = "360";
  }
  if (!storystep) {
    storystep = 1;
    localStorage.setItem('storystep', JSON.stringify(1));
    localStorage.setItem(
      'num_storysteps',
      JSON.stringify(data.value.relationships.field_storysteps.length)
    );
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
      name: data.value.relationships.field_storysteps.filter(
        (e) => e.field_storystep_order === storystep
      )[0].field_storystep_name,
      num_storysteps: data.value.relationships.field_storysteps.length,
    },
  };
  console.log( pixelWidth, typeof slidedeck );
  console.log( slidedeck );
  if (
    pixelWidth &&
    typeof slidedeck !== 'undefined' &&
    typeof slidedeck == 'object' &&
    Object.prototype.hasOwnProperty.call(slidedeck, 360) &&
    Object.prototype.hasOwnProperty.call(slidedeck, 1080) &&
    Object.prototype.hasOwnProperty.call(slidedeck, 1920) &&
    Object.prototype.hasOwnProperty.call(slidedeck, 'storystep')
  ) {
    const Contents = ({children}) => <div>{children}</div>;
    const Revealed = ScrollRevealContainer(Contents);

    let rows = [
      ...new Set(
        slidedeck[pixelWidth]
          .filter((e) => e.storystep === storystep)
          .sort(function (a, b) {
            return a.row - b.row;
          })
          .map(function (slide) {
            return slide.row;
          })
      ),
    ];
    return (
      <TractStackContext.Consumer>
        {(tractstack) => (
          <>
            <div className={'pixelWidth__' + pixelWidth}>
              <TrackStackController
                value={{
                  data: {
                    slidedeck: slidedeck,
                    context: tractstack,
                  },
                }}
              />
              {rows.map(function (row) {
                return (
                  <div
                    className={
                      'tractstack tractstack__container row' + row.toString()
                    }
                    key={row}
                  >
                    {slidedeck[pixelWidth]
                      .filter((e) => e.storystep === storystep)
                      .filter((e) => e.row === row)
                      .map(function (slide) {
                        // build slide
                        return (
                          <div className="pane .load-hidden" key={slide.key}>
                            <Revealed
                              options={slide.scrollRevealOptions}
                              interval={50}
                              target={
                                '.tractstack__container--' +
                                slide.className +
                                '-' +
                                pixelWidth.toString()
                              }
                            >
                              <>
                                <TractStackSlide
                                  value={{
                                    key: slide.key,
                                    copy: slide.copy,
                                    svg_name: slide.svg_name,
                                    className: slide.className,
                                    pixelWidth: pixelWidth,
                                  }}
                                />
                              </>
                            </Revealed>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </TractStackContext.Consumer>
    );
  }
  return <></>;
}

function SlideDeck(width, storystep, data) {
  return data.value.relationships.field_storysteps
    .filter((e) => e.field_storystep_order === storystep)[0]
    .relationships.field_storystep_slides.map(function (e) {
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
        svg_name: svg,
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
  return (
    <div
      className={
        'pane pane__copy pane__copy--action pane__copy--action-' + className
      }
      key={key}
    >
      <div>
        <button href="#" onClick={handleClick} className="neon-button">
          {button_text}
        </button>
      </div>
    </div>
  );
}

function TractStackSlide(data) {
  if (
    typeof data !== 'undefined' &&
    typeof data == 'object' &&
    typeof data.value !== 'undefined' &&
    typeof data.value.copy !== 'undefined' &&
    typeof data.value.copy == 'object' &&
    typeof data.value.svg_name !== 'undefined' &&
    typeof data.value.svg_name == 'string' &&
    typeof data.value.pixelWidth !== 'undefined' &&
    typeof data.value.pixelWidth == 'number'
  ) {
    const allcopy = data.value.copy.map(function (copy) {
      switch (copy.internal.type) {
        case 'paragraph__text':
          var clean = DOMPurify.sanitize(copy.field_innerhtml);
          return (
            <div
              key={copy.drupal_internal__id}
              className={'pane pane__copy pane__copy--' + copy.field_classname}
            >
              <div dangerouslySetInnerHTML={{__html: clean}}></div>
            </div>
          );
        case 'paragraph__action':
          var button_text = DOMPurify.sanitize(copy.field_button_text);
          var actions_payload = JSON.parse(copy.field_actions_payload);
          return ActionLink(
            button_text,
            copy.field_classname,
            copy.drupal_internal__id,
            actions_payload['action']
          );
        case 'paragraph__image':
          return (
            <div
              key={copy.drupal_internal__id}
              className={
                'pane pane__image pane__imagemask--' + copy.field_classname
              }
            >
              <GatsbyImage
                image={getImage(
                  copy.relationships.field_image.localFile.childImageSharp
                    .gatsbyImageData
                )}
                className={'pane pane__image--' + copy.field_classname}
                alt={copy.field_alt_text}
              />
            </div>
          );
      }
    });
    return (
      <div
        className={
          'tractstack tractstack__container--' +
          data.value.svg_name +
          ' tractstack__container--' +
          data.value.className +
          '-' +
          data.value.pixelWidth.toString()
        }
      >
        <div
          className={
            'pane tractstack__svg tractstack__svg--' + data.value.className
          }
        >
          {SvgPane(
            data.value.pixelWidth.toString(),
            data.value.svg_name,
            data.value.className
          )}
        </div>
        {allcopy}
      </div>
    );
  }
  return <></>;
}

function pad(num, size) {
  num = num.toString();
  while (num.length < size) num = '0' + num;
  return num;
}

export function TrackStackController(data) {
  if (
    typeof data !== 'undefined' &&
    typeof data == 'object' &&
    typeof data.value !== 'undefined' &&
    typeof data.value.data !== 'undefined' &&
    typeof data.value.data == 'object' &&
    Object.prototype.hasOwnProperty.call(data.value.data.slidedeck, 360) &&
    Object.prototype.hasOwnProperty.call(data.value.data.slidedeck, 1080) &&
    Object.prototype.hasOwnProperty.call(data.value.data.slidedeck, 1920) &&
    Object.prototype.hasOwnProperty.call(data.value.data.slidedeck, 'storystep')
  ) {
    const context = useContext(TractStackContext);
    let pixelWidth = context.pixelWidth;
    // DEBUG: remove this
    if (!pixelWidth) {
      pixelWidth = "360";
    }
    let num_storysteps = JSON.parse(localStorage.getItem('num_storysteps'));
    let storystep = data.value.data.slidedeck.storystep.storystep;
    let storystep_name = data.value.data.slidedeck.storystep.name;
    let svg = SvgPane(pixelWidth.toString(), 'controller', 'controller');
    let svg__storystep = SvgPane(
      pixelWidth.toString(),
      'controller',
      'storystep',
      'clip'
    );
    const Controls = () => {
      let play = false,
        rew = false;
      if (storystep < num_storysteps) play = true;
      if (storystep > 1) rew = true;
      return (
        <div className="pane">
          <div className="tractstack__controller--controls">
            {play && context && context.actions && context.actions.nextStorystep && <SvgPlay value={context.actions.nextStorystep} />}
            {rew && context && context.actions && context.actions.prevStorystep && <SvgRewind value={context.actions.prevStorystep} />}
          </div>
        </div>
      );
    };

    if (storystep && storystep_name && svg && svg__storystep) {
      return (
        <div className="tractstack tractstack__controller">
          <div className="pane tractstack__svg svg__controller">{svg}</div>
          <div className="pane tractstack__svg svg__storystep">
            {svg__storystep}
          </div>
          <div className="pane">
            <div className="tractstack__controller--storystep">
              <p>
                Story
                <br />
                step
              </p>
              <div>{pad(storystep, 2)}</div>
            </div>
          </div>
          <div className="pane">
            <div className="tractstack__controller--name">
              <SvgLogo /> <h1>{storystep_name}</h1>
            </div>
          </div>
          <Controls />
        </div>
      );
    }
  }
  return <></>;
}
