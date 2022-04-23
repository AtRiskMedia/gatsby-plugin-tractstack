import React from "react";
import { Link } from "gatsby";

function BuildController(data) {
  console.log("TODO: BuildController", data);
  let next, prev, link;
  if (data?.graph?.next?.field_slug) next = `/${data?.graph?.next?.field_slug}`;
  if (data?.graph?.previous?.field_slug) prev = `/${data?.graph?.previous?.field_slug}`;
  return /*#__PURE__*/React.createElement("section", {
    key: data?.graph?.current?.id,
    className: "controller controller__view--" + data?.viewport?.key
  }, /*#__PURE__*/React.createElement("div", {
    className: "controller__graph"
  }, next ? /*#__PURE__*/React.createElement(Link, {
    to: next
  }, "NEXT") : "", prev ? /*#__PURE__*/React.createElement(Link, {
    to: prev
  }, "PREV") : ""));
}

export { BuildController };
//# sourceMappingURL=build-controller.js.map