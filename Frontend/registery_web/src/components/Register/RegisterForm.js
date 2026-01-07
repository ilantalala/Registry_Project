import { GoogleLogin } from '@react-oauth/google';
import RegisterInput from './RegisterInput.js';
import RegisterError from './RegisterError';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';

const RegisterForm = ({
  formData,
  errorMessage,
  isLoading,
  onChange,
  onSubmit,
  onGoogleSuccess,
  onLogin,
}) => (
  <div className="register-right">
    <h1 className="register-title">Create Account</h1>
    <p className="register-subtitle">Please fill in details to sign up</p>

    {errorMessage && <RegisterError message={errorMessage} />}

    <div className="google-wrapper">
      <GoogleLogin onSuccess={onGoogleSuccess} text="signup_with" width="320" />
    </div>

    <form onSubmit={onSubmit}>
      <RegisterInput
        icon={<User size={18} />}
        name="fullname"
        placeholder="Full Name"
        value={formData.fullname}
        onChange={onChange}
        disabled={isLoading}
      />

      <RegisterInput
        icon={<Mail size={18} />}
        name="email"
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={onChange}
        disabled={isLoading}
      />

      <RegisterInput
        icon={<Lock size={18} />}
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={onChange}
        disabled={isLoading}
      />

      <RegisterInput
        icon={<ShieldCheck size={18} />}
        name="confirm_password"
        type="password"
        placeholder="Confirm Password"
        value={formData.confirm_password}
        onChange={onChange}
        disabled={isLoading}
      />

      <button className="btn-signup" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>

    <p className="login-link-text">
      Already have an account? <br />
      <button onClick={onLogin}>Log in</button>
    </p>
  </div>
);

export default RegisterForm;
