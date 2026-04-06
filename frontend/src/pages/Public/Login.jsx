import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Auth.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    identifier: '', 
    password: '',
    userType: 'Farmer' 
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', formData);
      
      // Save Token and Role
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);

      // Decode the token to get the unique User ID
      const decodedToken = jwtDecode(response.data.token);
      const actualUserId = decodedToken.id || decodedToken.userId || decodedToken._id;
      if (actualUserId) {
        localStorage.setItem('userId', actualUserId);
      }

      if (response.data.role === 'Farmer') {
        navigate('/farmer/dashboard'); 
      } else if (response.data.role === 'Buyer') {
        navigate('/buyer/dashboard');
      } else if (response.data.role === 'Cold Storage Owner') {
        navigate('/cs-owner/dashboard');
      } else {
        navigate('/');
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getIdentifierLabel = () => {
    if (formData.userType === 'Farmer') return 'Mobile Number';
    return 'Email Address';
  };

  const getIdentifierPlaceholder = () => {
    if (formData.userType === 'Farmer') return 'Enter your 10-digit mobile number';
    return 'Enter your email address';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your AgriConnect account</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

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

          <button type="submit" className="btn-auth-primary" disabled={loading}>
            {loading ? 'Logging In...' : 'Log In'}
          </button>
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