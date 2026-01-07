import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../utils/auth';  
import './Dashboard.css';



const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jwtToken, setJwtToken] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Try to get user from localStorage first
      let userData = authService.getUser();
      
      // If not in localStorage, fetch from server using JWT
      if (!userData) {
        console.log('Fetching user data from server with JWT...');
        userData = await authService.getCurrentUser();
      }
      
      setUser(userData);
      
      // Get JWT token for display
      const token = authService.getToken();
      setJwtToken(token || '');
      
    } catch (error) {
      console.error('Error loading user:', error);
      // On error, redirect to login
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      // Call logout endpoint with JWT
      await authService.logoutFromServer();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and redirect
      authService.logout();
      navigate('/');
    }
  };

  const handleViewToken = () => {
    console.log('=== JWT TOKEN ===');
    console.log(jwtToken);
    console.log('=================');
    
    // Decode JWT to show payload (just for demonstration)
    try {
      const base64Url = jwtToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      console.log('JWT Payload:', payload);
      console.log('Token expires at:', new Date(payload.exp * 1000).toLocaleString());
      
      alert(`JWT Token logged to console!\n\nExpires: ${new Date(payload.exp * 1000).toLocaleString()}`);
    } catch (error) {
      console.error('Error decoding token:', error);
      alert('JWT Token logged to console!');
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    await loadUserData();
    alert('User data refreshed from server!');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <span className="jwt-badge">🔐 JWT Protected</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        {/* User Profile Card */}
        <div className="user-card">
          {user?.picture && (
            <img 
              src={user.picture} 
              alt="Profile" 
              className="user-avatar"
            />
          )}
          <h2>Welcome, {user?.fullname || 'User'}! 👋</h2>
          <div className="user-info">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Provider:</strong> {user?.provider || 'email'}</p>
          </div>
          <button onClick={handleRefreshData} className="refresh-btn">
            🔄 Refresh Data (Uses JWT)
          </button>
        </div>

        {/* JWT Token Info Card */}
        <div className="jwt-card">
          <h3>🔑 Your JWT Authentication</h3>
          <div className="jwt-info">
            <p className="jwt-status">
              ✅ <strong>Status:</strong> Authenticated
            </p>
            <p className="jwt-storage">
              📦 <strong>Storage:</strong> localStorage
            </p>
            <p className="jwt-expiry">
              ⏰ <strong>Expires:</strong> 24 hours
            </p>
          </div>
          
          <div className="jwt-token-preview">
            <p className="token-label">Token Preview:</p>
            <code className="token-display">
              {jwtToken.substring(0, 50)}...
            </code>
          </div>

          <div className="jwt-actions">
            <button onClick={handleViewToken} className="view-token-btn">
              👁️ View Full Token
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(jwtToken);
                alert('JWT token copied to clipboard!');
              }} 
              className="copy-token-btn"
            >
              📋 Copy Token
            </button>
          </div>

          <div className="jwt-usage">
            <p className="usage-title">How JWT is used:</p>
            <ol className="usage-list">
              <li>Token stored in localStorage after login</li>
              <li>Sent with every API request in Authorization header</li>
              <li>Server validates token before allowing access</li>
              <li>Auto-logout when token expires</li>
            </ol>
          </div>
        </div>

        {/* Protected Route Info */}
        <div className="info-card">
          <h3>🛡️ Protected Route</h3>
          <p>This page is protected by JWT authentication.</p>
          <p>Try accessing this URL without logging in - you'll be redirected!</p>
          <div className="test-section">
            <p><strong>Test it:</strong></p>
            <ol>
              <li>Copy this URL: <code>http://localhost:3000/dashboard</code></li>
              <li>Click Logout</li>
              <li>Try pasting the URL - you'll be redirected to login!</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;