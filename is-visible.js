import React, { useRef } from "react";
import { useIsVisible } from "react-is-visible";
import { StyledWrapper } from "./helpers";
const css = `
.onscreen {
  opacity: 0;
  animation-duration: 1s;
  animation-fill-mode: both;
  -webkit-animation-duration: 1s;
  -webkit-animation-fill-mode: both
  animation-name: fadeInUp;
  -webkit-animation-name: fadeInUp;
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

.offscreen {
    animation: fadeout 2s;
    -moz-animation: fadeout 2s;
    -webkit-animation: fadeout 2s;
    -o-animation: fadeout 2s;
}
@keyframes fadeout {
    from {
        opacity:1;
    }
    to {
        opacity:0;
    }
}
@-moz-keyframes fadeout {
    from {
        opacity:1;
    }
    to {
        opacity:0;
    }
}
@-webkit-keyframes fadeout {
    from {
        opacity:1;
    }
    to {
        opacity:0;
    }
}
@-o-keyframes fadeout {
    from {
        opacity:1;
    }
    to {
        opacity:0;
    }
}`;

const IsVisible = props => {
  const nodeRef = useRef();
  const isVisible = useIsVisible(nodeRef);
  let class_is_visible = "offscreen";

  if (isVisible) {
    class_is_visible = "onscreen";
  }

  return /*#__PURE__*/React.createElement(StyledWrapper, {
    css: css
  }, /*#__PURE__*/React.createElement("div", {
    ref: nodeRef,
    className: class_is_visible
  }, props.children));
};

export { IsVisible };
//# sourceMappingURL=is-visible.js.map