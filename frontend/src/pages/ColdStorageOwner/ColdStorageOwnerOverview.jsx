import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css';     
import './ColdStorageOwnerOverview.css'; // We will create this below

const ColdStorageOverview = () => {
  const navigate = useNavigate();

  // Mock aggregated data for the storage owner
  const stats = {
    totalCapacity: 1500, // Across all facilities
    utilizedCapacity: 1250,
    pendingRequests: 4,
    monthlyRevenue: 1875000 // In Rupees
  };

  const activeAllocations = [
    { id: 1, facility: 'AgriSafe Storage Main', farmer: 'Ramesh Kumar', crop: 'Tomatoes', weight: 50, validUntil: '2026-04-14' },
    { id: 2, facility: 'AgriSafe Storage North', farmer: 'Srinivas', crop: 'Apples', weight: 200, validUntil: '2026-05-01' },
    { id: 3, facility: 'AgriSafe Storage Main', farmer: 'Venkatesh', crop: 'Potatoes', weight: 100, validUntil: '2026-06-15' }
  ];

  const handleLogout = () => navigate('/login');

  // Calculate percentage for a progress bar
  const utilizationPercentage = Math.round((stats.utilizedCapacity / stats.totalCapacity) * 100);

  return (
    <div className="landing-container">
      {/* --- Navbar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/storage/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/storage/capacity" className="nav-link">My Facilities</Link>
          <Link to="/storage/requests" className="nav-link">Farmer Requests</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn" style={{ color: '#1e88e5', fontWeight: 'bold' }}>Vikram Singh ▼</button>
            <div className="dropdown-content">
              <Link to="/storage/profile">My Owner Profile</Link>
              <Link to="/storage/overview" style={{ color: '#1e88e5', backgroundColor: '#e3f2fd' }}>Business Overview</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="overview-main">
        <div className="overview-container">
          <h2 className="overview-title">Business Operations Overview</h2>
          <p className="overview-subtitle">Track your facility utilization and revenue generation.</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>🏢</div>
              <h3>Total Capacity</h3>
              <p className="stat-number text-success">{stats.totalCapacity} <span style={{ fontSize: '1rem', color: '#666' }}>Tons</span></p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>📦</div>
              <h3>Space Utilized</h3>
              <p className="stat-number text-primary">{stats.utilizedCapacity} <span style={{ fontSize: '1rem', color: '#666' }}>Tons</span></p>
              
              {/* Utilization Progress Bar */}
              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${utilizationPercentage}%`, backgroundColor: utilizationPercentage > 85 ? '#d32f2f' : '#1e88e5' }}></div>
              </div>
              <small>{utilizationPercentage}% Full</small>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>🔔</div>
              <h3>Pending Requests</h3>
              <p className="stat-number text-warning" style={{ color: '#f57c00' }}>{stats.pendingRequests}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fce4ec' }}>₹</div>
              <h3>Est. Monthly Revenue</h3>
              <p className="stat-number text-danger" style={{ fontSize: '1.8rem' }}>
                ₹{(stats.monthlyRevenue / 100000).toFixed(2)}L
              </p>
            </div>
          </div>

          <div className="storage-breakdown">
            <h3>Active Farmer Allocations</h3>
            {activeAllocations.length > 0 ? (
              <table className="overview-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Farmer Name</th>
                    <th>Crop Stored</th>
                    <th>Weight (Tons)</th>
                    <th>Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAllocations.map(item => (
                    <tr key={item.id}>
                      <td className="fw-bold text-primary">{item.facility}</td>
                      <td>{item.farmer}</td>
                      <td>{item.crop}</td>
                      <td className="fw-bold">{item.weight}</td>
                      <td style={{ color: '#666' }}>{item.validUntil}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">You have no active allocations at the moment.</p>
            )}
          </div>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: 'auto' }}><p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p></footer>
    </div>
  );
};

export default ColdStorageOverview;