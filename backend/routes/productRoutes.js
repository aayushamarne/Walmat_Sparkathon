const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');




router.get('/products/search', async (req, res) => {
  const { query } = req.query;

  if (!query) return res.status(400).json({ success: false, message: 'Missing search query' });

  const regexWords = query.trim().split(/\s+/).map(word => new RegExp(word, 'i'));

  // Combine words using $and, and match each word to multiple fields
  const andConditions = regexWords.map(regex => ({
    $or: [
      { name: regex },
      { description: regex },
      { brand: regex },
      { category: regex },
      { tags: regex }
    ]
  }));

  try {
    const products = await Product.find({ $and: andConditions });

    if (products.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, products });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE Product
router.post('/add', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Basic validation
    if (!req.body.product_id || !req.body.name || !req.body.category || !req.body.type) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        error: "Product ID, name, category, and type are required"
      });
    }

    // Check for existing product
    const existingProduct = await Product.findOne({ product_id: req.body.product_id }).session(session);
    if (existingProduct) {
      await session.abortTransaction();
      return res.status(409).json({
        success: false,
        error: "Product ID already exists"
      });
    }

    // Create and save product
    const product = new Product(req.body);
    await product.save({ session });
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      product: product.toObject()
    });
  } catch (error) {
    await session.abortTransaction();
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    session.endSession();
  }
});
// GET All or Filtered Products
router.get('/products', async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};

    const products = await Product.find(filter);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.get('/products/top-rated', async (req, res) => {
  try {
    const products = await Product.find().sort({ average_rating: -1 }).limit(5);
    res.json({ success: true, products });
  } catch (error) {
    console.error("Error in /top-rated:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});





router.post('/products/rate/:productId', async (req, res) => {
  const { productId } = req.params;
  const { rating, review } = req.body;
  console.log(req.body);

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Add to ratings
    product.ratings.push({ rating, review, user_id: "anonymous" }); // Replace with real user_id if available

    // Recalculate average rating
    product.updateAverageRating();

    await product.save();

    res.json({ success: true, message: "Review added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products/:productId', async (req, res) => {
  try {
    const product = await Product.findOne({ product_id: req.params.productId });


    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/products/:productId/reviews', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ reviews: product.ratings }); // 👈 returns the actual reviews
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:productId', async (req, res) => {
  try {
    const result = await Product.deleteOne({ product_id: req.params.productId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});




// Update Variant + Price
router.put('/products/:productId/variant/:variantId', async (req, res) => {
  const { productId, variantId } = req.params;
  const { color, size, stock } = req.body;
  const { original, discounted } = req.body.price || {};

  try {
    const product = await Product.findOne({ product_id: productId });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Find and update variant
    const variant = product.variants.find(v => v.variant_id === variantId);
    if (!variant) return res.status(404).json({ success: false, message: "Variant not found" });

    if (color !== undefined) variant.color = color;
    if (size !== undefined) variant.size = size;
    if (stock !== undefined) variant.stock = stock;

    // Update price if provided
    if (original !== undefined || discounted !== undefined) {
      if (!product.price) product.price = {};
      if (original !== undefined) product.price.original = original;
      if (discounted !== undefined) product.price.discounted = discounted;
    }

    await product.save();
    res.json({ success: true, message: "Variant and price updated successfully", product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});





module.exports = router;