const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  email: { type: String, unique: true },
  password_hash: String,
  phone: String,
  role: String,
  avatar_url: String,

  skin_profile: {
    skin_type: String,
    skin_tone: String,
  },

  preferences: {
    preferred_categories: [String],
    notifications_enabled: Boolean,
  },

  wishlist: [
    {
      product_id: String,
      variant_id: String,
      added_at: String,
    }
  ],

  cart: [
    {
      product_id: String,
      variant_id: String,
      quantity: Number,
      added_at: String,
    }
  ],

  orders: [
    {
      order_id: String,
      items: [
        {
          product_id: String,
          variant_id: String,
          quantity: Number,
          price_paid: Number
        }
      ],
      status: String,
      ordered_at: String,
    }
  ],

  created_at: String,
  last_login: String,
  status: String
});

module.exports = mongoose.model("User", UserSchema);
