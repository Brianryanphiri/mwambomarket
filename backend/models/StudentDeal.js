import db from '../config/database.js';

class StudentDeal {
  static async findAll(serviceId) {
    const [rows] = await db.query('SELECT * FROM student_deals WHERE service_id = ? ORDER BY created_at DESC', [serviceId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM student_deals WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(dealData) {
    const {
      serviceId, name, discount, code, expiry, image, icon, used, limit, status
    } = dealData;
    
    const [result] = await db.query(
      `INSERT INTO student_deals 
       (service_id, name, discount, code, expiry_date, image, icon, used_count, usage_limit, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [serviceId, name, discount, code, expiry, image, icon, used, limit, status]
    );
    return result.insertId;
  }

  static async update(id, dealData) {
    const {
      name, discount, code, expiry, image, icon, used, limit, status
    } = dealData;
    
    const [result] = await db.query(
      `UPDATE student_deals SET 
       name = ?, discount = ?, code = ?, expiry_date = ?, image = ?, icon = ?,
       used_count = ?, usage_limit = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, discount, code, expiry, image, icon, used, limit, status, id]
    );
    return result.affectedRows > 0;
  }

  static async incrementUsage(id) {
    const [result] = await db.query(
      'UPDATE student_deals SET used_count = used_count + 1, updated_at = NOW() WHERE id = ? AND used_count < usage_limit',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM student_deals WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default StudentDeal;