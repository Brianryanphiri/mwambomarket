import db from '../config/database.js';

class Service {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM services ORDER BY `order` ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(serviceData) {
    const { name, description, icon, type, status, featured, order, metadata } = serviceData;
    const [result] = await db.query(
      'INSERT INTO services (name, description, icon, type, status, featured, `order`, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [name, description, icon, type, status, featured, order, JSON.stringify(metadata || {})]
    );
    return result.insertId;
  }

  static async update(id, serviceData) {
    const { name, description, icon, type, status, featured, order, metadata } = serviceData;
    const [result] = await db.query(
      'UPDATE services SET name = ?, description = ?, icon = ?, type = ?, status = ?, featured = ?, `order` = ?, metadata = ?, updated_at = NOW() WHERE id = ?',
      [name, description, icon, type, status, featured, order, JSON.stringify(metadata || {}), id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM services WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getStats(id) {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) as totalPackages,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as activePackages,
        COALESCE(SUM(total_orders), 0) as totalOrders,
        COALESCE(SUM(total_revenue), 0) as totalRevenue,
        COALESCE(AVG(rating), 0) as averageRating
      FROM service_packages 
      WHERE service_id = ?
    `, [id]);
    
    const [popularItems] = await db.query(`
      SELECT id, name, order_count as orders
      FROM service_packages 
      WHERE service_id = ? 
      ORDER BY order_count DESC 
      LIMIT 5
    `, [id]);
    
    return {
      ...rows[0],
      popularItems
    };
  }
}

export default Service;