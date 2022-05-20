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
        hooksData: {
          type: "object"
        }
      }
    }
  },
  required: ["id", "mode", "z_index", "viewport"],
  additionalProperties: false
};
export { tractStackFragmentSchema };
//# sourceMappingURL=schema.js.map