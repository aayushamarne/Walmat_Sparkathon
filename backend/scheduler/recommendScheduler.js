const cron = require("node-cron");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const sendRecommendationEmail = require("../utils/sendEmail"); // ✅ you already have this

mongoose.connect('mongodb+srv://jadhavsanyog400:WO97ZuLImm4WHIwa@cluster0.fulpgez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

console.log("✅ Recommendation scheduler initialized");

cron.schedule("*/5 * * * *", async () => {
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  try {
      const newProducts = await Product.find({
      type: "clothing",
      "meta.updated_at": { $gte: fiveMinutesAgo }
    });


    for (const product of newProducts) {
      const compat = product.clothing_attributes?.skin_compatibility;
      if (!compat || !compat.skin_types || !compat.skin_tones) continue;

      const users = await User.find({
        "skin_profile.skin_type": compat.skin_types.toLowerCase(),
        "skin_profile.skin_tone": compat.skin_tones.toLowerCase(),
      });

      for (const user of users) {
        try {
          await sendRecommendationEmail(user.email, product);
          console.log(`📩 Sent to ${user.email} for ${product.name}`);
        } catch (e) {
          console.error(`❌ Email error to ${user.email}:`, e.message);
        }
      }
    }
  } catch (err) {
    console.error("Scheduler failed:", err.message);
  }
});
