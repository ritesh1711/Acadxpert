require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./Models/User');

const initAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin123@gmail.com' });
    if (existingAdmin) {
      console.log('Admin account already exists');
      await mongoose.disconnect();
      return;
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin',
      email: 'admin123@gmail.com',
      password: hashedPassword,
      isAdmin: true
    });

    await admin.save();
    console.log('Admin account created successfully');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error initializing admin account:', error);
  }
};

initAdmin(); 