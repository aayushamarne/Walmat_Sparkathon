const mongoose = require("mongoose");

const RatingSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "" },
    created_at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const VariantSchema = new mongoose.Schema(
  {
    variant_id: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String, required: true },
    storage: { type: String, default: "" },
    image: { type: String, default: "" },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema({
  product_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, default: "" },
  description: { type: String, default: "" },
  price: {
    original: { type: Number, required: true, min: 0 },
    discounted: { type: Number, min: 0 },
    currency: { type: String, default: "INR" },
  },
  type: { type: String, enum: ["clothing", "electronics"], required: true },
  variants: {
    type: [VariantSchema],
    required: true,
    validate: [(array) => array.length > 0, "At least one variant required"],
  },
  // ✅ NEW: Ratings
  ratings: { type: [RatingSchema], default: [] },
  average_rating: { type: Number, default: 0 },

  clothing_attributes: {
    fabric: { type: String, default: "" },
    skin_compatibility: {
      skin_types: { type: String },
      skin_tones: { type: String },
    },
    ar_tryon: {
      model_3d_url: { type: String, default: "" },
      instructions: { type: String, default: "" },
      pose_required: { type: String, default: "" },
    },
  },
  electronics_attributes: {
    processor: { type: String, default: "" },
    ram: { type: String, default: "" },
    storage: { type: String, default: "" },
    battery: { type: String, default: "" },
    display: { type: String, default: "" },
    warranty: { type: String, default: "" },
    connectivity: { type: [String], default: [] },
  },
  images: {
    main: { type: String, default: "" },
    gallery: { type: [String], default: [] },
  },
  meta: {
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    status: { type: String, default: "active" },
  },
});

// Update `updated_at` timestamp
ProductSchema.pre("save", function (next) {
  this.meta.updated_at = Date.now();
  next();
});

// ✅ Optional: method to recalculate average_rating
ProductSchema.methods.updateAverageRating = function () {
  if (!this.ratings || this.ratings.length === 0) {
    this.average_rating = 0;
  } else {
    const total = this.ratings.reduce((sum, r) => sum + r.rating, 0);
    this.average_rating = total / this.ratings.length;
  }
  return this.average_rating;
};

module.exports = mongoose.model("Product", ProductSchema);
