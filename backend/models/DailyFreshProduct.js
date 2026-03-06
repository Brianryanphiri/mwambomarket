import db from '../config/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to extract filename from URL or path
const getFilenameFromUrl = (url) => {
  if (!url) return null;
  // If it's a full URL, extract the filename
  if (url.includes('/')) {
    return url.split('/').pop();
  }
  return url;
};

class DailyFreshProduct {
  static async findAll(serviceId) {
    const [rows] = await db.query('SELECT * FROM daily_fresh_products WHERE service_id = ? ORDER BY created_at DESC', [serviceId]);
    
    // Convert numeric strings to actual numbers
    return rows.map(row => ({
      id: row.id?.toString(),
      serviceId: row.service_id?.toString(),
      name: row.name,
      price: parseFloat(row.price) || 0,
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      unit: row.unit,
      image: row.image, // This should already be just the filename
      rating: parseFloat(row.rating) || 0,
      badge: row.badge,
      category: row.category,
      timeAvailable: row.time_available,
      freshness: parseInt(row.freshness) || 0,
      stock: parseInt(row.stock) || 0,
      limit: row.purchase_limit ? parseInt(row.purchase_limit) : null,
      organic: row.organic === 1 || row.organic === true,
      local: row.local === 1 || row.local === true,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM daily_fresh_products WHERE id = ?', [id]);
    if (!rows[0]) return null;
    
    const row = rows[0];
    return {
      id: row.id?.toString(),
      serviceId: row.service_id?.toString(),
      name: row.name,
      price: parseFloat(row.price) || 0,
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      unit: row.unit,
      image: row.image, // This should already be just the filename
      rating: parseFloat(row.rating) || 0,
      badge: row.badge,
      category: row.category,
      timeAvailable: row.time_available,
      freshness: parseInt(row.freshness) || 0,
      stock: parseInt(row.stock) || 0,
      limit: row.purchase_limit ? parseInt(row.purchase_limit) : null,
      organic: row.organic === 1 || row.organic === true,
      local: row.local === 1 || row.local === true,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async create(productData) {
    const {
      serviceId, name, price, originalPrice, unit, image, badge,
      category, timeAvailable, freshness, stock, limit, organic, local, status
    } = productData;
    
    // Extract filename if full URL is provided
    const imageFilename = getFilenameFromUrl(image);
    
    const [result] = await db.query(
      `INSERT INTO daily_fresh_products 
       (service_id, name, price, original_price, unit, image, badge, category,
        time_available, freshness, stock, purchase_limit, organic, local, status,
        rating, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [serviceId, name, price, originalPrice, unit, imageFilename, badge, category,
       timeAvailable, freshness, stock, limit, organic ? 1 : 0, local ? 1 : 0, status]
    );
    return result.insertId;
  }

  static async update(id, productData) {
    const {
      name, price, originalPrice, unit, image, badge, category,
      timeAvailable, freshness, stock, limit, organic, local, status
    } = productData;
    
    // First, get the current product to check if we need to delete the old image
    const currentProduct = await this.findById(id);
    
    // Extract filename if full URL is provided
    const imageFilename = getFilenameFromUrl(image);
    
    const [result] = await db.query(
      `UPDATE daily_fresh_products SET 
       name = ?, price = ?, original_price = ?, unit = ?, image = ?, badge = ?,
       category = ?, time_available = ?, freshness = ?, stock = ?, 
       purchase_limit = ?, organic = ?, local = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, price, originalPrice, unit, imageFilename, badge, category,
       timeAvailable, freshness, stock, limit, organic ? 1 : 0, local ? 1 : 0, status, id]
    );
    
    // If image was updated and previous image existed, delete the old image file
    if (result.affectedRows > 0 && currentProduct && currentProduct.image && 
        imageFilename && currentProduct.image !== imageFilename) {
      const oldImagePath = path.join(__dirname, '../uploads/products', currentProduct.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log('Deleted old image file:', oldImagePath);
      }
    }
    
    return result.affectedRows > 0;
  }

  static async updateFreshness(id, freshness) {
    const [result] = await db.query(
      'UPDATE daily_fresh_products SET freshness = ?, updated_at = NOW() WHERE id = ?',
      [freshness, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    // First, get the product to delete the image file
    const product = await this.findById(id);
    
    const [result] = await db.query('DELETE FROM daily_fresh_products WHERE id = ?', [id]);
    
    // Delete image file if exists
    if (result.affectedRows > 0 && product && product.image) {
      const imagePath = path.join(__dirname, '../uploads/products', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Deleted image file:', imagePath);
      }
    }
    
    return result.affectedRows > 0;
  }
}
export default DailyFreshProduct;