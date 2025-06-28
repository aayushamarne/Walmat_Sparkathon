const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes'); // ✅ new import
const checkoutRoutes = require('./routes/checkout');
const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(
  'mongodb+srv://jadhavsanyog400:uV4rQncnzmhMQxu2@tryllectdb.ugskpj5.mongodb.net/?retryWrites=true&w=majority&appName=TryllectDB',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// ✅ Routes
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/', productRoutes); // ✅ use product routes

// ✅ Server start
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});
