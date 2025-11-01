const { validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));
    
    return res.status(422).json({
      success: false,
      message: 'Error de validación',
      errors: extractedErrors
    });
  }
  
  next();
};

module.exports = {
  handleValidationErrors
};
