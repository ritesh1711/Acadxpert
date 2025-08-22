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
      // Ensure admin flags and defaults are present
      if (!existingAdmin.isAdmin) existingAdmin.isAdmin = true;
      if (!existingAdmin.course) existingAdmin.course = 'MCA';
      if (!existingAdmin.semester) existingAdmin.semester = 1;
      await existingAdmin.save();
      console.log('Admin account ensured/updated');
      await mongoose.disconnect();
      return;
    }

    // Create admin account
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin',
      email: 'admin123@gmail.com',
      password: hashedPassword,
      isAdmin: true,
      course: 'MCA',
      semester: 1
    });

    await admin.save();
    console.log('Admin account created successfully');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error initializing admin account:', error);
  }
};

initAdmin(); 