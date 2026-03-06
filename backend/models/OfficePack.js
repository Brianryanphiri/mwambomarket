import db from '../config/database.js';

class OfficePack {
  static async findAll(serviceId) {
    const [rows] = await db.query('SELECT * FROM office_packs WHERE service_id = ? ORDER BY created_at DESC', [serviceId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM office_packs WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(packData) {
    const {
      serviceId, name, description, price, originalPrice, interval,
      size, teamSize, items, popularity, savings, discount, features,
      includes, image, color, bgColor, icon, recommended, minQuantity, status
    } = packData;
    
    const [result] = await db.query(
      `INSERT INTO office_packs 
       (service_id, name, description, price, original_price, interval_type,
        size_type, team_size, items, popularity, savings, discount, features,
        includes, image, color, bg_color, icon, recommended, min_quantity, status,
        created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [serviceId, name, description, price, originalPrice, interval,
       size, teamSize, items, popularity, savings, discount, JSON.stringify(features),
       JSON.stringify(includes), image, color, bgColor, icon, recommended, minQuantity, status]
    );
    return result.insertId;
  }

  static async update(id, packData) {
    const {
      name, description, price, originalPrice, interval, size,
      teamSize, items, popularity, savings, discount, features,
      includes, image, color, bgColor, icon, recommended, minQuantity, status
    } = packData;
    
    const [result] = await db.query(
      `UPDATE office_packs SET 
       name = ?, description = ?, price = ?, original_price = ?, interval_type = ?,
       size_type = ?, team_size = ?, items = ?, popularity = ?, savings = ?,
       discount = ?, features = ?, includes = ?, image = ?, color = ?,
       bg_color = ?, icon = ?, recommended = ?, min_quantity = ?, status = ?,
       updated_at = NOW() WHERE id = ?`,
      [name, description, price, originalPrice, interval, size,
       teamSize, items, popularity, savings, discount, JSON.stringify(features),
       JSON.stringify(includes), image, color, bgColor, icon, recommended, minQuantity, status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM office_packs WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default OfficePack;