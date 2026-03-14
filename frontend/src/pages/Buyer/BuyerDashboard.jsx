import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; // Reusing the global layout styles
import './BuyerDashboard.css';      // Specific styles for the buyer profile dropdown

const BuyerDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Later: Add logic here to clear tokens/auth state
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
          {/* Dashboard specific links for Buyers */}
          <Link to="/buyer/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/buyer/bids" className="nav-link">My Bids</Link>

          <div className="nav-divider"></div>

          {/* Profile Dropdown Menu */}
          <div className="profile-menu">
            <button className="profile-btn">
              Suresh Traders ▼
            </button>
            
            <div className="dropdown-content">
              <Link to="/buyer/profile">My Profile</Link>
              <Link to="/buyer/dashboard">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section (Adapted for Buyer) --- */}
      <header className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome to the Marketplace, Suresh! 🛒</h2>
          <p className="hero-subtitle">
            Source high-quality, fresh produce directly from verified farmers. Browse active listings, place competitive bids, and track your active negotiations.
          </p>
          <div className="hero-actions">
            <Link to="/buyer/marketplace" className="btn-primary large">Browse Crops</Link>
            <Link to="/buyer/bids" className="btn-secondary large">Track My Bids</Link>
          </div>
        </div>
      </header>

      {/* --- Features/Quick Actions Section --- */}
      <section className="features-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="features-grid">
          
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h4>Explore Marketplace</h4>
            <p>Filter and search through hundreds of fresh crop listings updated directly by local farmers.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📢</div>
            <h4>Manage Bids</h4>
            <p>Keep track of the offers you've sent, see which ones are accepted, and adjust pending bids.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h4>Market Trends</h4>
            <p>View daily Agmarknet prices to ensure you are placing fair and highly competitive offers.</p>
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

export default BuyerDashboard;