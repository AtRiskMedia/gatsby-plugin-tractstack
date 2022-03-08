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
export function onRenderBody({
  setHeadComponents
}) {
  setHeadComponents([/*#__PURE__*/React.createElement("script", {
    src: "https://unpkg.com/scrollreveal"
  })]);
}
//# sourceMappingURL=gatsby-ssr.js.map