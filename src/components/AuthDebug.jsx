import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthDebug = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [localStorageData, setLocalStorageData] = useState(null);

  // Check localStorage on component mount and when user changes
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setLocalStorageData(JSON.parse(storedUser));
      } else {
        setLocalStorageData(null);
      }
    } catch (err) {
      setLocalStorageData({ error: err.message });
    }
  }, [user]);

  const userInfo = user ? {
    name: user.name,
    email: user.email,
    role: user.role,
    // Don't show the token in UI for security reasons
    hasToken: !!user.token
  } : null;

  const handleClientRedirect = () => {
    navigate('/cliente');
  };

  const handleAdminRedirect = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const debugStyle = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '15px',
    borderRadius: '5px',
    fontSize: '14px',
    zIndex: 9999,
    maxWidth: '400px'
  };

  const buttonStyle = {
    marginRight: '10px',
    padding: '5px 10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer'
  };

  return (
    <div style={debugStyle}>
      <h3>Auth Debug Panel</h3>
      <p><strong>Authentication State:</strong> {loading ? 'Loading...' : (user ? 'Logged In ✅' : 'Not Logged In ❌')}</p>
      
      {userInfo && (
        <div>
          <h4>User Info from Auth Context:</h4>
          <pre>{JSON.stringify(userInfo, null, 2)}</pre>
        </div>
      )}
      
      <div>
        <h4>LocalStorage Status:</h4>
        <p>{localStorageData ? 'User data exists in localStorage ✅' : 'No user data in localStorage ❌'}</p>
        {localStorageData && localStorageData.token && (
          <p>Token starts with: {localStorageData.token.substring(0, 10)}...</p>
        )}
      </div>
      
      <div style={{ marginTop: '15px' }}>
        <button 
          style={buttonStyle}
          onClick={handleClientRedirect}
          disabled={!user || (user.role !== 'user' && user.role !== 'admin')}
        >
          Go to Client Area
        </button>
        
        <button 
          style={buttonStyle}
          onClick={handleAdminRedirect}
          disabled={!user || user.role !== 'admin'}
        >
          Go to Admin Area
        </button>
        
        <button 
          style={{...buttonStyle, backgroundColor: user ? '#f44336' : '#ccc'}}
          onClick={handleLogout}
          disabled={!user}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AuthDebug;