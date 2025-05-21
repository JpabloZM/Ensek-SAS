import React, { useState, useEffect } from 'react';
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from 'react-router-dom';
import "../admin/auth/Auth.css";

const AuthDebugPage = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [localStorageData, setLocalStorageData] = useState(null);
  const [tokenDetails, setTokenDetails] = useState(null);

  useEffect(() => {
    // Check localStorage
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setLocalStorageData(parsed);
        
        // Check token if it exists
        if (parsed && parsed.token) {
          const tokenParts = parsed.token.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const expiration = payload.exp ? new Date(payload.exp * 1000) : null;
              setTokenDetails({
                payload,
                expiration,
                isExpired: expiration ? expiration < new Date() : null
              });
            } catch (e) {
              setTokenDetails({ error: 'Failed to decode token payload' });
            }
          } else {
            setTokenDetails({ error: 'Token is not in valid JWT format' });
          }
        }
      }
    } catch (e) {
      setLocalStorageData({ error: e.message });
    }
  }, [user]);

  const clearLocalStorage = () => {
    localStorage.removeItem('user');
    setLocalStorageData(null);
    setTokenDetails(null);
    window.location.reload();
  };

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

  if (loading) {
    return <div className="auth-container">
      <div className="auth-card">
        <h2>Cargando autenticación...</h2>
      </div>
    </div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '800px' }}>
        <h2>Diagnóstico de Autenticación</h2>
        
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <h3>Estado de Autenticación:</h3>
          <p><strong>Estado:</strong> {user ? '✅ Autenticado' : '❌ No autenticado'}</p>
          
          {user && (
            <div>
              <h4>Información del Usuario (Auth Context):</h4>
              <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                {JSON.stringify({
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  hasToken: !!user.token,
                  id: user._id
                }, null, 2)}
              </pre>
            </div>
          )}
          
          <h4>Estado de LocalStorage:</h4>
          {localStorageData ? (
            <>
              <p>✅ Datos encontrados en localStorage</p>
              <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
                {JSON.stringify({
                  name: localStorageData.name,
                  email: localStorageData.email,
                  role: localStorageData.role,
                  hasToken: !!localStorageData.token,
                  id: localStorageData._id
                }, null, 2)}
              </pre>
            </>
          ) : (
            <p>❌ No hay datos en localStorage</p>
          )}
          
          {tokenDetails && (
            <div>
              <h4>Información del Token:</h4>
              {tokenDetails.error ? (
                <p style={{ color: 'red' }}>❌ Error: {tokenDetails.error}</p>
              ) : (
                <>
                  <p><strong>ID del usuario:</strong> {tokenDetails.payload.id}</p>
                  <p><strong>Expiración:</strong> {tokenDetails.expiration?.toLocaleString()}</p>
                  <p><strong>Estado:</strong> {tokenDetails.isExpired ? '❌ Expirado' : '✅ Válido'}</p>
                </>
              )}
            </div>
          )}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            className="auth-button"
            onClick={handleClientRedirect}
            disabled={!user || (user.role !== 'user' && user.role !== 'admin')}
            style={{ marginRight: '10px', opacity: !user || (user.role !== 'user' && user.role !== 'admin') ? 0.5 : 1 }}
          >
            Ir al Área de Cliente
          </button>
          
          <button 
            className="auth-button"
            onClick={handleAdminRedirect}
            disabled={!user || user.role !== 'admin'}
            style={{ marginRight: '10px', opacity: !user || user.role !== 'admin' ? 0.5 : 1 }}
          >
            Ir al Área de Admin
          </button>
          
          <button 
            className="auth-button"
            onClick={handleLogout}
            disabled={!user}
            style={{ marginRight: '10px', opacity: !user ? 0.5 : 1, backgroundColor: '#f44336' }}
          >
            Cerrar Sesión
          </button>
          
          <button 
            className="auth-button"
            onClick={clearLocalStorage}
            style={{ backgroundColor: '#ff9800' }}
          >
            Limpiar localStorage
          </button>
        </div>
        
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h3>Solución de problemas:</h3>
          <ul>
            <li>Si no puede acceder a rutas protegidas, verifique que el token sea válido</li>
            <li>Si hay problemas de redirección, asegúrese de que el rol sea correcto:
              <ul>
                <li>Usuario regular debe tener rol: "user"</li>
                <li>Administrador debe tener rol: "admin"</li>
              </ul>
            </li>
            <li>Para arreglar problemas con el token, intente cerrar sesión y volver a iniciar sesión</li>
            <li>Si los problemas persisten, use el botón "Limpiar localStorage" e intente nuevamente</li>
          </ul>
        </div>
        
      </div>
    </div>
  );
};

export default AuthDebugPage;
