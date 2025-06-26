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

// GET All Products
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;