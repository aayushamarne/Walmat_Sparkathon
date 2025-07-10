
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




router.post('/getUserByEmail:email', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required' 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
    
    // Connect to database and find user
    const db = client.db('your_database_name'); // Replace with your database name
    const usersCollection = db.collection('users'); // Replace with your collection name
    
    const user = await usersCollection.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found with this email' 
      });
    }
    
    // Return user_id
    res.status(200).json({
      user_id: user._id.toString(), // Convert ObjectId to string
      email: user.email,
      success: true
    });
    
  } catch (error) {
    console.error('Error fetching user by email:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
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
    const { friends, currentUser } = req.body;

    // Validate request body
    if (!friends || !Array.isArray(friends) || !currentUser?.email || !currentUser?.user_id) {
      return res.status(400).json({
        results: [friends?.length ? "Invalid request data for sharing" : "No friends provided to collaborate"],
        validatedFriends: []
      });
    }

    const seenEmails = new Set();
    const validatedFriends = [];

    const results = await Promise.all(
      friends.map(async ({ email }, index) => {
        // 1. Check if email matches current user
        if (email === currentUser.email) {
          return "Cannot share with yourself";
        }

        // 2. Check for duplicate emails
        if (seenEmails.has(email)) {
          return "Duplicate friend email detected";
        }
        seenEmails.add(email);

        // 3. Check if user exists in DB
        const user = await User.findOne({ email });
        if (!user) {
          return "Invalid friend email for collaboration";
        }

        // Add valid user to validatedFriends
        validatedFriends.push({
          email: user.email,
          user_id: user._id.toString() // Convert MongoDB ObjectId to string
        });

        return ""; // No error
      })
    );

    return res.status(200).json({
      results,
      validatedFriends
    });
  } catch (err) {
    console.error("Validation error:", err);
    return res.status(500).json({
      results: ["Server error during friend validation"],
      validatedFriends: []
    });
  }
});




module.exports = router;
