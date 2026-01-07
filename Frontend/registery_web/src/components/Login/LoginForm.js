import React from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = ({
  formData,
  showPassword,
  errorMessage,
  isLoading,
  handleChange,
  setShowPassword,
  handleLogin,
  handleGoogleSuccess,
  handleGoogleError,
  navigate
}) => {
  return (
    <div className="login-right">
      <h2 className="login-title">Log in</h2>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <Mail className="input-icon" size={18} />
          <input 
            type="email" 
            name="email"
            placeholder="Email" 
            className="login-input"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>

        <div className="input-group">
          <Lock className="input-icon" size={18} />
          <input 
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password" 
            className="login-input"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
          {showPassword ? (
            <EyeOff 
              className="password-toggle" 
              size={18}
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <Eye 
              className="password-toggle" 
              size={18}
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        <a href="#" className="forgot-link">Forgot password?</a>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="divider">
        <span>Or</span>
      </div>

      <div className="google-login-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          width="320"
        />
      </div>

      <p className="no-account">Have no account yet?</p>
      <button 
        className="btn-outline" 
        onClick={() => navigate('/register')}
      >
        Register
      </button>
    </div>
  );
};

export default LoginForm;