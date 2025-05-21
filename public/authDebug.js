// Diagnostic tool to test authentication flow in the browser console
// Copy and paste this entire script into your browser console when on the application

(function() {
  console.log('==== ENSEK-SAS Authentication Flow Debug ====');
  
  // Check LocalStorage
  console.log('\n1. Checking localStorage for user data:');
  const storedUser = localStorage.getItem('user');
  
  if (storedUser) {
    try {
      const userData = JSON.parse(storedUser);
      console.log('✓ User data found in localStorage:', {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        hasToken: !!userData.token
      });
      
      // Check token
      if (!userData.token) {
        console.error('✗ No token found in user data!');
      } else {
        console.log('✓ Token exists in user data');
        
        // Check JWT token structure
        const tokenParts = userData.token.split('.');
        if (tokenParts.length !== 3) {
          console.error('✗ Token is not in valid JWT format (should have 3 parts)');
        } else {
          console.log('✓ Token is in valid JWT format');
          
          // Decode JWT payload (middle part)
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('✓ JWT payload:', payload);
            
            // Check token expiration
            if (payload.exp) {
              const expirationDate = new Date(payload.exp * 1000);
              const isExpired = expirationDate < new Date();
              
              if (isExpired) {
                console.error(`✗ Token is expired! Expired at: ${expirationDate}`);
              } else {
                console.log(`✓ Token is valid until: ${expirationDate}`);
              }
            }
          } catch (e) {
            console.error('✗ Failed to decode JWT payload:', e);
          }
        }
      }
    } catch (e) {
      console.error('✗ Failed to parse user data from localStorage:', e);
    }
  } else {
    console.log('✗ No user data found in localStorage');
  }
  
  // Check React App State
  console.log('\n2. Checking React application state:');
  
  // Look for AuthDebug component
  const authDebugElement = document.querySelector('[style*="zIndex: 9999"]');
  if (authDebugElement) {
    console.log('✓ AuthDebug component found in the DOM');
  } else {
    console.log('✗ AuthDebug component not found in the DOM');
  }
  
  // Check current route
  console.log('Current route:', window.location.pathname);
  
  // Provide suggestions based on current route
  if (window.location.pathname === '/login' && storedUser) {
    console.log('ℹ️ You are on the login page but already have user data in localStorage.');
    console.log('   This might indicate an authentication/redirection issue.');
  }
  
  if (window.location.pathname.startsWith('/cliente') && !storedUser) {
    console.log('ℹ️ You are on a client route but have no user data in localStorage.');
    console.log('   This might indicate you should be redirected to login soon.');
  }
  
  if (window.location.pathname.startsWith('/admin') && !storedUser) {
    console.log('ℹ️ You are on an admin route but have no user data in localStorage.');
    console.log('   This might indicate you should be redirected to login soon.');
  }
  
  // Provide debugging suggestions
  console.log('\n3. Debugging suggestions:');
  console.log('- If you\'re having redirection issues, check that the token is valid');
  console.log('- For issues with protected routes, ensure your roles are correct:');
  console.log('  • Regular user should have role: "user"');
  console.log('  • Admin should have role: "admin"');
  console.log('- To fix token issues, try logging out and logging back in');
  console.log('- If problems persist, clear localStorage and try again:');
  console.log('  localStorage.removeItem("user")');
  
  console.log('\n==== End of Authentication Debug ====');
})();
