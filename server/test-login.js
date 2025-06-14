// Test login script for debugging
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/userModel.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ensek')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// Test login with email and password
const testLogin = async (email, password) => {
  try {
    console.log(`Testing login for: ${email}`);
    
    // Find the user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.error('User not found');
      return false;
    }
    
    console.log('User found in database:', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (isMatch) {
      console.log('Login successful!');
      return true;
    } else {
      console.log('Password incorrect');
      return false;
    }
  } catch (error) {
    console.error('Error testing login:', error);
    return false;
  }
};

// Test the admin login
console.log('Testing admin login...');
testLogin('admin@test.com', 'admin123')
  .then(() => {
    console.log('\nTesting user login...');
    return testLogin('test@example.com', 'user123');
  })
  .then(() => {
    console.log('Tests completed');
    process.exit();
  })
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });
