export const validateProduct = (req, res, next) => {
  const {
    name, price, category, stock
  } = req.body;

  const errors = [];

  // Required fields validation
  if (!name || name.trim().length < 3) {
    errors.push('Product name is required and must be at least 3 characters');
  }

  if (!price || isNaN(price) || parseFloat(price) <= 0) {
    errors.push('Valid price is required');
  }

  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (stock === undefined || isNaN(stock) || parseInt(stock) < 0) {
    errors.push('Valid stock quantity is required');
  }

  // Optional fields validation
  if (req.body.original_price && (isNaN(req.body.original_price) || parseFloat(req.body.original_price) < 0)) {
    errors.push('Original price must be a valid positive number');
  }

  if (req.body.low_stock_alert && (isNaN(req.body.low_stock_alert) || parseInt(req.body.low_stock_alert) < 0)) {
    errors.push('Low stock alert must be a valid positive number');
  }

  if (req.body.weight && (isNaN(req.body.weight) || parseFloat(req.body.weight) < 0)) {
    errors.push('Weight must be a valid positive number');
  }

  if (req.body.min_order && (isNaN(req.body.min_order) || parseInt(req.body.min_order) < 1)) {
    errors.push('Minimum order must be at least 1');
  }

  if (req.body.max_order && (isNaN(req.body.max_order) || parseInt(req.body.max_order) < parseInt(req.body.min_order || 1))) {
    errors.push('Maximum order must be greater than or equal to minimum order');
  }

  // SKU validation if provided
  if (req.body.sku && req.body.sku.length > 0) {
    const skuRegex = /^[A-Za-z0-9\-_]+$/;
    if (!skuRegex.test(req.body.sku)) {
      errors.push('SKU can only contain letters, numbers, hyphens and underscores');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};

export const validateReview = (req, res, next) => {
  const { rating, comment, customer_name } = req.body;
  const errors = [];

  if (!customer_name || customer_name.trim().length < 2) {
    errors.push('Customer name is required');
  }

  if (!rating || rating < 1 || rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (!comment || comment.trim().length < 5) {
    errors.push('Review comment must be at least 5 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Validation failed', 
      errors 
    });
  }

  next();};