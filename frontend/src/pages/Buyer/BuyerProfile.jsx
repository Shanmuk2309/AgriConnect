import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './BuyerDashboard.css';     
import './BuyerProfile.css'; // We will create this below

const BuyerProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data matching a Buyer schema
  const [profileData, setProfileData] = useState({
    name: 'Suresh Kumar',
    business_name: 'Suresh Traders',
    email: 'suresh.traders@example.com',
    contact: '9876543211',
    gst_number: '29ABCDE1234F1Z5',
    address: {
      shop_no: '12/A',
      street: 'Market Road',
      city: 'Rajahmundry',
      district: 'East Godavari',
      state: 'Andhra Pradesh',
      pincode: '533101'
    }
  });

  const handleLogout = () => navigate('/login');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setProfileData({
        ...profileData,
        address: { ...profileData.address, [field]: value }
      });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log("Saving updated buyer profile:", profileData);
    // Later: axios.put(`/api/buyers/${buyerId}`, profileData)
    setIsEditing(false);
  };

  return (
    <div className="landing-container">
      {/* --- Navbar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/buyer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/buyer/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/buyer/bids" className="nav-link">My Bids</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn" style={{ color: '#2e7d32', fontWeight: 'bold' }}>Suresh Traders ▼</button>
            <div className="dropdown-content">
              <Link to="/buyer/profile" style={{ color: '#2e7d32', backgroundColor: '#f0f9f0' }}>My Profile</Link>
              <Link to="/buyer/overview">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <h2>Business Profile</h2>
            {!isEditing && (
              <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

          <div className="profile-card">
            {isEditing ? (
              <form onSubmit={handleSave} className="profile-form">
                <div className="form-row">
                  <div className="form-group"><label>Full Name</label><input type="text" name="name" value={profileData.name} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Business/Company Name</label><input type="text" name="business_name" value={profileData.business_name} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Email</label><input type="email" name="email" value={profileData.email} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Contact Number</label><input type="tel" name="contact" value={profileData.contact} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>GST Number</label><input type="text" name="gst_number" value={profileData.gst_number} onChange={handleChange} /></div>
                </div>
                
                <h4 className="address-title">Business Address</h4>
                <div className="form-row">
                  <div className="form-group"><label>Shop/Plot No.</label><input type="text" name="address.shop_no" value={profileData.address.shop_no} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Street/Area</label><input type="text" name="address.street" value={profileData.address.street} onChange={handleChange} required /></div>
                  <div className="form-group"><label>City</label><input type="text" name="address.city" value={profileData.address.city} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>District</label><input type="text" name="address.district" value={profileData.address.district} onChange={handleChange} required /></div>
                  <div className="form-group"><label>State</label><input type="text" name="address.state" value={profileData.address.state} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Pincode</label><input type="text" name="address.pincode" value={profileData.address.pincode} onChange={handleChange} required /></div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-group">
                  <span className="label">Representative Name:</span> <span className="value">{profileData.name}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Business Name:</span> <span className="value">{profileData.business_name}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Email:</span> <span className="value">{profileData.email}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Contact:</span> <span className="value">{profileData.contact}</span>
                </div>
                <div className="detail-group">
                  <span className="label">GST Number:</span> <span className="value">{profileData.gst_number || 'N/A'}</span>
                </div>
                <div className="detail-group address-group">
                  <span className="label">Business Address:</span> 
                  <span className="value">
                    {`${profileData.address.shop_no}, ${profileData.address.street}, ${profileData.address.city}, ${profileData.address.district}, ${profileData.address.state} - ${profileData.address.pincode}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BuyerProfile;