import { useInView } from "react-cool-inview";
import { v4 as uuidv4 } from "uuid";
import { ComposePanes } from "./compose-panes";
import { BuildController } from "./build-controller";
import { PreParseMenuItems, ParseMenuItems } from "./build-menu";
import { lispCallback, getScrollbarSize } from "./helpers";
import { lispLexer } from "./lexer";

const viewportWidths = {
  mobile: 600,
  tablet: 1080,
  desktop: 1920,
};

export {
  ComposePanes,
  BuildController,
  viewportWidths,
  lispLexer,
  lispCallback,
  getScrollbarSize,
  PreParseMenuItems,
  ParseMenuItems,
  useInView,
  uuidv4,
};
