import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css'; 

const Register = () => {
  const navigate = useNavigate();

  // State structured to match all THREE database schemas
  const [formData, setFormData] = useState({
    userType: 'Farmer', // Default
    name: '',
    email: '',
    contact: '',
    password: '',
    
    // Farmer specific
    no_of_acres: '', 
    
    // Buyer & CS Owner specific
    business_name: '',
    gst_number: '',
    
    address: {       
      // Farmer specific
      d_no: '',
      village: '',
      mandal: '',
      // Buyer specific
      shop_no: '',
      // CS Owner specific
      plot_no: '',
      // Shared Buyer & CS Owner
      street: '',
      city: '',
      // Shared across ALL roles
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a deep copy to clean up before sending to backend
    const payload = JSON.parse(JSON.stringify(formData));
    
    // --- Data Cleanup based on User Type ---
    if (payload.userType === 'Cold Storage Owner') {
      delete payload.no_of_acres;
      // Delete farmer specific
      delete payload.address.d_no;
      delete payload.address.village;
      delete payload.address.mandal;
      // Delete buyer specific
      delete payload.address.shop_no;
    } 
    else if (payload.userType === 'Buyer') {
      delete payload.no_of_acres;
      // Delete farmer specific
      delete payload.address.d_no;
      delete payload.address.village;
      delete payload.address.mandal;
      // Delete CS Owner specific
      delete payload.address.plot_no;
    } 
    else if (payload.userType === 'Farmer') {
      payload.no_of_acres = Number(payload.no_of_acres); 
      delete payload.business_name;
      delete payload.gst_number;
      // Delete buyer & CS Owner specific address fields
      delete payload.address.shop_no;
      delete payload.address.plot_no;
      delete payload.address.street;
      delete payload.address.city;
    }

    console.log("Registration Payload ready for backend:", payload);
    
    alert(`Successfully registered as a ${formData.userType}! Please log in.`);
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join the AgriConnect network</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* --- 1. ROLE SELECTION --- */}
          <div className="form-group">
            <label>I am registering as a:</label>
            <select name="userType" value={formData.userType} onChange={handleChange} required>
              <option value="Farmer">Farmer</option>
              <option value="Buyer">Buyer</option>
              <option value="Cold Storage Owner">Cold Storage Owner</option>
            </select>
          </div>

          {/* --- 2. BASIC INFO (All Roles) --- */}
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

          {/* --- 3. FARMER SPECIFIC: Acres --- */}
          {formData.userType === 'Farmer' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s' }}>
              <label>Number of Acres</label>
              <input type="number" name="no_of_acres" placeholder="e.g., 5" value={formData.no_of_acres} onChange={handleChange} required />
            </div>
          )}

          {/* --- 4. BUSINESS DETAILS (Buyer & Cold Storage Owner) --- */}
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

          {/* --- 5. ADDRESS FIELDS (Dynamic for ALL roles now) --- */}
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', animation: 'fadeIn 0.3s' }}>
            <h4 style={{ marginBottom: '1rem', color: '#2e7d32' }}>
              {formData.userType === 'Farmer' ? 'Farm Address' : 
               formData.userType === 'Buyer' ? 'Business Address' : 'Head Office Address'}
            </h4>
            
            {/* Dynamic First Line: Door vs Shop vs Plot */}
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
              {/* Dynamic Second Line: Village vs Street */}
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
              
              {/* Dynamic Third Line: Mandal vs City */}
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

              {/* Shared Bottom Lines */}
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

          <button type="submit" className="btn-auth-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.8rem' }}>Create Account</button>
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