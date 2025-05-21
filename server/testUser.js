// testUser.js - Create a test user for development
import dotenv from 'dotenv';
import User from './models/userModel.js';
import { connectDB, isUsingMockDB } from './config/db.js';
import { mockDb } from './config/mockDb.js';
import bcrypt from 'bcrypt';

dotenv.config();

// Test user data
const testUser = {
  name: 'Test User',
  email: 'user@test.com',
  password: 'user123',
  role: 'user',
  phone: '123-456-7890',
  address: '123 Test St'
};

const testAdmin = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'admin123',
  role: 'admin',
  phone: '987-654-3210',
  address: '456 Admin St'
};

// Function to create test users
const createTestUsers = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Check if we're using MockDB or real MongoDB
    if (isUsingMockDB()) {
      console.log('Using MockDB for development');
      
      // Check if test user exists
      const existingUser = await mockDb.findUserByEmail(testUser.email);
      if (!existingUser) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testUser.password, salt);
        
        // Create test user
        await mockDb.createUser({
          ...testUser,
          password: hashedPassword
        });
        console.log('Test user created successfully!');
      } else {
        console.log('Test user already exists');
      }
      
      // Check if admin user exists
      const existingAdmin = await mockDb.findUserByEmail(testAdmin.email);
      if (!existingAdmin) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testAdmin.password, salt);
        
        // Create admin user
        await mockDb.createUser({
          ...testAdmin,
          password: hashedPassword
        });
        console.log('Admin user created successfully!');
      } else {
        console.log('Admin user already exists');
      }
    } else {
      console.log('Using MongoDB');
      
      // Check if test user exists
      let existingUser = await User.findOne({ email: testUser.email });
      if (!existingUser) {
        // Create test user
        await User.create(testUser);
        console.log('Test user created successfully!');
      } else {
        console.log('Test user already exists');
      }
      
      // Check if admin user exists
      let existingAdmin = await User.findOne({ email: testAdmin.email });
      if (!existingAdmin) {
        // Create admin user
        await User.create(testAdmin);
        console.log('Admin user created successfully!');
      } else {
        console.log('Admin user already exists');
      }
    }
    
    console.log('Test users setup complete! You can now login with:');
    console.log('- User: email=user@test.com, password=user123');
    console.log('- Admin: email=admin@test.com, password=admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
