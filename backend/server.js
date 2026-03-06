import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js'; // Import subscription routes
import { testConnection } from './config/database.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// More permissive CORS for development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const productsDir = path.join(uploadsDir, 'products');

console.log('Current directory:', __dirname);
console.log('Uploads directory path:', uploadsDir);
console.log('Products directory path:', productsDir);

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory at:', uploadsDir);
}

if (!fs.existsSync(productsDir)) {
  fs.mkdirSync(productsDir, { recursive: true });
  console.log('✅ Created products upload directory at:', productsDir);
}

// IMPORTANT: Serve static files BEFORE other routes
// Fix: Mount at /uploads/products to avoid path duplication
app.use('/uploads/products', express.static(productsDir, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set content type based on file extension
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    
    // Set CORS headers
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Add a debug middleware to log all requests to /uploads/products
app.use('/uploads/products', (req, res, next) => {
  console.log('📸 Uploads request:', req.url);
  console.log('Full path:', path.join(productsDir, req.url));
  console.log('File exists:', fs.existsSync(path.join(productsDir, req.url)));
  next();
});

// Also serve root uploads for backward compatibility (if needed)
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// ============= ROUTES =============
// Routes (these come AFTER static file serving)

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', serviceRoutes);
app.use('/api', subscriptionRoutes); // Add subscription routes here

// ============= PUBLIC ROUTES =============

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mwambo Store API is running',
    endpoints: {
      products: '/api/products',
      orders: '/api/orders',
      admin: '/api/admin',
      services: '/api/services',
      subscriptions: '/api/subscriptions',
      uploads: '/uploads/products'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: req.app.locals.dbConnected ? 'connected' : 'disconnected',
    uploadsDir: productsDir,
    uploadsExist: fs.existsSync(productsDir)
  });
});

// Test endpoint to list all uploaded files
app.get('/api/uploads/list', (req, res) => {
  try {
    if (fs.existsSync(productsDir)) {
      const files = fs.readdirSync(productsDir);
      res.json({ 
        files,
        count: files.length,
        directory: productsDir
      });
    } else {
      res.json({ files: [], count: 0, directory: productsDir, exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test image access endpoint
app.get('/api/test-image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(productsDir, filename);
  
  console.log('Testing image:', imagePath);
  console.log('File exists:', fs.existsSync(imagePath));
  
  if (fs.existsSync(imagePath)) {
    res.json({ 
      exists: true, 
      path: `/uploads/products/${filename}`,
      fullPath: imagePath,
      fileSize: fs.statSync(imagePath).size
    });
  } else {
    res.status(404).json({ 
      exists: false, 
      message: 'Image not found',
      searchedPath: imagePath
    });
  }
});

// ============= SUBSCRIPTION PUBLIC INFO =============

// Get subscription service info
app.get('/api/subscriptions/info', (req, res) => {
  res.json({
    name: 'Smart Subscriptions',
    description: 'Auto-delivery for your essentials',
    features: [
      'Save up to 25% on regular purchases',
      'Free delivery on all subscriptions',
      'Skip, pause, or cancel anytime',
      'Flexible delivery schedule',
      'Freshness guaranteed'
    ],
    contact: {
      email: 'subscriptions@mwambostore.com',
      phone: '+265 999 123 456',
      support: 'support@mwambostore.com'
    }
  });
});

// ============= ERROR HANDLING =============

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler for undefined routes (this should be last)
app.use('*', (req, res) => {
  // Don't return 404 for uploads that might be handled by static middleware
  if (req.url.startsWith('/uploads/')) {
    console.log('Uploads 404:', req.url);
    return res.status(404).json({ 
      message: 'Image not found',
      path: req.url,
      fullPath: path.join(productsDir, req.url.replace('/uploads/products/', ''))
    });
  }
  
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// ============= SERVER STARTUP =============

// Test database connection on startup
const startServer = async () => {
  // Test database connection
  const dbConnected = await testConnection();
  app.locals.dbConnected = dbConnected;
  
  if (!dbConnected) {
    console.warn('⚠️  Starting server without database connection. Some features may not work.');
  }

  // Try different ports if the default is in use
  const tryPort = (port) => {
    const server = app.listen(port)
      .on('error', (err) => {
        if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
          console.log(`Port ${port} is busy, trying ${port + 1}...`);
          tryPort(port + 1);
        } else {
          console.error('Server error:', err);
        }
      })
      .on('listening', () => {
        console.log('\n' + '='.repeat(60));
        console.log('✅ SERVER STARTED SUCCESSFULLY');
        console.log('='.repeat(60));
        console.log(`📡 Server running on port ${port}`);
        console.log(`📡 API URL: http://localhost:${port}/api`);
        console.log('\n📝 AVAILABLE ENDPOINTS:');
        console.log('   📦 Products:    http://localhost:${port}/api/products');
        console.log('   📦 Orders:      http://localhost:${port}/api/orders');
        console.log('   🛠️  Admin:       http://localhost:${port}/api/admin');
        console.log('   🎯 Services:    http://localhost:${port}/api/services');
        console.log('   🔄 Subscriptions: http://localhost:${port}/api/subscriptions');
        console.log('\n📸 SUBSCRIPTION ENDPOINTS:');
        console.log('   📋 List Plans:    GET    /api/subscriptions/plans');
        console.log('   📋 Plan Details:  GET    /api/subscriptions/plans/:id');
        console.log('   ➕ Create:        POST   /api/subscriptions');
        console.log('   🔍 Find:          POST   /api/subscriptions/find');
        console.log('   🔗 Send Link:     POST   /api/subscriptions/send-link');
        console.log('   📋 Get by Token:  GET    /api/subscriptions/manage');
        console.log('   📋 Get by ID:     GET    /api/subscriptions/:id');
        console.log('   ✏️ Update:        PUT    /api/subscriptions/:id');
        console.log('   ⏸️ Pause:         POST   /api/subscriptions/:id/pause');
        console.log('   ▶️ Resume:        POST   /api/subscriptions/:id/resume');
        console.log('   ⛔ Cancel:        POST   /api/subscriptions/:id/cancel');
        console.log('   📦 Deliveries:    GET    /api/subscriptions/:id/deliveries');
        console.log('\n📸 Uploads URL: http://localhost:${port}/uploads/products');
        console.log(`📸 Uploads directory: ${productsDir}`);
        console.log(`🔧 CORS enabled for: ${allowedOrigins.join(', ')}`);
        
        // Test if uploads directory is accessible
        if (fs.existsSync(productsDir)) {
          const files = fs.readdirSync(productsDir);
          console.log(`\n📁 Uploads directory contains ${files.length} files`);
          if (files.length > 0) {
            console.log('📸 Sample files:', files.slice(0, 3));
          }
        } else {
          console.log('❌ Uploads directory does not exist at:', productsDir);
        }
        
        if (dbConnected) {
          console.log('\n✅ Database: Connected');
        } else {
          console.log('\n❌ Database: Not connected - check your MySQL server');
        }
        
        console.log('='.repeat(60) + '\n');
      });
  };

  const startPort = parseInt(process.env.PORT) || 5001;
  tryPort(startPort);
};

// Start the server
startServer();

export default app;