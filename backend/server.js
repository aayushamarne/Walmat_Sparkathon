const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes'); 
const checkoutRoutes = require('./routes/checkout');
const recommendRoutes = require('./routes/recommend');
const app = express();


app.use(cors());
app.use(express.json());



// WO97ZuLImm4WHIwa
// ✅ MongoDB connection
mongoose.connect(
  'mongodb+srv://jadhavsanyog400:WO97ZuLImm4WHIwa@cluster0.fulpgez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

//  Routes
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api',recommendRoutes);

app.use('/api', productRoutes); // ✅ use product routes



// ✅ Server start
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});

require("./scheduler/recommendScheduler");

