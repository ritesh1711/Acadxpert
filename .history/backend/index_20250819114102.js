const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require("dotenv").config();
require("./Models/db");
const multer = require('multer');


const authRoutes = require('./Routes/AuthRouter'); 

const PORT = process.env.PORT || 8000;


app.use(bodyParser.json());
app.use(cors());


app.get('/a', (req, res) => {
    res.send('Hello, World!');
});


app.use('/auth', authRoutes);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
