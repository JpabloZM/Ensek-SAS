// testEndToEnd.js - Complete end-to-end authentication and redirection test
import axios from 'axios';
import dotenv from 'dotenv';
import { connectDB, isUsingMockDB } from './config/db.js';
import { mockDb } from './config/mockDb.js';
import User from './models/userModel.js';

dotenv.config();

const API_URL = 'http://localhost:5000/api';

// Test credentials
const testUser = {
  name: 'End-to-End Test User',
  email: 'e2etest@example.com',
  password: 'password123',
  role: 'user'
};

const testAdmin = {
  name: 'End-to-End Test Admin',
  email: 'e2eadmin@example.com',
  password: 'admin123',
  role: 'admin'
};

// Function to test the entire auth flow
const testEndToEnd = async () => {
  try {
    console.log('============================================');
    console.log('ENSEK-SAS End-to-End Authentication Flow Test');
    console.log('============================================');
    
    // 1. Connect to the database
    console.log('\n1. Connecting to database...');
    await connectDB();
    console.log(`Using ${isUsingMockDB() ? 'MockDB' : 'MongoDB'}`);
    
    // 2. Test the health endpoint
    console.log('\n2. Testing /health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('Health endpoint status:', healthResponse.data.status);
    console.log('Database type:', healthResponse.data.databaseType);
    
    // 3. Register test users
    console.log('\n3. Registering test user...');
    let userRegistration;
    try {
      userRegistration = await axios.post(`${API_URL}/auth/register`, testUser);
      console.log('User registration successful:', userRegistration.data.success);
    } catch (error) {
      // User might already exist
      console.log('User registration failed, user might already exist');
    }
    
    console.log('\nRegistering test admin...');
    let adminRegistration;
    try {
      adminRegistration = await axios.post(`${API_URL}/auth/register`, testAdmin);
      console.log('Admin registration successful:', adminRegistration.data.success);
    } catch (error) {
      // Admin might already exist
      console.log('Admin registration failed, admin might already exist');
    }
    
    // 4. Test user login
    console.log('\n4. Testing user login...');
    const userLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('User login successful, received token:', !!userLoginResponse.data.user.token);
    console.log('User role:', userLoginResponse.data.user.role);
    
    const userToken = userLoginResponse.data.user.token;
    
    // 5. Test admin login
    console.log('\n5. Testing admin login...');
    const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: testAdmin.email,
      password: testAdmin.password
    });
    
    console.log('Admin login successful, received token:', !!adminLoginResponse.data.user.token);
    console.log('Admin role:', adminLoginResponse.data.user.role);
    
    const adminToken = adminLoginResponse.data.user.token;
    
    // 6. Test access to protected routes
    console.log('\n6. Testing regular user access to protected routes...');
    
    // Test user accessing user profile (should succeed)
    try {
      const userProfileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('User accessing profile - Success:', userProfileResponse.data.success);
    } catch (error) {
      console.log('User accessing profile - Failed');
    }
    
    // Test user accessing admin route (should fail)
    try {
      const userAdminRouteResponse = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      console.log('User accessing admin route - Failed to block');
    } catch (error) {
      console.log('User accessing admin route - Successfully blocked');
    }
    
    console.log('\n7. Testing admin access to protected routes...');
    
    // Test admin accessing user profile (should succeed)
    try {
      const adminProfileResponse = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('Admin accessing profile - Success:', adminProfileResponse.data.success);
    } catch (error) {
      console.log('Admin accessing profile - Failed');
    }
    
    // Test admin accessing admin route (should succeed)
    try {
      const adminRouteResponse = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log('Admin accessing admin route - Success');
    } catch (error) {
      console.log('Admin accessing admin route - Failed:', error.response?.data?.message || error.message);
    }
    
    console.log('\n============================================');
    console.log('End-to-End Authentication Test Complete!');
    console.log('============================================');
    
    // Clean up and exit
    process.exit(0);
  } catch (error) {
    console.error('Test Error:', error.response?.data || error.message);
    process.exit(1);
  }
};

// Run the test
testEndToEnd();
