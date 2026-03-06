import express from 'express';
const router = express.Router();
import Service from '../models/Service.js';
import FamilyPackage from '../models/FamilyPackage.js';
import DailyFreshProduct from '../models/DailyFreshProduct.js';
import SubscriptionPlan from '../models/SubscriptionPlan.js';
import OfficePack from '../models/OfficePack.js';
import StudentPack from '../models/StudentPack.js';
import StudentDeal from '../models/StudentDeal.js';
import DeliveryZone from '../models/DeliveryZone.js';
import DeliverySlot from '../models/DeliverySlot.js';
import { protect, authorize } from '../middleware/auth.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to format image URL for response (return only filename)
const formatImageUrl = (filename) => {
  if (!filename || filename === '/placeholder.svg' || filename.includes('placeholder')) {
    return null;
  }
  // Return just the filename - frontend will add the base URL
  return filename;
};

// Helper function to extract filename from URL or path
const getFilenameFromUrl = (url) => {
  if (!url) return null;
  // If it's a full URL, extract the filename
  if (url.includes('/')) {
    return url.split('/').pop();
  }
  return url;
};

// Helper function to process image in data
const processImageInData = (data) => {
  if (!data) return data;
  
  const processed = { ...data };
  
  // Handle single image field
  if (processed.image) {
    processed.image = formatImageUrl(processed.image);
  }
  
  // Handle images array if present
  if (processed.images && Array.isArray(processed.images)) {
    processed.images = processed.images.map(img => {
      if (typeof img === 'string') {
        return formatImageUrl(img);
      } else if (img && typeof img === 'object' && img.url) {
        return {
          ...img,
          url: formatImageUrl(img.url)
        };
      }
      return img;
    });
  }
  
  return processed;
};

// Helper function to process array of items
const processItems = (items) => {
  if (!items || !Array.isArray(items)) return items;
  return items.map(item => processImageInData(item));
};

// ============= SERVICE MANAGEMENT ROUTES =============

// Get all services
router.get('/admin/services', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const services = await Service.findAll();
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get service by ID
router.get('/admin/services/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create service
router.post('/admin/services', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const serviceId = await Service.create(req.body);
        const service = await Service.findById(serviceId);
        res.status(201).json(service);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update service
router.put('/admin/services/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const updated = await Service.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Service not found' });
        }
        const service = await Service.findById(req.params.id);
        res.json(service);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete service
router.delete('/admin/services/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const deleted = await Service.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get service stats
router.get('/admin/services/:id/stats', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const stats = await Service.getStats(req.params.id);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching service stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= FAMILY PACKAGES ROUTES =============

router.get('/admin/services/:serviceId/family-packages', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const packages = await FamilyPackage.findAll(req.params.serviceId);
        // Format image URLs - return only filenames
        const formattedPackages = processItems(packages);
        res.json(formattedPackages);
    } catch (error) {
        console.error('Error fetching family packages:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/services/:serviceId/family-packages/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const pkg = await FamilyPackage.findById(req.params.id);
        if (!pkg) {
            return res.status(404).json({ message: 'Package not found' });
        }
        // Format image URL - return only filename
        const formattedPackage = processImageInData(pkg);
        res.json(formattedPackage);
    } catch (error) {
        console.error('Error fetching family package:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/family-packages', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const packageData = { 
            ...req.body, 
            serviceId: req.params.serviceId,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Creating family package with data:', packageData);
        const packageId = await FamilyPackage.create(packageData);
        const newPackage = await FamilyPackage.findById(packageId);
        
        // Format the response
        res.status(201).json(processImageInData(newPackage));
    } catch (error) {
        console.error('Error creating family package:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/services/:serviceId/family-packages/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const packageData = { 
            ...req.body,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Updating family package with data:', packageData);
        const updated = await FamilyPackage.update(req.params.id, packageData);
        if (!updated) {
            return res.status(404).json({ message: 'Package not found' });
        }
        const pkg = await FamilyPackage.findById(req.params.id);
        res.json(processImageInData(pkg));
    } catch (error) {
        console.error('Error updating family package:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/services/:serviceId/family-packages/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Get package to delete image file
        const pkg = await FamilyPackage.findById(req.params.id);
        
        const deleted = await FamilyPackage.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Package not found' });
        }
        
        // Delete image file if exists
        if (pkg && pkg.image) {
            const imagePath = path.join(__dirname, '../uploads/products', pkg.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted image file:', imagePath);
            }
        }
        
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting family package:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= DAILY FRESH PRODUCTS ROUTES =============

router.get('/admin/services/:serviceId/daily-fresh', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const products = await DailyFreshProduct.findAll(req.params.serviceId);
        // Format image URLs - return only filenames
        const formattedProducts = processItems(products);
        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching daily fresh products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/services/:serviceId/daily-fresh/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const product = await DailyFreshProduct.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(processImageInData(product));
    } catch (error) {
        console.error('Error fetching daily fresh product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/daily-fresh', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const productData = { 
            ...req.body, 
            serviceId: req.params.serviceId,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Creating daily fresh product with data:', productData);
        const productId = await DailyFreshProduct.create(productData);
        const newProduct = await DailyFreshProduct.findById(productId);
        
        res.status(201).json(processImageInData(newProduct));
    } catch (error) {
        console.error('Error creating daily fresh product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/services/:serviceId/daily-fresh/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const productData = { 
            ...req.body,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Updating daily fresh product with data:', productData);
        const updated = await DailyFreshProduct.update(req.params.id, productData);
        if (!updated) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await DailyFreshProduct.findById(req.params.id);
        res.json(processImageInData(product));
    } catch (error) {
        console.error('Error updating daily fresh product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/admin/services/:serviceId/daily-fresh/:id/freshness', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const { freshness } = req.body;
        const updated = await DailyFreshProduct.updateFreshness(req.params.id, freshness);
        if (!updated) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const product = await DailyFreshProduct.findById(req.params.id);
        res.json(processImageInData(product));
    } catch (error) {
        console.error('Error updating freshness:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/services/:serviceId/daily-fresh/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Get product to delete image file
        const product = await DailyFreshProduct.findById(req.params.id);
        
        const deleted = await DailyFreshProduct.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Delete image file if exists
        if (product && product.image) {
            const imagePath = path.join(__dirname, '../uploads/products', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted image file:', imagePath);
            }
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting daily fresh product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= SUBSCRIPTION PLANS ROUTES =============

router.get('/admin/services/:serviceId/subscriptions', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const plans = await SubscriptionPlan.findAll(req.params.serviceId);
        // Format image URLs - return only filenames
        const formattedPlans = processItems(plans);
        res.json(formattedPlans);
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/services/:serviceId/subscriptions/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.json(processImageInData(plan));
    } catch (error) {
        console.error('Error fetching subscription plan:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/subscriptions', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const planData = { 
            ...req.body, 
            serviceId: req.params.serviceId,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Creating subscription plan with data:', planData);
        const planId = await SubscriptionPlan.create(planData);
        const newPlan = await SubscriptionPlan.findById(planId);
        
        res.status(201).json(processImageInData(newPlan));
    } catch (error) {
        console.error('Error creating subscription plan:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/services/:serviceId/subscriptions/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const planData = { 
            ...req.body,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Updating subscription plan with data:', planData);
        const updated = await SubscriptionPlan.update(req.params.id, planData);
        if (!updated) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        const plan = await SubscriptionPlan.findById(req.params.id);
        res.json(processImageInData(plan));
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/admin/services/:serviceId/subscriptions/:id/popularity', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const { popularity } = req.body;
        const updated = await SubscriptionPlan.updatePopularity(req.params.id, popularity);
        if (!updated) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        const plan = await SubscriptionPlan.findById(req.params.id);
        res.json(processImageInData(plan));
    } catch (error) {
        console.error('Error updating popularity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/services/:serviceId/subscriptions/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Get plan to delete image file
        const plan = await SubscriptionPlan.findById(req.params.id);
        
        const deleted = await SubscriptionPlan.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        
        // Delete image file if exists
        if (plan && plan.image) {
            const imagePath = path.join(__dirname, '../uploads/products', plan.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted image file:', imagePath);
            }
        }
        
        res.json({ message: 'Plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscription plan:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= OFFICE PACKS ROUTES =============

router.get('/admin/services/:serviceId/office-packs', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const packs = await OfficePack.findAll(req.params.serviceId);
        // Format image URLs - return only filenames
        const formattedPacks = processItems(packs);
        res.json(formattedPacks);
    } catch (error) {
        console.error('Error fetching office packs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/services/:serviceId/office-packs/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const pack = await OfficePack.findById(req.params.id);
        if (!pack) {
            return res.status(404).json({ message: 'Pack not found' });
        }
        res.json(processImageInData(pack));
    } catch (error) {
        console.error('Error fetching office pack:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/office-packs', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const packData = { 
            ...req.body, 
            serviceId: req.params.serviceId,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Creating office pack with data:', packData);
        const packId = await OfficePack.create(packData);
        const newPack = await OfficePack.findById(packId);
        
        res.status(201).json(processImageInData(newPack));
    } catch (error) {
        console.error('Error creating office pack:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/services/:serviceId/office-packs/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const packData = { 
            ...req.body,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Updating office pack with data:', packData);
        const updated = await OfficePack.update(req.params.id, packData);
        if (!updated) {
            return res.status(404).json({ message: 'Pack not found' });
        }
        const pack = await OfficePack.findById(req.params.id);
        res.json(processImageInData(pack));
    } catch (error) {
        console.error('Error updating office pack:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/services/:serviceId/office-packs/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Get pack to delete image file
        const pack = await OfficePack.findById(req.params.id);
        
        const deleted = await OfficePack.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Pack not found' });
        }
        
        // Delete image file if exists
        if (pack && pack.image) {
            const imagePath = path.join(__dirname, '../uploads/products', pack.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted image file:', imagePath);
            }
        }
        
        res.json({ message: 'Pack deleted successfully' });
    } catch (error) {
        console.error('Error deleting office pack:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= STUDENT PACKS ROUTES =============

router.get('/admin/services/:serviceId/student-packs', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const packs = await StudentPack.findAll(req.params.serviceId);
        // Format image URLs - return only filenames
        const formattedPacks = processItems(packs);
        res.json(formattedPacks);
    } catch (error) {
        console.error('Error fetching student packs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/services/:serviceId/student-packs/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const pack = await StudentPack.findById(req.params.id);
        if (!pack) {
            return res.status(404).json({ message: 'Pack not found' });
        }
        res.json(processImageInData(pack));
    } catch (error) {
        console.error('Error fetching student pack:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/student-packs', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const packData = { 
            ...req.body, 
            serviceId: req.params.serviceId,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Creating student pack with data:', packData);
        const packId = await StudentPack.create(packData);
        const newPack = await StudentPack.findById(packId);
        
        res.status(201).json(processImageInData(newPack));
    } catch (error) {
        console.error('Error creating student pack:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/services/:serviceId/student-packs/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Extract filename if full URL is provided
        const packData = { 
            ...req.body,
            image: getFilenameFromUrl(req.body.image) // Extract just the filename
        };
        
        console.log('Updating student pack with data:', packData);
        const updated = await StudentPack.update(req.params.id, packData);
        if (!updated) {
            return res.status(404).json({ message: 'Pack not found' });
        }
        const pack = await StudentPack.findById(req.params.id);
        res.json(processImageInData(pack));
    } catch (error) {
        console.error('Error updating student pack:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/services/:serviceId/student-packs/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        // Get pack to delete image file
        const pack = await StudentPack.findById(req.params.id);
        
        const deleted = await StudentPack.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Pack not found' });
        }
        
        // Delete image file if exists
        if (pack && pack.image) {
            const imagePath = path.join(__dirname, '../uploads/products', pack.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Deleted image file:', imagePath);
            }
        }
        
        res.json({ message: 'Pack deleted successfully' });
    } catch (error) {
        console.error('Error deleting student pack:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= STUDENT DEALS ROUTES =============
// (No images in student deals, so no changes needed)

router.get('/admin/services/:serviceId/student-deals', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const deals = await StudentDeal.findAll(req.params.serviceId);
        res.json(deals);
    } catch (error) {
        console.error('Error fetching student deals:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/services/:serviceId/student-deals/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const deal = await StudentDeal.findById(req.params.id);
        if (!deal) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        res.json(deal);
    } catch (error) {
        console.error('Error fetching student deal:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/student-deals', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const dealData = { ...req.body, serviceId: req.params.serviceId };
        console.log('Creating student deal with data:', dealData);
        const dealId = await StudentDeal.create(dealData);
        const newDeal = await StudentDeal.findById(dealId);
        res.status(201).json(newDeal);
    } catch (error) {
        console.error('Error creating student deal:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/services/:serviceId/student-deals/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        console.log('Updating student deal with data:', req.body);
        const updated = await StudentDeal.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        const deal = await StudentDeal.findById(req.params.id);
        res.json(deal);
    } catch (error) {
        console.error('Error updating student deal:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/admin/services/:serviceId/student-deals/:id/usage', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const updated = await StudentDeal.incrementUsage(req.params.id);
        if (!updated) {
            return res.status(400).json({ message: 'Unable to increment usage - limit reached or deal not found' });
        }
        const deal = await StudentDeal.findById(req.params.id);
        res.json(deal);
    } catch (error) {
        console.error('Error incrementing deal usage:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/services/:serviceId/student-deals/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const deleted = await StudentDeal.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        res.json({ message: 'Deal deleted successfully' });
    } catch (error) {
        console.error('Error deleting student deal:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= DELIVERY ZONES ROUTES =============
// (No images in delivery zones, so no changes needed)

router.get('/admin/services/:serviceId/delivery-zones', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const zones = await DeliveryZone.findAll(req.params.serviceId);
        res.json(zones);
    } catch (error) {
        console.error('Error fetching delivery zones:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/services/:serviceId/delivery-zones/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const zone = await DeliveryZone.findById(req.params.id);
        if (!zone) {
            return res.status(404).json({ message: 'Zone not found' });
        }
        res.json(zone);
    } catch (error) {
        console.error('Error fetching delivery zone:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/delivery-zones', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const zoneData = { ...req.body, serviceId: req.params.serviceId };
        console.log('Creating delivery zone with data:', zoneData);
        const zoneId = await DeliveryZone.create(zoneData);
        const newZone = await DeliveryZone.findById(zoneId);
        res.status(201).json(newZone);
    } catch (error) {
        console.error('Error creating delivery zone:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/services/:serviceId/delivery-zones/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        console.log('Updating delivery zone with data:', req.body);
        const updated = await DeliveryZone.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Zone not found' });
        }
        const zone = await DeliveryZone.findById(req.params.id);
        res.json(zone);
    } catch (error) {
        console.error('Error updating delivery zone:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/admin/services/:serviceId/delivery-zones/:id/riders', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const { riders } = req.body;
        const updated = await DeliveryZone.updateRiders(req.params.id, riders);
        if (!updated) {
            return res.status(404).json({ message: 'Zone not found' });
        }
        const zone = await DeliveryZone.findById(req.params.id);
        res.json(zone);
    } catch (error) {
        console.error('Error updating riders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/services/:serviceId/delivery-zones/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const deleted = await DeliveryZone.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Zone not found' });
        }
        res.json({ message: 'Zone deleted successfully' });
    } catch (error) {
        console.error('Error deleting delivery zone:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= DELIVERY SLOTS ROUTES =============
// (No images in delivery slots, so no changes needed)

router.get('/admin/services/:serviceId/delivery-slots', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const slots = await DeliverySlot.findAll(req.params.serviceId);
        res.json(slots);
    } catch (error) {
        console.error('Error fetching delivery slots:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/admin/services/:serviceId/delivery-slots/:id', protect, authorize(['admin', 'manager', 'super_admin']), async (req, res) => {
    try {
        const slot = await DeliverySlot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        res.json(slot);
    } catch (error) {
        console.error('Error fetching delivery slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/delivery-slots', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const slotData = { ...req.body, serviceId: req.params.serviceId };
        console.log('Creating delivery slot with data:', slotData);
        const slotId = await DeliverySlot.create(slotData);
        const newSlot = await DeliverySlot.findById(slotId);
        res.status(201).json(newSlot);
    } catch (error) {
        console.error('Error creating delivery slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/admin/services/:serviceId/delivery-slots/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        console.log('Updating delivery slot with data:', req.body);
        const updated = await DeliverySlot.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        const slot = await DeliverySlot.findById(req.params.id);
        res.json(slot);
    } catch (error) {
        console.error('Error updating delivery slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.patch('/admin/services/:serviceId/delivery-slots/:id/availability', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const { available } = req.body;
        const updated = await DeliverySlot.updateAvailability(req.params.id, available);
        if (!updated) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        const slot = await DeliverySlot.findById(req.params.id);
        res.json(slot);
    } catch (error) {
        console.error('Error updating slot availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/admin/services/:serviceId/delivery-slots/:id', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    try {
        const deleted = await DeliverySlot.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Slot not found' });
        }
        res.json({ message: 'Slot deleted successfully' });
    } catch (error) {
        console.error('Error deleting delivery slot:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= BULK OPERATIONS =============

router.post('/admin/services/:serviceId/:type/bulk-status', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    const { ids, status } = req.body;
    const { serviceId, type } = req.params;
    
    try {
        let model;
        switch(type) {
            case 'family-packages':
                model = FamilyPackage;
                break;
            case 'daily-fresh':
                model = DailyFreshProduct;
                break;
            case 'subscriptions':
                model = SubscriptionPlan;
                break;
            case 'office-packs':
                model = OfficePack;
                break;
            case 'student-packs':
                model = StudentPack;
                break;
            case 'student-deals':
                model = StudentDeal;
                break;
            case 'delivery-zones':
                model = DeliveryZone;
                break;
            case 'delivery-slots':
                model = DeliverySlot;
                break;
            default:
                return res.status(400).json({ message: 'Invalid type' });
        }

        const results = await Promise.all(
            ids.map(id => model.update(id, { status }))
        );
        
        res.json({ message: `Updated ${results.filter(Boolean).length} items successfully` });
    } catch (error) {
        console.error('Error bulk updating status:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/admin/services/:serviceId/:type/bulk-delete', protect, authorize(['admin', 'super_admin']), async (req, res) => {
    const { ids } = req.body;
    const { serviceId, type } = req.params;
    
    try {
        let model;
        switch(type) {
            case 'family-packages':
                model = FamilyPackage;
                break;
            case 'daily-fresh':
                model = DailyFreshProduct;
                break;
            case 'subscriptions':
                model = SubscriptionPlan;
                break;
            case 'office-packs':
                model = OfficePack;
                break;
            case 'student-packs':
                model = StudentPack;
                break;
            case 'student-deals':
                model = StudentDeal;
                break;
            case 'delivery-zones':
                model = DeliveryZone;
                break;
            case 'delivery-slots':
                model = DeliverySlot;
                break;
            default:
                return res.status(400).json({ message: 'Invalid type' });
        }

        const results = await Promise.all(
            ids.map(id => model.delete(id))
        );
        
        res.json({ message: `Deleted ${results.filter(Boolean).length} items successfully` });
    } catch (error) {
        console.error('Error bulk deleting:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============= PUBLIC ROUTES =============

// Get all active services for public
router.get('/services', async (req, res) => {
    try {
        const services = await Service.findAll();
        const activeServices = services.filter(s => s.status === 'active');
        res.json(activeServices);
    } catch (error) {
        console.error('Error fetching public services:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get family packages for public
router.get('/services/family-packages', async (req, res) => {
    try {
        console.log('='.repeat(50));
        console.log('🔍 PUBLIC API CALLED: GET /services/family-packages');
        console.log('Time:', new Date().toISOString());
        console.log('='.repeat(50));
        
        console.log('1. Fetching all services from database...');
        const services = await Service.findAll();
        console.log(`   Found ${services.length} total services`);
        
        if (services.length > 0) {
            console.log('   All services:', services.map(s => ({ 
                id: s.id, 
                type: s.type, 
                name: s.name, 
                status: s.status 
            })));
        }
        
        console.log('2. Looking for active family service...');
        const familyService = services.find(s => s.type === 'family' && s.status === 'active');
        
        if (!familyService) {
            console.log('❌ No active family service found!');
            console.log('   Available service types:', [...new Set(services.map(s => s.type))]);
            console.log('   Returning empty array');
            return res.json([]);
        }
        
        console.log('✅ Found family service:', {
            id: familyService.id,
            name: familyService.name,
            type: familyService.type,
            status: familyService.status
        });
        
        console.log(`3. Fetching packages for service ID: ${familyService.id}`);
        const packages = await FamilyPackage.findAll(familyService.id);
        console.log(`   Found ${packages.length} total packages`);
        
        if (packages.length > 0) {
            console.log('   All packages:', packages.map(p => ({
                id: p.id,
                name: p.name,
                status: p.status,
                price: p.price
            })));
        }
        
        console.log('4. Filtering active packages...');
        const activePackages = packages.filter(p => p.status === 'active');
        console.log(`   Found ${activePackages.length} active packages`);
        
        // Format image URLs - return only filenames
        const formattedPackages = activePackages.map(pkg => ({
            ...pkg,
            image: formatImageUrl(pkg.image)
        }));
        
        console.log('5. Sending response with', formattedPackages.length, 'packages');
        console.log('='.repeat(50));
        
        res.json(formattedPackages);
    } catch (error) {
        console.error('❌ ERROR in /services/family-packages:', error);
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Get daily fresh products for public
router.get('/services/daily-fresh', async (req, res) => {
    try {
        const services = await Service.findAll();
        const dailyService = services.find(s => s.type === 'daily' && s.status === 'active');
        if (!dailyService) {
            return res.json([]);
        }
        const products = await DailyFreshProduct.findAll(dailyService.id);
        const activeProducts = products.filter(p => p.status === 'active');
        
        // Format image URLs - return only filenames
        const formattedProducts = activeProducts.map(product => ({
            ...product,
            image: formatImageUrl(product.image)
        }));
        
        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching public daily fresh:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get subscription plans for public
router.get('/services/subscriptions', async (req, res) => {
    try {
        const services = await Service.findAll();
        const subService = services.find(s => s.type === 'subscription' && s.status === 'active');
        if (!subService) {
            return res.json([]);
        }
        const plans = await SubscriptionPlan.findAll(subService.id);
        const activePlans = plans.filter(p => p.status === 'active');
        
        // Format image URLs - return only filenames
        const formattedPlans = activePlans.map(plan => ({
            ...plan,
            image: formatImageUrl(plan.image)
        }));
        
        res.json(formattedPlans);
    } catch (error) {
        console.error('Error fetching public subscriptions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get office packs for public
router.get('/services/office-packs', async (req, res) => {
    try {
        const services = await Service.findAll();
        const officeService = services.find(s => s.type === 'office' && s.status === 'active');
        if (!officeService) {
            return res.json([]);
        }
        const packs = await OfficePack.findAll(officeService.id);
        const activePacks = packs.filter(p => p.status === 'active');
        
        // Format image URLs - return only filenames
        const formattedPacks = activePacks.map(pack => ({
            ...pack,
            image: formatImageUrl(pack.image)
        }));
        
        res.json(formattedPacks);
    } catch (error) {
        console.error('Error fetching public office packs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get student packs for public
router.get('/services/student-packs', async (req, res) => {
    try {
        const services = await Service.findAll();
        const studentService = services.find(s => s.type === 'student' && s.status === 'active');
        if (!studentService) {
            return res.json([]);
        }
        const packs = await StudentPack.findAll(studentService.id);
        const activePacks = packs.filter(p => p.status === 'active');
        
        // Format image URLs - return only filenames
        const formattedPacks = activePacks.map(pack => ({
            ...pack,
            image: formatImageUrl(pack.image)
        }));
        
        res.json(formattedPacks);
    } catch (error) {
        console.error('Error fetching public student packs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get student deals for public
router.get('/services/student-deals', async (req, res) => {
    try {
        const services = await Service.findAll();
        const studentService = services.find(s => s.type === 'student' && s.status === 'active');
        if (!studentService) {
            return res.json([]);
        }
        const deals = await StudentDeal.findAll(studentService.id);
        const now = new Date();
        const activeDeals = deals.filter(d => 
            d.status === 'active' && 
            new Date(d.expiry_date) > now &&
            d.used_count < d.usage_limit
        );
        
        res.json(activeDeals);
    } catch (error) {
        console.error('Error fetching public student deals:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get delivery zones for public
router.get('/services/delivery-zones', async (req, res) => {
    try {
        const services = await Service.findAll();
        const expressService = services.find(s => s.type === 'express' && s.status === 'active');
        if (!expressService) {
            return res.json([]);
        }
        const zones = await DeliveryZone.findAll(expressService.id);
        res.json(zones.filter(z => z.status === 'active'));
    } catch (error) {
        console.error('Error fetching public delivery zones:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get delivery slots for public
router.get('/services/delivery-slots', async (req, res) => {
    try {
        const services = await Service.findAll();
        const expressService = services.find(s => s.type === 'express' && s.status === 'active');
        if (!expressService) {
            return res.json([]);
        }
        const slots = await DeliverySlot.findAll(expressService.id);
        res.json(slots.filter(s => s.status === 'active' && s.available));
    } catch (error) {
        console.error('Error fetching public delivery slots:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check delivery availability
router.get('/services/delivery/check/:zoneId', async (req, res) => {
    try {
        const zone = await DeliveryZone.findById(req.params.zoneId);
        if (!zone || zone.status !== 'active') {
            return res.json({ available: false });
        }
        
        // Check if zone has active riders and is within coverage
        const available = zone.riders > 0 && zone.coverage !== 'coming';
        
        res.json({ available });
    } catch (error) {
        console.error('Error checking delivery availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;