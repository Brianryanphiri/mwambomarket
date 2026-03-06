export const extractFilename = (url: string): string => {
  if (!url) return '';
  if (url.includes('/')) {
    return url.split('/').pop() || '';
  }
  return url;
};

export const getImageUrl = (filename: string): string => {
  if (!filename) return '/placeholder.svg';
  
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  if (filename.startsWith('blob:')) {
    return filename;
  }
  
  // For development, add the base URL
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5001/uploads/${filename}`;
  }
  
  return `/uploads/${filename}`;
};

export const processProductImages = (product: any): any => {
  if (!product) return product;

  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map(img => {
      if (typeof img === 'string') {
        return getImageUrl(extractFilename(img));
      } else if (img && typeof img === 'object' && 'url' in img) {
        return {
          ...img,
          url: getImageUrl(extractFilename(img.url))
        };
      }
      return img;
    });
  }

  return product;
};