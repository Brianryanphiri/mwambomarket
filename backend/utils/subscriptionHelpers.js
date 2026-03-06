export const generateSubscriptionNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SUB-${year}${month}-${random}`;
};

export const generateAccessToken = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

export const calculateNextDeliveryDate = (startDate, interval, deliveryDay) => {
  const date = new Date(startDate);
  const days = {
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6,
    'sunday': 0
  };

  let targetDay = days[deliveryDay.toLowerCase()];
  let currentDay = date.getDay();
  let daysToAdd = (targetDay - currentDay + 7) % 7;
  
  if (daysToAdd === 0) daysToAdd = 7; // Next week if today is delivery day
  
  date.setDate(date.getDate() + daysToAdd);
  
  // Add interval weeks
  const intervalWeeks = interval === 'weekly' ? 1 : interval === 'biweekly' ? 2 : 4;
  date.setDate(date.getDate() + (intervalWeeks * 7));
  
  return date.toISOString().split('T')[0];
};

export const validateDeliveryDay = (day) => {
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return validDays.includes(day.toLowerCase());
};

export const formatPhoneNumber = (phone) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Malawi number
  if (cleaned.length === 9 && (cleaned.startsWith('99') || cleaned.startsWith('88') || cleaned.startsWith('77'))) {
    return '+265' + cleaned;
  }
  if (cleaned.length === 12 && cleaned.startsWith('265')) {
    return '+' + cleaned;
  }
  return phone;
};