import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mwambo_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL database connected successfully');
    await connection.query('SELECT 1');
    console.log('✅ Database query test passed');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   Access denied. Check your database credentials.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   Database does not exist. Please create it first.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Database server is not running. Start MySQL first.');
    }
    return false;
  }
};

// Get connection from pool
export const getConnection = async () => {
  return await pool.getConnection();
};

// Execute query with error handling
export const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Check database health
export const checkDatabaseHealth = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return { 
      status: 'healthy', 
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Initialize database with required tables
export const initializeDatabase = async () => {
  try {
    console.log('📦 Checking database tables...');
    
    // Check if products table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'products'
    `, [process.env.DB_NAME || 'mwambo_store']);
    
    if (tables.length === 0) {
      console.log('📦 Creating database tables...');
      
      // Read and execute schema file if it exists
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        console.log('✅ Database tables created successfully from schema file');
      } else {
        console.log('⚠️ Schema file not found. Please run the SQL manually from the provided script.');
      }
    } else {
      console.log('✅ Database tables already exist');
      
      // Check for required columns and add if missing
      await ensureTableColumns();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message);
    return false;
  }
};

// Ensure all required columns exist in tables
async function ensureTableColumns() {
  try {
    // Check products table columns
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM information_schema.columns 
      WHERE table_schema = ? AND table_name = 'products'
    `, [process.env.DB_NAME || 'mwambo_store']);
    
    const existingColumns = columns.map(c => c.COLUMN_NAME);
    
    // Columns to add if missing
    const requiredColumns = [
      { name: 'sku', definition: 'VARCHAR(100) UNIQUE' },
      { name: 'barcode', definition: 'VARCHAR(100)' },
      { name: 'low_stock_alert', definition: 'INT DEFAULT 10' },
      { name: 'weight', definition: 'DECIMAL(10, 2)' },
      { name: 'is_taxable', definition: 'BOOLEAN DEFAULT true' },
      { name: 'tax_rate', definition: 'VARCHAR(20)' },
      { name: 'is_physical', definition: 'BOOLEAN DEFAULT true' },
      { name: 'requires_shipping', definition: 'BOOLEAN DEFAULT true' },
      { name: 'status', definition: "ENUM('active', 'draft', 'out_of_stock') DEFAULT 'active'" },
      { name: 'seo_title', definition: 'VARCHAR(255)' },
      { name: 'seo_description', definition: 'TEXT' },
      { name: 'seo_keywords', definition: 'TEXT' },
      { name: 'created_by', definition: 'INT' },
      { name: 'updated_by', definition: 'INT' }
    ];
    
    for (const column of requiredColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding missing column: ${column.name} to products table`);
        await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS ${column.name} ${column.definition}`);
      }
    }
    
    // Check for indexes
    const [indexes] = await pool.query(`
      SELECT INDEX_NAME 
      FROM information_schema.statistics 
      WHERE table_schema = ? AND table_name = 'products'
    `, [process.env.DB_NAME || 'mwambo_store']);
    
    const existingIndexes = indexes.map(i => i.INDEX_NAME);
    
    if (!existingIndexes.includes('idx_status')) {
      await pool.query('CREATE INDEX idx_status ON products(status)');
    }
    
    if (!existingIndexes.includes('idx_sku')) {
      await pool.query('CREATE INDEX idx_sku ON products(sku)');
    }
    
    console.log('✅ Table columns and indexes verified');
  } catch (error) {
    console.error('Error ensuring table columns:', error);
  }
}

// Transaction helper
export const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;