const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const authService = {
  // Get JWT token from localStorage
  getToken() {
    return localStorage.getItem('auth_token');
  },

  // Get user data from localStorage
  getUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated (has valid token)
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  },

  // Logout user - clear all auth data
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  // Make authenticated API requests with JWT token
  async authenticatedFetch(endpoint, options = {}) {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT token to Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Handle token expiration - auto logout
      if (response.status === 401) {
        console.log('Token expired or invalid, logging out...');
        this.logout();
        window.location.href = '/';
        throw new Error('Session expired. Please login again.');
      }

      return response;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  // Get current user info from server (protected route)
  async getCurrentUser() {
    try {
      const response = await this.authenticatedFetch('/me', {
        method: 'GET',
      });

      if (response.ok) {
        const userData = await response.json();
        // Update localStorage with fresh data
        localStorage.setItem('user_data', JSON.stringify(userData));
        return userData;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Logout from server (optional - calls logout endpoint)
  async logoutFromServer() {
    try {
      await this.authenticatedFetch('/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Server logout error:', error);
    } finally {
      // Always clear local data
      this.logout();
    }
  }
};