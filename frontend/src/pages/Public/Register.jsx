import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css'; 

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    userType: 'Farmer',
    name: '',
    email: '',
    contact: '',
    password: '',
    no_of_acres: '', 
    business_name: '',
    gst_number: '',
    address: {       
      d_no: '',
      village: '',
      mandal: '',
      shop_no: '',
      plot_no: '',
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prevState => ({
        ...prevState,
        address: {
          ...prevState.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const payload = JSON.parse(JSON.stringify(formData));
    let endpoint = '';
    
    if (payload.userType === 'Cold Storage Owner') {
      endpoint = '/api/cs_owners/add';
      delete payload.no_of_acres;
      delete payload.address.d_no;
      delete payload.address.village;
      delete payload.address.mandal;
      delete payload.address.shop_no;
    } 
    else if (payload.userType === 'Buyer') {
      endpoint = '/api/buyers/add';
      delete payload.no_of_acres;
      delete payload.address.d_no;
      delete payload.address.village;
      delete payload.address.mandal;
      delete payload.address.plot_no;
    } 
    else if (payload.userType === 'Farmer') {
      endpoint = '/api/farmers/add';
      payload.no_of_acres = Number(payload.no_of_acres); 
      delete payload.business_name;
      delete payload.gst_number;
      delete payload.address.shop_no;
      delete payload.address.plot_no;
      delete payload.address.street;
      delete payload.address.city;
    }

    try {
      const response = await axios.post(endpoint, payload);
      alert(`Successfully registered as a ${formData.userType}! Please log in.`);
      navigate('/login');
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join the AgriConnect network</p>
        </div>

        {error && <div style={{ color: 'red', textAlign: 'center', marginBottom: '10px' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>I am registering as a:</label>
            <select name="userType" value={formData.userType} onChange={handleChange} required>
              <option value="Farmer">Farmer</option>
              <option value="Buyer">Buyer</option>
              <option value="Cold Storage Owner">Cold Storage Owner</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>{formData.userType === 'Cold Storage Owner' ? 'Owner Name' : 'Full Name'}</label>
            <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Contact Number</label>
            <input type="tel" name="contact" placeholder="10-digit phone number" value={formData.contact} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange} required />
          </div>

          {formData.userType === 'Farmer' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
              <label>Number of Acres</label>
              <input type="number" name="no_of_acres" placeholder="e.g., 5" value={formData.no_of_acres} onChange={handleChange} required />
            </div>
          )}

          {(formData.userType === 'Buyer' || formData.userType === 'Cold Storage Owner') && (
            <div style={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>{formData.userType === 'Cold Storage Owner' ? 'Registered Business Name' : 'Business / Company Name'}</label>
                <input type="text" name="business_name" placeholder="e.g., AgriSafe Solutions" value={formData.business_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>GST Number (Optional)</label>
                <input type="text" name="gst_number" placeholder="e.g., 29ABCDE1234F1Z5" value={formData.gst_number} onChange={handleChange} />
              </div>
            </div>
          )}

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', animation: 'fadeIn 0.3s' }}>
            <h4 style={{ marginBottom: '1rem', color: '#2e7d32' }}>
              {formData.userType === 'Farmer' ? 'Farm Address' : 
               formData.userType === 'Buyer' ? 'Business Address' : 'Head Office Address'}
            </h4>
            
            <div className="form-group">
              <label>
                {formData.userType === 'Farmer' ? 'Door Number' : 
                 formData.userType === 'Buyer' ? 'Shop / Plot No.' : 'Plot / Door No.'}
              </label>
              <input 
                type="text" 
                name={formData.userType === 'Farmer' ? 'address.d_no' : 
                      formData.userType === 'Buyer' ? 'address.shop_no' : 'address.plot_no'} 
                placeholder={formData.userType === 'Farmer' ? 'e.g., 4-45/2' : 'e.g., Plot 45'} 
                value={formData.userType === 'Farmer' ? formData.address.d_no : 
                       formData.userType === 'Buyer' ? formData.address.shop_no : formData.address.plot_no} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div className="form-group">
                <label>{formData.userType === 'Farmer' ? 'Village' : 'Street / Area'}</label>
                <input 
                  type="text" 
                  name={formData.userType === 'Farmer' ? 'address.village' : 'address.street'} 
                  placeholder={formData.userType === 'Farmer' ? 'Village' : 'Street'} 
                  value={formData.userType === 'Farmer' ? formData.address.village : formData.address.street} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>{formData.userType === 'Farmer' ? 'Mandal' : 'City'}</label>
                <input 
                  type="text" 
                  name={formData.userType === 'Farmer' ? 'address.mandal' : 'address.city'} 
                  placeholder={formData.userType === 'Farmer' ? 'Mandal' : 'City'} 
                  value={formData.userType === 'Farmer' ? formData.address.mandal : formData.address.city} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>District</label>
                <input type="text" name="address.district" placeholder="District" value={formData.address.district} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="address.state" placeholder="State" value={formData.address.state} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Pincode</label>
                <input type="text" name="address.pincode" placeholder="Pincode" value={formData.address.pincode} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-auth-primary" disabled={loading} style={{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Log in here</Link></p>
          <p><Link to="/">Return to Home</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;