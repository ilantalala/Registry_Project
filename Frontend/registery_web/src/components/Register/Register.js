import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import RegisterSidebar from './RegisterSideBar';
import './Register.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      return setErrorMessage('Passwords do not match!');
    }

    if (formData.password.length < 6) {
      return setErrorMessage('Password must be at least 6 characters long');
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Registration failed');

      localStorage.setItem('auth_token', result.access_token);
      localStorage.setItem('user_data', JSON.stringify(result.user));

      alert(result.toast_content || 'Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: credentialResponse.credential }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Google auth failed');

      localStorage.setItem('auth_token', result.access_token);
      localStorage.setItem('user_data', JSON.stringify(result.user));

      alert(result.toast_content || 'Registration successful!');
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Google auth failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <RegisterSidebar />
        <RegisterForm
          formData={formData}
          errorMessage={errorMessage}
          isLoading={isLoading}
          onChange={handleChange}
          onSubmit={handleRegister}
          onGoogleSuccess={handleGoogleSuccess}
          onLogin={() => navigate('/')}
        />
      </div>
    </div>
  );
};

export default Register;
