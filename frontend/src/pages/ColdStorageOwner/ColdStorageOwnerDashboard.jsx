import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css'; // You can keep reusing this CSS file!

const ColdStorageOwnerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="landing-container">
      {/* --- Consistent Navigation Bar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>AgriConnect</h1>
        </div>
        <div className="navbar-links">
          {/* Owner-specific links */}
          <Link to="/storage/capacity" className="nav-link">My Facilities</Link>
          <Link to="/storage/requests" className="nav-link">Farmer Requests</Link>

          <div className="nav-divider"></div>

          {/* Profile Dropdown Menu - Now showing the OWNER'S name */}
          <div className="profile-menu">
            <button className="profile-btn">
              Vikram Singh ▼
            </button>
            
            <div className="dropdown-content">
              <Link to="/storage/profile">My Owner Profile</Link>
              <Link to="/storage/overview">Business Overview</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section (Focused on the Business Owner) --- */}
      <header className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome back, Vikram! ❄️</h2>
          <p className="hero-subtitle">
            Manage your cold storage business efficiently. Monitor available capacity, approve incoming storage requests from local farmers, and track your monthly revenue.
          </p>
          <div className="hero-actions">
            <Link to="/storage/requests" className="btn-primary large">Review New Requests</Link>
            <Link to="/storage/capacity" className="btn-secondary large">Update Capacity</Link>
          </div>
        </div>
      </header>

      {/* --- Features/Quick Actions Section --- */}
      <section className="features-section">
        <h3 className="section-title">Business Operations</h3>
        <div className="features-grid">
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Capacity Management</h4>
            <p>Update the total available tonnage and pricing across your facilities so farmers see accurate, real-time data.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h4>Client Requests</h4>
            <p>Accept or decline storage booking requests from farmers based on your current space availability and schedule.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h4>Business Analytics</h4>
            <p>Track your total utilized space, view revenue generated from stored crops, and monitor your business growth.</p>
          </div>

        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ColdStorageOwnerDashboard;