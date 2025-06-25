const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect('mongodb+srv://jadhavsanyog400:uV4rQncnzmhMQxu2@tryllectdb.ugskpj5.mongodb.net/?retryWrites=true&w=majority&appName=TryllectDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));

  // app.get('/login',(req,res)=>{
  //   res.send("welcome to login")
  // })

app.use('/api/users', userRoutes);


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});


