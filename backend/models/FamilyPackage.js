import db from '../config/database.js';

class FamilyPackage {
  static async findAll(serviceId) {
    const [rows] = await db.query('SELECT * FROM family_packages WHERE service_id = ? ORDER BY created_at DESC', [serviceId]);
    
    // Convert numeric strings to actual numbers
    return rows.map(row => ({
      ...row,
      id: row.id?.toString(),
      serviceId: row.service_id?.toString(),
      price: parseFloat(row.price) || 0,
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      items: parseInt(row.items) || 0,
      savings: parseFloat(row.savings) || 0,
      rating: parseFloat(row.rating) || 0,
      // Handle JSON fields
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
      includes: row.includes ? (typeof row.includes === 'string' ? JSON.parse(row.includes) : row.includes) : [],
      // Handle nutrition JSON
      nutrition: row.nutrition ? (typeof row.nutrition === 'string' ? JSON.parse(row.nutrition) : row.nutrition) : null,
      // Convert boolean fields
      popular: row.popular === 1 || row.popular === true,
      bestValue: row.best_value === 1 || row.best_value === true,
      // Keep dates as strings
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM family_packages WHERE id = ?', [id]);
    if (!rows[0]) return null;
    
    const row = rows[0];
    // Convert numeric strings to actual numbers
    return {
      id: row.id?.toString(),
      serviceId: row.service_id?.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price) || 0,
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      image: row.image,
      items: parseInt(row.items) || 0,
      familySize: row.family_size,
      savings: parseFloat(row.savings) || 0,
      rating: parseFloat(row.rating) || 0,
      // Handle JSON fields
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
      includes: row.includes ? (typeof row.includes === 'string' ? JSON.parse(row.includes) : row.includes) : [],
      // Handle nutrition JSON
      nutrition: row.nutrition ? (typeof row.nutrition === 'string' ? JSON.parse(row.nutrition) : row.nutrition) : null,
      // Convert boolean fields
      popular: row.popular === 1 || row.popular === true,
      bestValue: row.best_value === 1 || row.best_value === true,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  static async create(packageData) {
    const {
      serviceId, name, description, price, originalPrice, image,
      items, familySize, savings, tags, includes, popular, bestValue, status,
      nutrition
    } = packageData;
    
    const [result] = await db.query(
      `INSERT INTO family_packages 
       (service_id, name, description, price, original_price, image, items, 
        family_size, savings, tags, includes, nutrition, popular, best_value, status, 
        rating, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`,
      [serviceId, name, description, price, originalPrice, image, items,
       familySize, savings, JSON.stringify(tags), JSON.stringify(includes),
       nutrition ? JSON.stringify(nutrition) : null,
       popular ? 1 : 0, bestValue ? 1 : 0, status]
    );
    return result.insertId;
  }

  static async update(id, packageData) {
    const {
      name, description, price, originalPrice, image, items,
      familySize, savings, tags, includes, popular, bestValue, status,
      nutrition
    } = packageData;
    
    const [result] = await db.query(
      `UPDATE family_packages SET 
       name = ?, description = ?, price = ?, original_price = ?, image = ?, 
       items = ?, family_size = ?, savings = ?, tags = ?, includes = ?, 
       nutrition = ?, popular = ?, best_value = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, description, price, originalPrice, image, items,
       familySize, savings, JSON.stringify(tags), JSON.stringify(includes),
       nutrition ? JSON.stringify(nutrition) : null,
       popular ? 1 : 0, bestValue ? 1 : 0, status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM family_packages WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default FamilyPackage;