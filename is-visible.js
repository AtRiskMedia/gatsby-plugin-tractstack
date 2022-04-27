import React, { useRef } from "react";
import { useIsVisible } from "react-is-visible";
import { StyledWrapperDiv } from "./helpers";

const InjectCssAnimation = payload => {
  let css = "height:100%;";
  if (!payload?.in && !payload?.out) return css;
  let animationIn = payload?.in[0],
      animationInSpeed = payload?.in[1],
      animationInDelay = payload?.in[2],
      animationOut = payload?.out[0],
      animationOutSpeed = payload?.out[1],
      animationOutDelay = payload?.out[2];

  if (typeof animationIn === "string") {
    css = css + `.onscreen { opacity: 0; animation-fill-mode: both; animation-name: ` + animationIn + `; -webkit-animation-name: ` + animationIn + `; `;

    if (typeof animationInSpeed === "number") {
      css = css + `animation-duration: ` + animationInSpeed + `s; -webkit-animation-duration: ` + animationInSpeed + `s; `;
    }

    if (typeof animationInDelay === "number") {
      css = css + `animation-delay: ` + animationInDelay + `s; `;
    }

    css = css + "}";
  }

  if (typeof animationOut === "string") {
    css = css + `.offscreen { opacity: 0; animation-fill-mode: both; animation-name: ` + animationOut + `; -webkit-animation-name: ` + animationOut + `; `;

    if (typeof animationOutSpeed === "number") {
      css = css + `animation-duration: ` + animationOutSpeed + `s; -webkit-animation-duration: ` + animationOutSpeed + `s; `;
    }

    if (typeof animationOutDelay === "number") {
      css = css + `animation-delay: ` + animationOutDelay + `s; `;
    }

    css = css + "}";
  }

  return css;
};

const IsVisible = props => {
  const nodeRef = useRef();
  const isVisible = useIsVisible(nodeRef);
  let class_is_visible = "offscreen";

  if (isVisible) {
    class_is_visible = "onscreen";
  }

  let css = InjectCssAnimation(props?.effects);
  return /*#__PURE__*/React.createElement(StyledWrapperDiv, {
    css: css
  }, /*#__PURE__*/React.createElement("div", {
    ref: nodeRef,
    className: class_is_visible + " reveal"
  }, props.children));
};

export { IsVisible };
//# sourceMappingURL=is-visible.js.map