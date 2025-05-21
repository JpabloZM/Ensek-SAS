// fullAuthTest.js - Complete authentication system test
import axios from 'axios';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { connectDB, isUsingMockDB } from './config/db.js';
import { mockDb } from './config/mockDb.js';
import User from './models/userModel.js';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

// Test credentials
const testUserCredentials = {
  name: 'Test Auth User',
  email: 'testauthuser@example.com',
  password: 'password123',
  role: 'user'
};

// Function to test the entire auth flow
const testAuthFlow = async () => {
  try {
    console.log('=======================================');
    console.log('ENSEK-SAS Full Authentication Flow Test');
    console.log('=======================================');
    
    // 1. Connect to the database
    console.log('\n1. Connecting to database...');
    await connectDB();
    console.log(`Using ${isUsingMockDB() ? 'MockDB' : 'MongoDB'}`);
    
    // 2. Clean up any existing test user
    console.log('\n2. Cleaning up existing test user...');
    if (isUsingMockDB()) {
      const existingUser = await mockDb.findUserByEmail(testUserCredentials.email);
      if (existingUser) {
        console.log('Found existing user in MockDB, will be overwritten');
      }
    } else {
      await User.deleteOne({ email: testUserCredentials.email });
      console.log('Removed any existing test user from MongoDB');
    }
    
    // 3. Test direct registration with the model
    console.log('\n3. Testing direct user creation in database...');
    let dbUser;
    
    if (isUsingMockDB()) {
      // For MockDB, we need to hash the password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testUserCredentials.password, salt);
      
      dbUser = await mockDb.createUser({
        name: testUserCredentials.name,
        email: testUserCredentials.email,
        password: hashedPassword,
        role: testUserCredentials.role
      });
      
      console.log('User created directly in MockDB:', dbUser._id);
    } else {
      dbUser = await User.create(testUserCredentials);
      console.log('User created directly in MongoDB:', dbUser._id);
    }
    
    // 4. Test direct password verification
    console.log('\n4. Testing direct password verification...');
    let passwordMatch;
    
    if (isUsingMockDB()) {
      // For MockDB, we need to compare the password manually
      const user = await mockDb.findUserByEmail(testUserCredentials.email);
      passwordMatch = await bcrypt.compare(testUserCredentials.password, user.password);
    } else {
      const user = await User.findOne({ email: testUserCredentials.email }).select('+password');
      passwordMatch = await user.matchPassword(testUserCredentials.password);
    }
    
    console.log('Direct password verification result:', passwordMatch);
    
    // 5. Test API registration
    console.log('\n5. Testing API registration...');
    try {
      const apiUser = {
        name: 'API Test User',
        email: 'apitestuser@example.com',
        password: 'apipassword123',
        role: 'user'
      };
      
      const registerResponse = await axios.post(`${API_URL}/auth/register`, apiUser);
      console.log('API Registration successful:', registerResponse.data.success);
      console.log('User ID:', registerResponse.data.user._id);
      
      // 6. Test API login
      console.log('\n6. Testing API login with registered user...');
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: apiUser.email,
        password: apiUser.password
      });
      
      console.log('API Login successful:', loginResponse.data.success);
      console.log('Received token:', loginResponse.data.user.token ? 'Yes' : 'No');
      
      // Store token for next test
      const token = loginResponse.data.user.token;
      
      // 7. Test protected route
      console.log('\n7. Testing protected route access...');
      const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Protected route access successful:', profileResponse.data.success);
      console.log('Retrieved user data:', profileResponse.data.user.email);
      
    } catch (apiError) {
      console.error('API Test Error:', apiError.response?.data || apiError.message);
    }
    
    console.log('\n=======================================');
    console.log('Authentication Test Complete!');
    console.log('=======================================');
    
    // Clean up and exit
    process.exit(0);
  } catch (error) {
    console.error('Test Error:', error);
    process.exit(1);
  }
};

// Run the test
testAuthFlow();
