const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin"], // Allowed values: "user" or "admin"
        default: "user" // Default role is "user"
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

const User = mongoose.model('User', userSchema);
module.exports = User;
