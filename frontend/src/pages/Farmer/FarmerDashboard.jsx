import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './Dashboard.css';     

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          navigate('/login');
          return;
        }
        const response = await axios.get(`/api/farmers/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear(); // Clear all saved auth data
    navigate('/login');
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your dashboard...</div>;

  // Extract just the first name for friendly greetings
  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Farmer';

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>AgriConnect</h1>
        </div>
        <div className="navbar-links">
          <Link to="/farmer/crops" className="nav-link">My Crops</Link>
          <Link to="/farmer/bids" className="nav-link">Bids & Offers</Link>
          <Link to="/farmer/storage" className="nav-link">Cold Storages</Link>

          <div className="nav-divider"></div>

          <div className="profile-menu">
            <button className="profile-btn">
              <div className="avatar-small">{firstName.charAt(0).toUpperCase()}</div> 
              {userData?.name || 'My Profile'} ▼
            </button>
            
            <div className="dropdown-content">
              <Link to="/farmer/profile">My Profile</Link>
              <Link to="/farmer/overview">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome back to your farm, {firstName}! 🌾</h2>
          <p className="hero-subtitle">
            Manage your crop listings, track incoming buyer bids, and find the best cold storage facilities nearby to maximize your harvest's value.
          </p>
          <div className="hero-actions">
            <Link to="/farmer/crops/add" className="btn-primary large">Add New Crop</Link>
            <Link to="/farmer/bids" className="btn-secondary large">View Pending Bids</Link>
          </div>
        </div>
      </header>

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

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FarmerDashboard;