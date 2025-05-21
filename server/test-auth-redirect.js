// Auth redirection test script
import fetch from 'node-fetch';
import chalk from 'chalk';

// Configuration
const API_URL = 'http://localhost:5000/api';

// Test function - ensure the backend is running when this is called
const testLoginAndToken = async () => {
  console.log(chalk.blue('==== AUTHENTICATION & REDIRECTION TEST ===='));
  console.log(chalk.yellow('Testing login flow for regular user...'));

  try {
    // Test login
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@test.com',
        password: 'user123',
      }),
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log(chalk.red('❌ Login failed:'), loginData.message);
      return;
    }

    console.log(chalk.green('✓ Login successful'));
    
    if (!loginData.user.token) {
      console.log(chalk.red('❌ No token returned in login response'));
      return;
    }
    
    console.log(chalk.green('✓ JWT token received correctly'));
    console.log(chalk.yellow('Testing token validation...'));

    // Test profile access with token
    const profileResponse = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginData.user.token}`,
        'Content-Type': 'application/json',
      },
    });

    const profileData = await profileResponse.json();
    
    if (!profileResponse.ok) {
      console.log(chalk.red('❌ Profile access failed:'), profileData.message);
      return;
    }

    console.log(chalk.green('✓ Profile access successful with token'));
    console.log(chalk.green('✓ Authentication flow working correctly'));
    
    // Display important information
    console.log(chalk.blue('\nToken information:'));
    console.log(`Token: ${loginData.user.token.substring(0, 15)}...`);
    console.log(`User role: ${loginData.user.role}`);
    console.log(`User ID: ${loginData.user._id}`);

    console.log(chalk.blue('\nTroubleshooting information:'));
    console.log('1. Ensure token is properly saved in localStorage');
    console.log('2. Verify that the ClientProtectedRoute component is checking for token existence');
    console.log('3. Check that API interceptors are correctly attaching the token in requests');
  } catch (error) {
    console.log(chalk.red('❌ Test failed with error:'), error.message);
  }
};

testLoginAndToken();
