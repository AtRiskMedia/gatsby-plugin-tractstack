// eslint-disable-next-line no-unused-vars
import React from 'react';
import { defaultQueries } from './config';
import { TractStackProvider } from './provider';
export const wrapRootElement = ({
  element
}, {
  queries = null
}) => {
  return /*#__PURE__*/React.createElement(TractStackProvider, {
    queries: queries !== null ? queries : defaultQueries
  }, element);
};
//# sourceMappingURL=gatsby-browser.js.map