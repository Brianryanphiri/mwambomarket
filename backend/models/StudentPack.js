import db from '../config/database.js';

class StudentPack {
  static async findAll(serviceId) {
    const [rows] = await db.query('SELECT * FROM student_packs WHERE service_id = ? ORDER BY created_at DESC', [serviceId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM student_packs WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(packData) {
    const {
      serviceId, name, description, price, originalPrice, duration,
      lifestyle, items, popularity, savings, discount, features,
      includes, image, color, bgColor, icon, recommended, studentType, status
    } = packData;
    
    const [result] = await db.query(
      `INSERT INTO student_packs 
       (service_id, name, description, price, original_price, duration,
        lifestyle, items, popularity, savings, discount, features,
        includes, image, color, bg_color, icon, recommended, student_type, status,
        created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [serviceId, name, description, price, originalPrice, duration,
       lifestyle, items, popularity, savings, discount, JSON.stringify(features),
       JSON.stringify(includes), image, color, bgColor, icon, recommended, studentType, status]
    );
    return result.insertId;
  }

  static async update(id, packData) {
    const {
      name, description, price, originalPrice, duration, lifestyle,
      items, popularity, savings, discount, features, includes,
      image, color, bgColor, icon, recommended, studentType, status
    } = packData;
    
    const [result] = await db.query(
      `UPDATE student_packs SET 
       name = ?, description = ?, price = ?, original_price = ?, duration = ?,
       lifestyle = ?, items = ?, popularity = ?, savings = ?, discount = ?,
       features = ?, includes = ?, image = ?, color = ?, bg_color = ?,
       icon = ?, recommended = ?, student_type = ?, status = ?,
       updated_at = NOW() WHERE id = ?`,
      [name, description, price, originalPrice, duration, lifestyle,
       items, popularity, savings, discount, JSON.stringify(features),
       JSON.stringify(includes), image, color, bgColor, icon, recommended, studentType, status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM student_packs WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default StudentPack;