import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './Dashboard.css';     
import './FarmerOverview.css'; // We will create this below

const FarmerOverview = () => {
  const navigate = useNavigate();

  // Mock aggregated data
  const stats = {
    totalListed: 8,
    acceptedBids: 3,
    rejectedBids: 1,
    inStorageCount: 2
  };

  const storageDetails = [
    { id: 1, crop: 'Potatoes', quantity: 50, location: 'Wisdom Cold Storage' },
    { id: 2, crop: 'Apples', quantity: 20, location: 'Kisan Fresh Vault' }
  ];

  const handleLogout = () => navigate('/login');

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
            <button className="profile-btn" style={{ color: '#2e7d32', fontWeight: 'bold' }}>Ramesh ▼</button>
            <div className="dropdown-content">
              <Link to="/farmer/profile">My Profile</Link>
              <Link to="/farmer/overview" style={{ color: '#2e7d32', backgroundColor: '#f0f9f0' }}>Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="overview-main">
        <div className="overview-container">
          <h2 className="overview-title">Business Overview</h2>
          <p className="overview-subtitle">Track your agricultural performance at a glance.</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>🌾</div>
              <h3>Total Listed Crops</h3>
              <p className="stat-number text-primary">{stats.totalListed}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>✅</div>
              <h3>Accepted Bids</h3>
              <p className="stat-number text-success">{stats.acceptedBids}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#ffebee' }}>❌</div>
              <h3>Rejected Bids</h3>
              <p className="stat-number text-danger">{stats.rejectedBids}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>❄️</div>
              <h3>Crops in Storage</h3>
              <p className="stat-number text-purple">{stats.inStorageCount}</p>
            </div>
          </div>

          <div className="storage-breakdown">
            <h3>Currently in Cold Storage</h3>
            {storageDetails.length > 0 ? (
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Quantity Stored (Tons)</th>
                    <th>Storage Facility</th>
                  </tr>
                </thead>
                <tbody>
                  {storageDetails.map(item => (
                    <tr key={item.id}>
                      <td className="fw-bold">{item.crop}</td>
                      <td>{item.quantity}</td>
                      <td>{item.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">You currently have no crops in cold storage.</p>
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

export default FarmerOverview;