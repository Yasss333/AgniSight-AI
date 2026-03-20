const Joi = require("joi");

const createSessionSchema = Joi.object({
  batchId: Joi.string().min(2).max(50).required(),
  yoloConfThreshold: Joi.number().min(0.1).max(1.0).default(0.5),
  yoloIouThreshold: Joi.number().min(0.1).max(1.0).default(0.45),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message).join(", ");
    return res.status(400).json({ success: false, message: messages });
  }
  next();
};

module.exports = { createSessionSchema, validate };