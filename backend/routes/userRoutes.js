
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

// GET current address using user_id
router.get("/address/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const user = await User.findOne({ user_id });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, address: user.address || "" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST updated address using user_id
router.post("/address/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { address } = req.body;

    const user = await User.findOneAndUpdate(
      { user_id },
      { address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, address: user.address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/validate-friends", async (req, res) => {
  try {
    const { friends,currentUser } = req.body;
    const seenIds = new Set();
    const seenEmails = new Set();

    const results = await Promise.all(
      friends.map(async ({ id, email }, index) => {
        // 1. Check if ID or Email matches current user (optional: pass user info from client)
        if (
          id === currentUser?.user_id || // if using auth
          email === currentUser?.email
        ) {
          return "Cannot add Yourself";
        }

        // 2. Check for duplicates in the list
        if (seenIds.has(id) || seenEmails.has(email)) {
          return "Duplicate friend ID or email";
        }

        seenIds.add(id);
        seenEmails.add(email);

        // 3. Check if user exists in DB
        const user = await User.findOne({ user_id: id, email });
        if (!user) {
          return "Invalid user ID or email";
        }
        return ""; // No error
      })
    );

    return res.status(200).json({ results });
  } catch (err) {
    console.error("Validation error:", err);
    return res.status(500).json({ message: "Server error during validation" });
  }
});




module.exports = router;
