// src/middlewares/validateMiddleware.js
const { body, validationResult } = require('express-validator');

exports.validateNewProduct = [
  body('name').notEmpty().withMessage('Name is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  body('category_id').isInt().withMessage('Category ID must be an integer'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array()
      });
    }
    next();
  }
];

























