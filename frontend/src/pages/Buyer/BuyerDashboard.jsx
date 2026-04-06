import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './BuyerDashboard.css';      

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/buyers/${userId}`);
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your dashboard...</div>;

  const businessName = userData?.business_name || userData?.name || 'Buyer';
  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Buyer';

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>AgriConnect</h1>
        </div>
        <div className="navbar-links">
          <Link to="/buyer/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/buyer/bids" className="nav-link">My Bids</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn">{businessName} ▼</button>
            <div className="dropdown-content">
              <Link to="/buyer/profile">My Profile</Link>
              <Link to="/buyer/overview">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome back, {firstName}! 🛒</h2>
          <p className="hero-subtitle">
            Source the freshest agricultural produce directly from verified farmers. Track your bids, monitor live market trends, and secure the best deals for your business.
          </p>
          <div className="hero-actions">
            <Link to="/buyer/marketplace" className="btn-primary large">Browse Crops</Link>
            <Link to="/buyer/bids" className="btn-secondary large">Track My Bids</Link>
          </div>
        </div>
      </header>

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

      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BuyerDashboard;