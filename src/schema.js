const tractStackFragmentSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    mode: { type: "string" },
    children: { type: "object" },
    z_index: { type: "number" },
    viewport: {
      type: "object",
      properties: {
        device: { type: "string" },
        width: { type: "number" },
      },
    },
    css: {
      type: "object",
      properties: {
        parent: { type: "string" },
        child: { type: "string" },
      },
    },
    payload: {
      type: "object",
      properties: {
        maskData: { type: "object" },
        imageData: { type: "array" },
        buttonData: { type: "object" },
        shapeData: { type: "object" },
        videoData: { type: "object" },
        hooksData: { type: "object" },
      },
    },
  },
  required: ["id", "mode", "z_index", "viewport"],
  additionalProperties: false,
};

export { tractStackFragmentSchema };
