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
    course: {
        type: String,
        required: true,
        enum: ['MCA', 'MBA', 'MTech'],
        default: 'MCA'
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
        default: 1
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
