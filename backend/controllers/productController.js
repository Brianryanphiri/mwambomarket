import Product from '../models/Product.js';

// Get all products with filters
export const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 20,
      featured,
      bestSeller,
      onSale
    } = req.query;

    const filters = {
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      featured: featured === 'true',
      bestSeller: bestSeller === 'true',
      onSale: onSale === 'true'
    };

    const pagination = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const products = await Product.findAll(filters, pagination);
    const total = await Product.count(filters);

    res.json({
      products,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

// Get best sellers
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.getBestSellers(20);
    res.json(products);
  } catch (error) {
    console.error('Get best sellers error:', error);
    res.status(500).json({ message: 'Failed to fetch best sellers' });
  }
};

// Get new arrivals
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.getNewArrivals(20);
    res.json(products);
  } catch (error) {
    console.error('Get new arrivals error:', error);
    res.status(500).json({ message: 'Failed to fetch new arrivals' });
  }
};

// Get deals
export const getDeals = async (req, res) => {
  try {
    const products = await Product.getDeals(20);
    res.json(products);
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
};

// Get trending
export const getTrending = async (req, res) => {
  try {
    const products = await Product.findAll(
      { sort: 'popular' },
      { limit: 20 }
    );
    res.json(products);
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({ message: 'Failed to fetch trending products' });
  }
};

// Get by category
export const getByCategory = async (req, res) => {
  try {
    const products = await Product.findAll(
      { category: req.params.category },
      { limit: 50 }
    );
    res.json(products);
  } catch (error) {
    console.error('Get by category error:', error);
    res.status(500).json({ message: 'Failed to fetch category products' });
  }
};

// Create product (admin)
export const createProduct = async (req, res) => {
  try {
    const productId = await Product.create(req.body);
    const product = await Product.findById(productId);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Update product (admin)
export const updateProduct = async (req, res) => {
  try {
    await Product.update(req.params.id, req.body);
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product (admin)
export const deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Update stock (admin)
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body;
    await Product.update(req.params.id, { stock });
    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Failed to update stock' });
  }
};