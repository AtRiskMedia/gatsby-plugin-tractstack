import Ajv from "ajv";

const ajv = new Ajv();

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    children: { type: "object" },
  },
  required: ["id"],
  additionalProperties: false,
};

const tractStackFragment = {
  id: "123123123-12312321-213123-12332131",
  children: {},
};

const validate = ajv.compile(schema);
const valid = validate(tractStackFragment);
if (!valid) console.log(validate.errors);
