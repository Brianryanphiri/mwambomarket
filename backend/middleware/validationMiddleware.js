const validateProduct = (req, res, next) => {
  const {
    name, price, category, sku, stock, unit
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

  if (!sku || sku.trim().length === 0) {
    errors.push('SKU is required');
  }

  if (stock === undefined || isNaN(stock) || parseInt(stock) < 0) {
    errors.push('Valid stock quantity is required');
  }

  if (!unit || unit.trim().length === 0) {
    errors.push('Unit is required');
  }

  // Optional fields validation
  if (req.body.comparePrice && (isNaN(req.body.comparePrice) || parseFloat(req.body.comparePrice) < 0)) {
    errors.push('Compare price must be a valid positive number');
  }

  if (req.body.costPrice && (isNaN(req.body.costPrice) || parseFloat(req.body.costPrice) < 0)) {
    errors.push('Cost price must be a valid positive number');
  }

  if (req.body.weight && (isNaN(req.body.weight) || parseFloat(req.body.weight) < 0)) {
    errors.push('Weight must be a valid positive number');
  }

  if (req.body.lowStockAlert && (isNaN(req.body.lowStockAlert) || parseInt(req.body.lowStockAlert) < 0)) {
    errors.push('Low stock alert must be a valid positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};

module.exports = {
  validateProduct};