import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginSidebar from './LoginSidebar';
import LoginForm from './LoginForm';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errorMessage) setErrorMessage('');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: credentialResponse.credential
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
        
        alert(result.toast_content || "Login successful!");
        navigate('/dashboard');
      } else {
        setErrorMessage(result.detail || "Google login failed. Please try again.");
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      setErrorMessage("Could not connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google login failed. Please try again.');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', result.access_token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
        
        alert(result.toast_content || "Login successful!");
        navigate('/dashboard');
      } else {
        setErrorMessage(result.detail || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setErrorMessage("Could not connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <LoginSidebar />
        <LoginForm 
          formData={formData}
          showPassword={showPassword}
          errorMessage={errorMessage}
          isLoading={isLoading}
          handleChange={handleChange}
          setShowPassword={setShowPassword}
          handleLogin={handleLogin}
          handleGoogleSuccess={handleGoogleSuccess}
          handleGoogleError={handleGoogleError}
          navigate={navigate}
        />
      </div>
    </div>
  );
};

export default Login;