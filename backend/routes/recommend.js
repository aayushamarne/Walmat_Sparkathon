const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const sendRecommendationEmail = require('../utils/sendEmail');

// GET /api/recommend/:userId
router.get('/recommend/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { skin_type, skin_tone } = user.skin_profile || {};

    // Find matching products
    const products = await Product.find({
      type: 'clothing',
      'clothing_attributes.skin_compatibility.skin_types': skin_type,
      'clothing_attributes.skin_compatibility.skin_tones': skin_tone
    });

    if (products.length === 0) {
      return res.json({ message: 'No matching products found' });
    }

    // Send email with top product
    await sendRecommendationEmail(user.email, products[0]);

    res.json({ message: 'Recommendation email sent', product: products[0] });
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
