import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; // Reusing your beautiful landing page styles!
import './Dashboard.css';     // New file just for the profile dropdown

const FarmerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Later: Add logic here to clear tokens/auth state
    navigate('/login');
  };

  return (
    <div className="landing-container">
      {/* --- Navigation Bar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>AgriConnect</h1>
        </div>
        <div className="navbar-links">
          {/* Dashboard specific links */}
          <Link to="/farmer/crops" className="nav-link">My Crops</Link>
          <Link to="/farmer/bids" className="nav-link">Bids & Offers</Link>
          <Link to="/farmer/storage" className="nav-link">Cold Storages</Link>

          <div className="nav-divider"></div>

          {/* Profile Dropdown Menu */}
          <div className="profile-menu">
            <button className="profile-btn">
              <div className="avatar-small">R</div> 
              Ramesh Kumar ▼
            </button>
            
            <div className="dropdown-content">
              <Link to="/farmer/profile">My Profile</Link>
              <Link to="/farmer/overview">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section (Adapted for Farmer) --- */}
      <header className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome back to your farm, Ramesh! 🌾</h2>
          <p className="hero-subtitle">
            Manage your crop listings, track incoming buyer bids, and find the best cold storage facilities nearby to maximize your harvest's value.
          </p>
          <div className="hero-actions">
            <Link to="/farmer/crops/add" className="btn-primary large">Add New Crop</Link>
            <Link to="/farmer/bids" className="btn-secondary large">View Pending Bids</Link>
          </div>
        </div>
      </header>

      {/* --- Features/Quick Actions Section --- */}
      <section className="features-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="features-grid">
          
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h4>Manage Crops</h4>
            <p>Update your harvest quantities and expected prices to stay highly competitive in the marketplace.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h4>Review Offers</h4>
            <p>Accept, reject, or negotiate incoming bids from verified buyers looking for your fresh produce.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">❄️</div>
            <h4>Secure Storage</h4>
            <p>Book space in nearby cold storage units to dramatically extend the shelf life of your yield.</p>
          </div>

        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FarmerDashboard;