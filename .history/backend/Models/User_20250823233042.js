const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    user: {
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
    isAdmin: {
        type: Boolean,
        default: false
    },
    course: {
        type: String,
        enum: ['MCA', 'MBA', 'MTech'],
        default: 'MCA'
    },
    semester: {
        type: Number,
        min: 1,
        max: 4,
        default: 1
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

const User = mongoose.model('User', userSchema);

module.exports = User;
