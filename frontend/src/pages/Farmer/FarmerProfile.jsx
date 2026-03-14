import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './Dashboard.css';     
import './FarmerProfile.css'; // We will create this below

const FarmerProfile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Mock data matching your backend Farmer schema
  const [profileData, setProfileData] = useState({
    name: 'Ramesh Kumar',
    email: 'ramesh.test@example.com',
    contact: '9876543210',
    no_of_acres: 5,
    address: {
      d_no: '4-45/2',
      village: 'Annavaram',
      mandal: 'Sankhavaram',
      district: 'Kakinada',
      state: 'Andhra Pradesh',
      pincode: '533406'
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
    console.log("Saving updated profile:", profileData);
    // Later: axios.put(`/api/farmers/${farmerId}`, profileData)
    setIsEditing(false);
  };

  return (
    <div className="landing-container">
      {/* --- Navbar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/farmer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/farmer/crops" className="nav-link">My Crops</Link>
          <Link to="/farmer/bids" className="nav-link">Bids & Offers</Link>
          <Link to="/farmer/storage" className="nav-link">Cold Storages</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn" style={{ color: '#2e7d32', fontWeight: 'bold' }}>{profileData.name.split(' ')[0]} ▼</button>
            <div className="dropdown-content">
              <Link to="/farmer/profile" style={{ color: '#2e7d32', backgroundColor: '#f0f9f0' }}>My Profile</Link>
              <Link to="/farmer/overview">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <h2>My Profile</h2>
            {!isEditing && (
              <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

          <div className="profile-card">
            {isEditing ? (
              <form onSubmit={handleSave} className="profile-form">
                <div className="form-row">
                  <div className="form-group"><label>Full Name</label><input type="text" name="name" value={profileData.name} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Email</label><input type="email" name="email" value={profileData.email} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Contact Number</label><input type="tel" name="contact" value={profileData.contact} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Total Acres</label><input type="number" name="no_of_acres" value={profileData.no_of_acres} onChange={handleChange} required /></div>
                </div>
                
                <h4 className="address-title">Address Details</h4>
                <div className="form-row">
                  <div className="form-group"><label>Door No.</label><input type="text" name="address.d_no" value={profileData.address.d_no} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Village</label><input type="text" name="address.village" value={profileData.address.village} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Mandal</label><input type="text" name="address.mandal" value={profileData.address.mandal} onChange={handleChange} required /></div>
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
                  <span className="label">Full Name:</span> <span className="value">{profileData.name}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Email:</span> <span className="value">{profileData.email}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Contact:</span> <span className="value">{profileData.contact}</span>
                </div>
                <div className="detail-group">
                  <span className="label">Farm Size:</span> <span className="value">{profileData.no_of_acres} Acres</span>
                </div>
                <div className="detail-group address-group">
                  <span className="label">Full Address:</span> 
                  <span className="value">
                    {`${profileData.address.d_no}, ${profileData.address.village}, ${profileData.address.mandal}, ${profileData.address.district}, ${profileData.address.state} - ${profileData.address.pincode}`}
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

export default FarmerProfile;