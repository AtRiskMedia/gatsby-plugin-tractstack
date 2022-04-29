import React, { useRef } from "react";
import { useIsVisible } from "react-is-visible";

const IsVisible = props => {
  const nodeRef = useRef();
  const isVisible = useIsVisible(nodeRef);
  let state;

  if (isVisible) {
    state = "visible";
  } else {
    state = "hidden";
  }

  return /*#__PURE__*/React.createElement("div", {
    ref: nodeRef,
    id: props?.id,
    key: props?.id,
    className: state
  }, props.children);
};

export { IsVisible };
//# sourceMappingURL=is-visible.js.map