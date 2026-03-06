import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class Admin {
  // Find admin by email
  static async findByEmail(email) {
    const [rows] = await pool.query(`
      SELECT * FROM admins WHERE email = ?
    `, [email]);
    
    return rows[0] || null;
  }

  // Find admin by ID with permissions
  static async findById(id) {
    const [admins] = await pool.query(`
      SELECT a.*, 
             GROUP_CONCAT(ap.permission) as permissions
      FROM admins a
      LEFT JOIN admin_permissions ap ON a.id = ap.admin_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [id]);
    
    if (admins.length === 0) return null;
    
    const admin = admins[0];
    admin.permissions = admin.permissions ? admin.permissions.split(',') : [];
    return admin;
  }

  // Authenticate admin
  static async authenticate(email, password) {
    const admin = await this.findByEmail(email);
    
    if (!admin) return null;
    if (!admin.is_active) return null;
    
    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) return null;
    
    // Update last login
    await pool.query(`
      UPDATE admins SET last_login = NOW() WHERE id = ?
    `, [admin.id]);
    
    // Get full admin with permissions
    return this.findById(admin.id);
  }

  // Generate JWT token
  static generateToken(admin) {
    return jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
  }

  // Create new admin
  static async create(adminData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Hash password
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      
      // Insert admin
      const [result] = await connection.query(`
        INSERT INTO admins (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, [
        adminData.name,
        adminData.email.toLowerCase(),
        hashedPassword,
        adminData.role || 'staff'
      ]);
      
      const adminId = result.insertId;
      
      // Insert permissions
      if (adminData.permissions && adminData.permissions.length > 0) {
        for (const permission of adminData.permissions) {
          await connection.query(`
            INSERT INTO admin_permissions (admin_id, permission)
            VALUES (?, ?)
          `, [adminId, permission]);
        }
      }
      
      await connection.commit();
      return adminId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Update admin
  static async update(id, adminData) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      let sql = 'UPDATE admins SET ';
      const values = [];
      const updates = [];
      
      if (adminData.name) {
        updates.push('name = ?');
        values.push(adminData.name);
      }
      
      if (adminData.role) {
        updates.push('role = ?');
        values.push(adminData.role);
      }
      
      if (adminData.is_active !== undefined) {
        updates.push('is_active = ?');
        values.push(adminData.is_active);
      }
      
      if (adminData.password) {
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        updates.push('password_hash = ?');
        values.push(hashedPassword);
      }
      
      if (updates.length > 0) {
        sql += updates.join(', ') + ' WHERE id = ?';
        values.push(id);
        await connection.query(sql, values);
      }
      
      // Update permissions
      if (adminData.permissions) {
        await connection.query('DELETE FROM admin_permissions WHERE admin_id = ?', [id]);
        
        for (const permission of adminData.permissions) {
          await connection.query(`
            INSERT INTO admin_permissions (admin_id, permission)
            VALUES (?, ?)
          `, [id, permission]);
        }
      }
      
      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get all admins
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT id, name, email, role, is_active, last_login, created_at
      FROM admins
      ORDER BY created_at DESC
    `);
    
    return rows;
  }

  // Check if email exists
  static async emailExists(email) {
    const [rows] = await pool.query(`
      SELECT id FROM admins WHERE email = ?
    `, [email]);
    
    return rows.length > 0;
  }
}
export default Admin;