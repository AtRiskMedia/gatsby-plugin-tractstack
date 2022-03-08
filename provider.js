/* global localStorage */
import PropTypes from 'prop-types';
import React, { useState, useEffect, createContext } from 'react';
const defaultValue = {};
const TractStackContext = /*#__PURE__*/createContext(defaultValue);

const TractStackProvider = ({
  children,
  queries
}) => {
  const [queryMatch, setQueryMatch] = useState({});
  const [storystep, setStorystep] = useState(0);

  const gotoStorystep = storystep_goto => {
    localStorage.setItem('storystep', JSON.stringify(storystep_goto));
    setStorystep(storystep_goto);
  };

  const nextStorystep = () => {
    let num_storysteps = JSON.parse(localStorage.getItem('num_storysteps'));

    if (storystep < num_storysteps) {
      localStorage.setItem('storystep', JSON.stringify(storystep + 1));
      setStorystep(storystep + 1);
    }
  };

  const prevStorystep = () => {
    localStorage.setItem('storystep', JSON.stringify(Math.min(1, storystep - 1)));
    setStorystep(Math.min(storystep - 1));
  };

  if (typeof window !== 'undefined' && document) {
    // set scrollbar offset variable
    const {
      body
    } = document;
    const scrollDiv = document.createElement('div'); // Append element with defined styling

    scrollDiv.setAttribute('style', 'width: 1337px; height: 1337px; position: absolute; left: -9999px; overflow: scroll;');
    body.appendChild(scrollDiv); // Collect width & height of scrollbar
    // from https://tobbelindstrom.com/blog/measure-scrollbar-width-and-height/

    const calculateValue = type => scrollDiv[`offset${type}`] - scrollDiv[`client${type}`];

    const scrollbarWidth = calculateValue('Width');
    document.documentElement.style.setProperty('--offset', scrollbarWidth); // Remove element

    body.removeChild(scrollDiv);
  }

  useEffect(() => {
    const mediaQueryLists = {};
    const keys = Object.keys(queries);
    let isAttached = false;
    const local_storystep = JSON.parse(localStorage.getItem('storystep'));

    if (local_storystep && storystep !== local_storystep) {
      setStorystep(local_storystep);
    }

    const handleQueryListener = () => {
      const updatedMatches = keys.reduce((acc, media) => {
        acc[media] = !!(mediaQueryLists[media] && mediaQueryLists[media].matches);
        return acc;
      }, {});
      setQueryMatch(updatedMatches);
    };

    if (window && window.matchMedia) {
      const matches = {};
      keys.forEach(media => {
        if (typeof queries[media] === 'string') {
          mediaQueryLists[media] = window.matchMedia(queries[media]);
          matches[media] = mediaQueryLists[media].matches;
        } else {
          matches[media] = false;
        }
      });
      setQueryMatch(matches);
      isAttached = true;
      keys.forEach(media => {
        if (typeof queries[media] === 'string') {
          mediaQueryLists[media].addListener(handleQueryListener);
        }
      });
    }

    return () => {
      if (isAttached) {
        keys.forEach(media => {
          if (typeof queries[media] === 'string') {
            mediaQueryLists[media].removeListener(handleQueryListener);
          }
        });
      }
    };
  }, [queries]);

  if (typeof localStorage !== 'undefined') {
    let pixelWidth = 0;
    if (queryMatch[360]) pixelWidth = 360;else if (queryMatch[1080]) pixelWidth = 1080;else if (queryMatch[1920]) pixelWidth = 1920;
    let num_storysteps = JSON.parse(localStorage.getItem('num_storysteps'));
    let context = {
      storystep: storystep,
      num_storysteps: num_storysteps,
      pixelWidth: pixelWidth,
      actions: {
        nextStorystep: nextStorystep,
        prevStorystep: prevStorystep,
        gotoStorystep: gotoStorystep
      }
    };
    return /*#__PURE__*/React.createElement(TractStackContext.Provider, {
      value: context
    }, children);
  }

  return /*#__PURE__*/React.createElement(React.Fragment, null);
};

TractStackProvider.propTypes = {
  children: PropTypes.element.isRequired,
  queries: PropTypes.object.isRequired
};
export { TractStackContext, TractStackProvider };
//# sourceMappingURL=provider.js.map