import db from '../config/database.js';

class DeliveryZone {
  static async findAll(serviceId) {
    const [rows] = await db.query('SELECT * FROM delivery_zones WHERE service_id = ? ORDER BY created_at DESC', [serviceId]);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM delivery_zones WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(zoneData) {
    const {
      serviceId, name, coverage, time, fee, minOrder, icon, riders, coordinates, status
    } = zoneData;
    
    const [result] = await db.query(
      `INSERT INTO delivery_zones 
       (service_id, name, coverage, delivery_time, fee, min_order, icon, riders, coordinates, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [serviceId, name, coverage, time, fee, minOrder, icon, riders, JSON.stringify(coordinates || []), status]
    );
    return result.insertId;
  }

  static async update(id, zoneData) {
    const {
      name, coverage, time, fee, minOrder, icon, riders, coordinates, status
    } = zoneData;
    
    const [result] = await db.query(
      `UPDATE delivery_zones SET 
       name = ?, coverage = ?, delivery_time = ?, fee = ?, min_order = ?, icon = ?,
       riders = ?, coordinates = ?, status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [name, coverage, time, fee, minOrder, icon, riders, JSON.stringify(coordinates || []), status, id]
    );
    return result.affectedRows > 0;
  }

  static async updateRiders(id, riders) {
    const [result] = await db.query(
      'UPDATE delivery_zones SET riders = ?, updated_at = NOW() WHERE id = ?',
      [riders, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM delivery_zones WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}
export default DeliveryZone;