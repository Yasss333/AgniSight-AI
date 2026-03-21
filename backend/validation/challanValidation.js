const Joi = require('joi');

// ═══════════════════════════════════════════════════════════════════════════════
// Challan Creation Schema
// ═══════════════════════════════════════════════════════════════════════════════
const createChallanSchema = Joi.object().keys({
  challanNo: Joi.string()
    .required()
    .max(50)
    .messages({
      'any.required': 'Challan number is required',
      'string.max': 'Challan number must not exceed 50 characters',
    }),

  customerDetail: Joi.string()
    .optional()
    .max(200),

  mS: Joi.string()
    .optional()
    .max(100)
    .messages({
      'string.max': 'M/S (Business name) must not exceed 100 characters',
    }),

  transporterId: Joi.string()
    .optional()
    .max(50),

  courierPartner: Joi.string()
    .optional()
    .max(100),

  pickupDate: Joi.date()
    .optional()
    .messages({
      'date.base': 'Pickup date must be a valid date',
    }),

  lotNo: Joi.string()
    .optional()
    .max(50),

  numberOfBoxes: Joi.number()
    .optional()
    .integer()
    .min(0)
    .messages({
      'number.base': 'Number of boxes must be a number',
      'number.min': 'Number of boxes cannot be negative',
    }),

  products: Joi.array()
    .items(
      Joi.object({
        srNo: Joi.number()
          .required()
          .integer()
          .min(1)
          .messages({
            'any.required': 'Serial number is required for each product',
            'number.min': 'Serial number must be at least 1',
          }),

        nameOfProduct: Joi.string()
          .required()
          .max(200)
          .messages({
            'any.required': 'Product name is required',
            'string.max': 'Product name must not exceed 200 characters',
          }),

        quantity: Joi.number()
          .required()
          .integer()
          .min(0)
          .messages({
            'any.required': 'Quantity is required',
            'number.base': 'Quantity must be a number',
            'number.min': 'Quantity cannot be negative',
          }),
      })
    )
    .optional()
    .default([]),

  notes: Joi.string()
    .optional()
    .max(1000),

  sessionId: Joi.string()
    .optional(),
});

// ═══════════════════════════════════════════════════════════════════════════════
// Challan Update Schema (all fields optional except for validation)
// ═══════════════════════════════════════════════════════════════════════════════
const updateChallanSchema = Joi.object().keys({
  customerDetail: Joi.string()
    .optional()
    .max(200),

  mS: Joi.string()
    .optional()
    .max(100),

  transporterId: Joi.string()
    .optional()
    .max(50),

  courierPartner: Joi.string()
    .optional()
    .max(100),

  pickupDate: Joi.date()
    .optional(),

  lotNo: Joi.string()
    .optional()
    .max(50),

  numberOfBoxes: Joi.number()
    .optional()
    .integer()
    .min(0),

  products: Joi.array()
    .items(
      Joi.object({
        srNo: Joi.number()
          .required()
          .integer()
          .min(1),

        nameOfProduct: Joi.string()
          .required()
          .max(200),

        quantity: Joi.number()
          .required()
          .integer()
          .min(0),
      })
    )
    .optional(),

  status: Joi.string()
    .optional()
    .valid('active', 'completed', 'cancelled')
    .messages({
      'any.only': 'Status must be one of: active, completed, cancelled',
    }),

  notes: Joi.string()
    .optional()
    .max(1000),
});

module.exports = {
  createChallanSchema,
  updateChallanSchema,
};
