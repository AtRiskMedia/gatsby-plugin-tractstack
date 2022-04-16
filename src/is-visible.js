import React, { useRef } from "react";
import { useIsVisible } from "react-is-visible";
import { StyledWrapper } from "./helpers";

const css = `.onscreen {
    animation: fadein 2s;
    -moz-animation: fadein 2s;
    -webkit-animation: fadein 2s;
    -o-animation: fadein 2s;
}
@keyframes fadein {
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
}
@-moz-keyframes fadein {
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
}
@-webkit-keyframes fadein {
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
}
@-o-keyframes fadein {
    from {
        opacity:0;
    }
    to {
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
        opacity:0;
    }
    to {
        opacity:1;
    }
}
@-moz-keyframes fadeout {
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
}
@-webkit-keyframes fadeout {
    from {
        opacity:0;
    }
    to {
        opacity:1;
    }
}
@-o-keyframes fadeout {
    from {
        opacity:0;
    }
    to {
        opacity: 1;
    }
}`;

const IsVisible = (props) => {
  const nodeRef = useRef();
  const isVisible = useIsVisible(nodeRef);
  let class_is_visible = "offscreen";
  if (isVisible) {
    class_is_visible = "onscreen";
  }
  return (
    <StyledWrapper css={css}>
      <div ref={nodeRef} className={class_is_visible}>
        {props.children}
      </div>
    </StyledWrapper>
  );
};

export { IsVisible };
