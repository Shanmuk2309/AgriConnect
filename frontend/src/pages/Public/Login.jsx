import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '', 
    password: '',
    userType: 'Farmer' // Default value
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted with:", formData);
    
    // Future step: Send formData to /api/auth/login using axios
  };

  // --- Dynamic UI Logic ---
  // We change the label and placeholder based on the selected userType
  const getIdentifierLabel = () => {
    if (formData.userType === 'Farmer') return 'Mobile Number';
    return 'Email Address';
  };

  const getIdentifierPlaceholder = () => {
    if (formData.userType === 'Farmer') return 'Enter your 10-digit mobile number';
    return 'Enter your email address';
  };
  // ------------------------

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your AgriConnect account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Select Your Role</label>
            <select name="userType" value={formData.userType} onChange={handleChange} required>
              <option value="Farmer">Farmer</option>
              <option value="Buyer">Buyer</option>
              <option value="Cold Storage Owner">Cold Storage Owner</option>
            </select>
          </div>

          <div className="form-group">
            {/* The label dynamically updates here! */}
            <label>{getIdentifierLabel()}</label>
            <input 
              type="text" 
              name="identifier" 
              placeholder={getIdentifierPlaceholder()}
              value={formData.identifier} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Enter your password"
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn-auth-primary">Log In</button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Sign up here</Link></p>
          <p><Link to="/">Return to Home</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;