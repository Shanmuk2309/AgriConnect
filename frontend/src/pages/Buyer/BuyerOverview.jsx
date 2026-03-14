import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './BuyerDashboard.css';     
import './BuyerOverview.css'; // We will create this below

const BuyerOverview = () => {
  const navigate = useNavigate();

  // Mock aggregated data for the buyer
  const stats = {
    totalBidsPlaced: 15,
    pendingBids: 3,
    acceptedBids: 8,
    totalSpent: 425000 // In Rupees
  };

  const recentPurchases = [
    { id: 1, crop: 'Onions', farmer: 'Srinivas', quantity: 200, amount: 620000, date: '2026-03-12' },
    { id: 2, crop: 'Chilies', farmer: 'Venkat Rao', quantity: 50, amount: 150000, date: '2026-03-05' }
  ];

  const handleLogout = () => navigate('/login');

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
              <Link to="/buyer/profile">My Profile</Link>
              <Link to="/buyer/overview" style={{ color: '#2e7d32', backgroundColor: '#f0f9f0' }}>Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="overview-main">
        <div className="overview-container">
          <h2 className="overview-title">Procurement Overview</h2>
          <p className="overview-subtitle">Track your sourcing metrics and total expenditure.</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>📤</div>
              <h3>Total Offers Made</h3>
              <p className="stat-number text-primary">{stats.totalBidsPlaced}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>⏳</div>
              <h3>Pending Offers</h3>
              <p className="stat-number text-warning" style={{ color: '#f57c00' }}>{stats.pendingBids}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>🤝</div>
              <h3>Deals Closed</h3>
              <p className="stat-number text-success">{stats.acceptedBids}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fce4ec' }}>₹</div>
              <h3>Total Spent</h3>
              <p className="stat-number text-danger" style={{ fontSize: '2rem' }}>
                ₹{(stats.totalSpent / 100000).toFixed(2)}L
              </p>
            </div>
          </div>

          <div className="storage-breakdown">
            <h3>Recent Completed Purchases</h3>
            {recentPurchases.length > 0 ? (
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Crop</th>
                    <th>Farmer</th>
                    <th>Quantity (Qtl)</th>
                    <th>Total Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map(item => (
                    <tr key={item.id}>
                      <td>{item.date}</td>
                      <td className="fw-bold">{item.crop}</td>
                      <td>{item.farmer}</td>
                      <td>{item.quantity}</td>
                      <td className="text-success fw-bold">₹{item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">You have no completed purchases yet.</p>
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

export default BuyerOverview;