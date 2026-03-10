const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const STATIC_BASE_URL = API_URL.replace('/api', '');

export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath || imagePath === '/placeholder.svg') return '/placeholder.svg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a blob URL (preview), return as is
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Extract just the filename
  const filename = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
  
  // FIXED: Add the 'products' subfolder
  return `${STATIC_BASE_URL}/uploads/products/${filename}`;
};