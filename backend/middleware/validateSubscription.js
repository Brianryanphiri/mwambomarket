import { validateDeliveryDay, formatPhoneNumber } from '../utils/subscriptionHelpers.js';

export const validateSubscription = (req, res, next) => {
  const {
    planId,
    customerName,
    customerEmail,
    customerPhone,
    startDate,
    deliveryDay,
    deliveryAddress,
    paymentMethod,
    totalPaid
  } = req.body;

  const errors = [];

  // Validate planId
  if (!planId) {
    errors.push('Plan ID is required');
  }

  // Validate customer name
  if (!customerName || customerName.trim().length < 3) {
    errors.push('Customer name must be at least 3 characters');
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customerEmail || !emailRegex.test(customerEmail)) {
    errors.push('Valid email is required');
  }

  // Validate phone (Malawi format)
  if (!customerPhone) {
    errors.push('Phone number is required');
  } else {
    const formattedPhone = formatPhoneNumber(customerPhone);
    const phoneRegex = /^\+265\d{9}$/;
    if (!phoneRegex.test(formattedPhone)) {
      errors.push('Valid Malawi phone number is required (e.g., 0991234567 or +265991234567)');
    }
  }

  // Validate start date
  if (!startDate) {
    errors.push('Start date is required');
  } else {
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      errors.push('Start date cannot be in the past');
    }
  }

  // Validate delivery day
  if (!deliveryDay || !validateDeliveryDay(deliveryDay)) {
    errors.push('Valid delivery day is required (Monday-Sunday)');
  }

  // Validate delivery address
  if (!deliveryAddress || deliveryAddress.trim().length < 10) {
    errors.push('Complete delivery address is required');
  }

  // Validate payment method
  const validPaymentMethods = ['cash', 'airtel_money', 'tnm_mpamba', 'card'];
  if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
    errors.push('Valid payment method is required');
  }

  // Validate total paid
  if (!totalPaid || isNaN(totalPaid) || parseFloat(totalPaid) <= 0) {
    errors.push('Valid payment amount is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};