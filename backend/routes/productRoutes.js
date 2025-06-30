const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

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


module.exports = router;