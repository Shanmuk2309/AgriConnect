import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css';     
import './ColdStorageOwnerOverview.css'; 

const ColdStorageOverview = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ totalCapacity: 0, utilizedCapacity: 0, pendingRequests: 4, monthlyRevenue: 0 });
  const [loading, setLoading] = useState(true);

  // Still mocking active allocations until a Booking Schema is created in the backend
  const activeAllocations = [
    { id: 1, facility: 'Main Storage', farmer: 'Ramesh Kumar', crop: 'Tomatoes', weight: 50, validUntil: '2026-04-14' },
    { id: 2, facility: 'North Facility', farmer: 'Srinivas', crop: 'Apples', weight: 200, validUntil: '2026-05-01' }
  ];

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/api/cs_owners/${userId}`);
        setUserData(userRes.data);

        // Fetch all facilities and filter by this owner
        const storageRes = await axios.get('/api/cold-storages');
        const myFacilities = storageRes.data.filter(s => s.cs_ownerId === userId);

        let totalCap = 0;
        let availableCap = 0;
        let totalRevenue = 0;

        myFacilities.forEach(facility => {
            const cap = Number(facility.total_capacity || facility.available_capacity || 0);
            const avail = Number(facility.available_capacity || 0);
            const utilized = cap - avail;
            
            totalCap += cap;
            availableCap += avail;
            totalRevenue += (utilized * Number(facility.price_per_ton || 0));
        });

        setStats({
          totalCapacity: totalCap,
          utilizedCapacity: totalCap - availableCap,
          pendingRequests: 4, // Placeholder until Booking route exists
          monthlyRevenue: totalRevenue
        });

      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading overview...</div>;

  const displayName = userData?.name || 'Owner';
  const utilizationPercentage = stats.totalCapacity > 0 ? Math.round((stats.utilizedCapacity / stats.totalCapacity) * 100) : 0;

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
              <Link to="/storage/profile">My Owner Profile</Link>
              <Link to="/storage/overview" style={{ color: '#2e7d32', backgroundColor: '#f0f9f0' }}>Business Overview</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="overview-main">
        <div className="overview-container">
          <h2 className="overview-title">Business Overview</h2>
          <p className="overview-subtitle">Track your facility utilization and revenue metrics.</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>📦</div>
              <h3>Total Capacity</h3>
              <p className="stat-number text-primary">{stats.totalCapacity} Tons</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>📈</div>
              <h3>Utilization</h3>
              <p className="stat-number text-success">{utilizationPercentage}%</p>
              <div className="progress-bar-container"><div className="progress-bar-fill" style={{ width: `${utilizationPercentage}%` }}></div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>🔔</div>
              <h3>Pending Requests</h3>
              <p className="stat-number" style={{ color: '#f57c00' }}>{stats.pendingRequests}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>💰</div>
              <h3>Est. Monthly Revenue</h3>
              <p className="stat-number text-purple">₹{(stats.monthlyRevenue / 100000).toFixed(2)}L</p>
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