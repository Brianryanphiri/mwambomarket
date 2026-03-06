import db from '../config/database.js';

class SubscriptionPlan {
  static async findAll(serviceId) {
    const [rows] = await db.query(
      'SELECT * FROM subscription_plans WHERE service_id = ? ORDER BY created_at DESC',
      [serviceId]
    );
    return rows.map(row => this.formatPlan(row));
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM subscription_plans WHERE id = ?', [id]);
    return rows[0] ? this.formatPlan(rows[0]) : null;
  }

  static async create(planData) {
    const {
      serviceId, name, description, price, originalPrice, interval_type,
      category, items, popularity, savings, discount, features, image,
      color, bg_color, icon, minimum_commitment, trial_days, setup_fee,
      cancellation_fee, popular, best_value, status
    } = planData;
    
    const [result] = await db.query(
      `INSERT INTO subscription_plans 
       (service_id, name, description, price, original_price, interval_type,
        category, items, popularity, savings, discount, features, image,
        color, bg_color, icon, minimum_commitment, trial_days, setup_fee,
        cancellation_fee, popular, best_value, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [serviceId, name, description, price, originalPrice, interval_type,
       category, items, popularity, savings, discount, JSON.stringify(features || []),
       image, color, bg_color, icon, minimum_commitment, trial_days, setup_fee,
       cancellation_fee, popular, best_value, status]
    );
    return result.insertId;
  }

  static async update(id, planData) {
    const {
      name, description, price, originalPrice, interval_type, category,
      items, popularity, savings, discount, features, image,
      color, bg_color, icon, minimum_commitment, trial_days, setup_fee,
      cancellation_fee, popular, best_value, status
    } = planData;
    
    const [result] = await db.query(
      `UPDATE subscription_plans SET 
       name = ?, description = ?, price = ?, original_price = ?, interval_type = ?,
       category = ?, items = ?, popularity = ?, savings = ?, discount = ?,
       features = ?, image = ?, color = ?, bg_color = ?, icon = ?,
       minimum_commitment = ?, trial_days = ?, setup_fee = ?, cancellation_fee = ?,
       popular = ?, best_value = ?, status = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, price, originalPrice, interval_type, category,
       items, popularity, savings, discount, JSON.stringify(features || []),
       image, color, bg_color, icon, minimum_commitment, trial_days, setup_fee,
       cancellation_fee, popular, best_value, status, id]
    );
    return result.affectedRows > 0;
  }

  static async updatePopularity(id, popularity) {
    const [result] = await db.query(
      'UPDATE subscription_plans SET popularity = ?, updated_at = NOW() WHERE id = ?',
      [popularity, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM subscription_plans WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static formatPlan(row) {
    return {
      id: row.id.toString(),
      serviceId: row.service_id.toString(),
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : null,
      interval: row.interval_type,
      category: row.category,
      items: row.items,
      popularity: row.popularity,
      savings: row.savings ? parseFloat(row.savings) : 0,
      discount: row.discount,
      features: row.features ? JSON.parse(row.features) : [],
      image: row.image,
      color: row.color || 'text-indigo-600',
      bgColor: row.bg_color || 'bg-indigo-50',
      icon: row.icon || 'Package',
      minimumCommitment: row.minimum_commitment,
      trialDays: row.trial_days,
      setupFee: row.setup_fee ? parseFloat(row.setup_fee) : 0,
      cancellationFee: row.cancellation_fee ? parseFloat(row.cancellation_fee) : 0,
      popular: row.popular === 1,
      bestValue: row.best_value === 1,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export default SubscriptionPlan;