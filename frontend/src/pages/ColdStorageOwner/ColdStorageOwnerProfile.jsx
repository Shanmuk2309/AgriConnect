import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css';     
import './ColdStorageOwnerProfile.css'; 

const ColdStorageProfile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/cs_owners/${userId}`);
        const data = response.data;
        if (!data.address) {
          data.address = { plot_no: '', street: '', city: '', district: '', state: '', pincode: '' };
        }
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setProfileData({ ...profileData, address: { ...profileData.address, [field]: value } });
    } else {
      setProfileData({ ...profileData, [name]: value });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/cs_owners/${userId}`, profileData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your profile...</div>;
  if (!profileData) return <div style={{ padding: '50px', textAlign: 'center' }}>Error loading profile.</div>;

  const displayName = profileData.name || 'Owner';

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/storage/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/storage/capacity" className="nav-link">My Facilities</Link>
          <Link to="/storage/requests" className="nav-link">Farmer Requests</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn">{displayName} ▼</button>
            <div className="dropdown-content">
              <Link to="/storage/profile" style={{ color: '#2e7d32', backgroundColor: '#f0f9f0' }}>My Owner Profile</Link>
              <Link to="/storage/overview">Business Overview</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="profile-main">
        <div className="profile-container">
          <div className="profile-header">
            <h2>Head Office Profile</h2>
            {!isEditing && (
              <button className="btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

          <div className="profile-card">
            {isEditing ? (
              <form onSubmit={handleSave} className="profile-form">
                <div className="form-row">
                  <div className="form-group"><label>Owner Name</label><input type="text" name="name" value={profileData.name || ''} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Business Name</label><input type="text" name="business_name" value={profileData.business_name || ''} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Email</label><input type="email" name="email" value={profileData.email || ''} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Contact Number</label><input type="tel" name="contact" value={profileData.contact || ''} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>GST Number</label><input type="text" name="gst_number" value={profileData.gst_number || ''} onChange={handleChange} /></div>
                </div>
                
                <h4 className="address-title">Head Office Address</h4>
                <div className="form-row">
                  <div className="form-group"><label>Plot / Door No.</label><input type="text" name="address.plot_no" value={profileData.address.plot_no || ''} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Street / Area</label><input type="text" name="address.street" value={profileData.address.street || ''} onChange={handleChange} required /></div>
                  <div className="form-group"><label>City</label><input type="text" name="address.city" value={profileData.address.city || ''} onChange={handleChange} required /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>District</label><input type="text" name="address.district" value={profileData.address.district || ''} onChange={handleChange} required /></div>
                  <div className="form-group"><label>State</label><input type="text" name="address.state" value={profileData.address.state || ''} onChange={handleChange} required /></div>
                  <div className="form-group"><label>Pincode</label><input type="text" name="address.pincode" value={profileData.address.pincode || ''} onChange={handleChange} required /></div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-group"><span className="label">Owner Name:</span> <span className="value">{profileData.name}</span></div>
                <div className="detail-group"><span className="label">Business Name:</span> <span className="value">{profileData.business_name || 'N/A'}</span></div>
                <div className="detail-group"><span className="label">Email:</span> <span className="value">{profileData.email}</span></div>
                <div className="detail-group"><span className="label">Contact:</span> <span className="value">{profileData.contact}</span></div>
                <div className="detail-group"><span className="label">GST Number:</span> <span className="value">{profileData.gst_number || 'N/A'}</span></div>
                <div className="detail-group address-group">
                  <span className="label">Head Office Address:</span> 
                  <span className="value">
                    {`${profileData.address?.plot_no || ''}, ${profileData.address?.street || ''}, ${profileData.address?.city || ''}, ${profileData.address?.district || ''}, ${profileData.address?.state || ''} - ${profileData.address?.pincode || ''}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: 'auto' }}><p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p></footer>
    </div>
  );
};

export default ColdStorageProfile;