const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const newUser = new User({ ...req.body, user_id: "USER" + Date.now() });
    await newUser.save();
    res.json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password_hash: password });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    user.last_login = new Date().toISOString();
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
// PUT /api/users/:user_id
router.put('/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const updateData = req.body;

    // Optional: sanitize allowed fields
    // const allowedFields = ['name', 'phone', 'avatar_url', 'skin_profile'];
    // const sanitizedData = Object.fromEntries(
    //   Object.entries(updateData).filter(([key]) => allowedFields.includes(key))
    // );

    const user = await User.findOneAndUpdate(
      { user_id },               // match by custom `user_id` field
      { $set: updateData },      // set only provided fields
      { new: true }              // return the updated document
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
