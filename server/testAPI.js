// testAPI.js - Simple script to test the API functionality
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

// Test health endpoint
const testHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('Health Check:', data);
    return data;
  } catch (error) {
    console.error('Health Check Failed:', error.message);
  }
};

// Test login endpoint
const testLogin = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123',
      }),
    });
    const data = await response.json();
    console.log('Login Test:', data);
    return data;
  } catch (error) {
    console.error('Login Test Failed:', error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('Starting API Tests...');
  
  // Test health endpoint
  await testHealth();
  
  // Test login endpoint
  await testLogin();
  
  console.log('API Tests Completed');
};

runTests();
