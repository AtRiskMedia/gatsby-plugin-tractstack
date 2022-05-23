const tractStackFragmentSchema = {
  type: "object",
  properties: {
    id: {
      type: "string"
    },
    mode: {
      type: "string"
    },
    children: {
      type: "object"
    },
    z_index: {
      type: "number"
    },
    viewport: {
      type: "object",
      properties: {
        device: {
          type: "string"
        },
        width: {
          type: "number"
        }
      }
    },
    css: {
      type: "object",
      properties: {
        parent: {
          type: "string"
        },
        child: {
          type: "string"
        }
      }
    },
    payload: {
      type: "object",
      properties: {
        maskData: {
          type: "object"
        },
        imageData: {
          type: "array"
        },
        buttonData: {
          type: "object"
        },
        shapeData: {
          type: "object"
        },
        videoData: {
          type: "object"
        },
        modalData: {
          type: "object"
        },
        hooksData: {
          type: "object"
        },
        paneData: {
          type: "object"
        }
      }
    }
  },
  required: ["id", "mode", "children", "z_index", "viewport", "css", "payload"],
  additionalProperties: false
};
const tractStackModalOptionsSchema = {
  type: "object",
  properties: {
    x: {
      type: "number"
    },
    y: {
      type: "number"
    },
    viewbox_x1: {
      type: "number"
    },
    viewbox_y1: {
      type: "number"
    },
    viewbox_x2: {
      type: "number"
    },
    viewbox_y2: {
      type: "number"
    },
    width: {
      type: "number"
    },
    height: {
      type: "number"
    },
    zoom_factor: {
      type: "number"
    }
  }
};
export { tractStackFragmentSchema };
//# sourceMappingURL=schema.js.map