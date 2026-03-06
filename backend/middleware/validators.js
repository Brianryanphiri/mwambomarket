export const validateProduct = (req, res, next) => {
  const { name, price, unit, category, stock } = req.body;

  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Product name must be at least 3 characters');
  }

  if (!price || isNaN(price) || price <= 0) {
    errors.push('Valid price is required');
  }

  if (!unit) {
    errors.push('Unit is required');
  }

  if (!category) {
    errors.push('Category is required');
  }

  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    errors.push('Valid stock quantity is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};