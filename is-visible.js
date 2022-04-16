import React, { useRef } from "react";
import { useIsVisible } from "react-is-visible";
import { StyledWrapper } from "./helpers";

const css = (animationIn, animationOut, animationSpeed) => {
  return `.onscreen {
      opacity: 0;
      animation-duration: ` + animationSpeed + `s;
      animation-fill-mode: both;
      -webkit-animation-duration: ` + animationSpeed + `s;
      -webkit-animation-fill-mode: both
      animation-name: ` + animationIn + `;
        -webkit-animation-name: ` + animationIn + `;
    }
    .offscreen {
      animation-duration: ` + animationSpeed + `s;
      animation-fill-mode: both;
      -webkit-animation-duration: ` + animationSpeed + `s;
      -webkit-animation-fill-mode: both
      animation-name: ` + animationOut + `;
        -webkit-animation-name: ` + animationOut + `;
    }

    @keyframes fadeInUp {
        from {
          transform: translate3d(0,40px,0)
        }
        to {
          transform: translate3d(0,0,0);
          opacity:1;
        }
    }
    @-moz-keyframes fadeInUp {
        from {
          transform: translate3d(0,40px,0)
        }
        to {
          transform: translate3d(0,0,0);
          opacity:1;
        }
    }
    @-webkit-keyframes fadeInUp {
        from {
          transform: translate3d(0,40px,0)
        }
        to {
          transform: translate3d(0,0,0);
          opacity:1;
        }
    }
    @-o-keyframes fadeInUp {
        from {
          transform: translate3d(0,40px,0)
        }
        to {
          transform: translate3d(0,0,0);
          opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity:1;
        }
        to {
            opacity:0;
        }
    }
    @-moz-keyframes fadeOut {
        from {
            opacity:1;
        }
        to {
            opacity:0;
        }
    }
    @-webkit-keyframes fadeOut {
        from {
            opacity:1;
        }
        to {
            opacity:0;
        }
    }
    @-o-keyframes fadeOut {
        from {
            opacity:1;
        }
        to {
            opacity:0;
        }
    }`;
};

const IsVisible = props => {
  const nodeRef = useRef();
  const isVisible = useIsVisible(nodeRef);
  let class_is_visible = "offscreen";

  if (isVisible) {
    class_is_visible = "onscreen";
  }

  return /*#__PURE__*/React.createElement(StyledWrapper, {
    css: css(props?.payload?.in, props?.payload?.out, props?.payload?.speed)
  }, /*#__PURE__*/React.createElement("div", {
    ref: nodeRef,
    className: class_is_visible
  }, props.children));
};

export { IsVisible };
//# sourceMappingURL=is-visible.js.map