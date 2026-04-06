import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css'; 

const ColdStorageOwnerDashboard = () => {
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
        const response = await axios.get(`/api/cs_owners/${userId}`);
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

  const displayName = userData?.name || 'Owner';
  const firstName = displayName.split(' ')[0];

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>AgriConnect</h1>
        </div>
        <div className="navbar-links">
          <Link to="/storage/capacity" className="nav-link">My Facilities</Link>
          <Link to="/storage/requests" className="nav-link">Farmer Requests</Link>

          <div className="nav-divider"></div>

          <div className="profile-menu">
            <button className="profile-btn">{displayName} ▼</button>
            <div className="dropdown-content">
              <Link to="/storage/profile">My Owner Profile</Link>
              <Link to="/storage/overview">Business Overview</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Welcome back, {firstName}! ❄️</h2>
          <p className="hero-subtitle">
            Manage your cold storage facilities, review incoming booking requests from local farmers, and optimize your capacity utilization to maximize revenue.
          </p>
          <div className="hero-actions">
            <Link to="/storage/requests" className="btn-primary large">Review Requests</Link>
            <Link to="/storage/capacity" className="btn-secondary large">Update Capacity</Link>
          </div>
        </div>
      </header>

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

      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ColdStorageOwnerDashboard;