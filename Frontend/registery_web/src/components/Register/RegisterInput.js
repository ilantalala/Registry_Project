const RegisterInput = ({ icon, ...props }) => (
  <div className="form-group">
    <span className="form-icon">{icon}</span>
    <input className="register-input" {...props} required />
  </div>
);

export default RegisterInput;
