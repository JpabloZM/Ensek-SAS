// testAuth.js - Test the authentication endpoints

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

const testAuth = async () => {
  try {
    console.log('Testing Authentication Endpoints');
    console.log('===============================');
    
    // 1. Test the health route
    console.log('1. Testing /health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('Health response:', healthResponse.data);
    
    // 2. Test user registration
    console.log('\n2. Testing user registration...');
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'user',
      phone: '123-456-7890',
      address: '123 Test St'
    };
    
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, userData);
      console.log('Registration response:', registerResponse.data);
    } catch (error) {
      console.log('User may already exist, continuing with test...');
    }
    
    // 3. Test user login
    console.log('\n3. Testing user login...');
    const loginData = {
      email: 'testuser@example.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
    console.log('Login response:', loginResponse.data);
    
    const token = loginResponse.data.user.token;
    
    // 4. Test getting user profile
    console.log('\n4. Testing get user profile...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Profile response:', profileResponse.data);
    
    // 5. Test admin registration
    console.log('\n5. Testing admin registration...');
    const adminData = {
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'admin123',
      role: 'admin',
      phone: '123-456-7890',
      address: '123 Admin St'
    };
    
    try {
      const adminRegisterResponse = await axios.post(`${API_URL}/auth/register`, adminData);
      console.log('Admin registration response:', adminRegisterResponse.data);
    } catch (error) {
      console.log('Admin may already exist, continuing with test...');
    }
    
    // 6. Test admin login
    console.log('\n6. Testing admin login...');
    const adminLoginData = {
      email: 'testadmin@example.com',
      password: 'admin123'
    };
    
    const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, adminLoginData);
    console.log('Admin login response:', adminLoginResponse.data);
    
    console.log('\nAll authentication tests completed successfully!');
  } catch (error) {
    console.error('Error during authentication tests:', error.response?.data || error.message);
  }
};

testAuth();
