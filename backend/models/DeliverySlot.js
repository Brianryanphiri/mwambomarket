import db from '../config/database.js';

class DeliverySlot {
  static async findAll(serviceId) {
    const [rows] = await db.query('SELECT * FROM delivery_slots WHERE service_id = ? ORDER BY created_at DESC', [serviceId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM delivery_slots WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(slotData) {
    const {
      serviceId, time, available, price, estimated, icon, maxOrders, currentOrders, status
    } = slotData;
    
    const [result] = await db.query(
      `INSERT INTO delivery_slots 
       (service_id, time_description, available, price, estimated_time, icon, max_orders, current_orders, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [serviceId, time, available, price, estimated, icon, maxOrders, currentOrders, status]
    );
    return result.insertId;
  }

  static async update(id, slotData) {
    const {
      time, available, price, estimated, icon, maxOrders, currentOrders, status
    } = slotData;
    
    const [result] = await db.query(
      `UPDATE delivery_slots SET 
       time_description = ?, available = ?, price = ?, estimated_time = ?, icon = ?,
       max_orders = ?, current_orders = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [time, available, price, estimated, icon, maxOrders, currentOrders, status, id]
    );
    return result.affectedRows > 0;
  }

  static async updateAvailability(id, available) {
    const [result] = await db.query(
      'UPDATE delivery_slots SET available = ?, updated_at = NOW() WHERE id = ?',
      [available, id]
    );
    return result.affectedRows > 0;
  }

  static async incrementOrders(id) {
    const [result] = await db.query(
      'UPDATE delivery_slots SET current_orders = current_orders + 1, updated_at = NOW() WHERE id = ? AND (max_orders IS NULL OR current_orders < max_orders)',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM delivery_slots WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

export default DeliverySlot;