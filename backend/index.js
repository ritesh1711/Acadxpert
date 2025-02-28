const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require("dotenv").config();
require("./Models/db");

const app = express();
const authRoutes = require('./Routes/AuthRouter');

const PORT = process.env.PORT || 8000;

// ✅ Apply CORS Middleware Before Routes
const corsOptions = {
    origin: ["http://localhost:3000", "https://acadxpert.onrender.com"], // Allowed Frontend URLs
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));

// ✅ Handle Preflight Requests for All Routes
app.options('*', (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": req.headers.origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true"
    });
    res.status(204).end();
});

// ✅ Apply Body Parser After CORS
app.use(bodyParser.json());

// ✅ Test Route
app.get('/a', (req, res) => {
    res.send('Hello, World!');
});

// ✅ Authentication Routes
app.use('/auth', authRoutes);

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
