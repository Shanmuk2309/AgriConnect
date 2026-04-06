import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './BuyerDashboard.css';     
import './BuyerOverview.css'; 

const BuyerOverview = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ totalBidsPlaced: 0, pendingBids: 0, acceptedBids: 0, totalSpent: 0 });
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/api/buyers/${userId}`);
        setUserData(userRes.data);

        // Fetch Bids, Crops, and Farmers to aggregate data
        const [bidsRes, cropsRes, farmersRes] = await Promise.all([
          axios.get('/api/bids'),
          axios.get('/api/crops'),
          axios.get('/api/farmers')
        ]);

        const myBids = bidsRes.data.filter(bid => bid.buyerId === userId);
        
        // Map full data to bids
        const populatedBids = myBids.map(bid => {
          const crop = cropsRes.data.find(c => c._id === bid.cropId);
          const farmer = crop ? farmersRes.data.find(f => f._id === crop.farmerId) : null;
          return {
            ...bid,
            crop_name: crop?.crop_name || 'Unknown Crop',
            quantity: crop?.quantity || 0,
            farmer_name: farmer?.name || 'Unknown Farmer',
            total_amount: (crop?.quantity || 0) * bid.bid_amount
          };
        });

        // Calculate Stats
        const paidBids = populatedBids.filter(b => b.status === 'Paid');
        setStats({
          totalBidsPlaced: populatedBids.length,
          pendingBids: populatedBids.filter(b => b.status === 'Pending').length,
          acceptedBids: populatedBids.filter(b => b.status === 'Accepted').length,
          totalSpent: paidBids.reduce((sum, bid) => sum + bid.total_amount, 0)
        });

        setRecentPurchases(paidBids);

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

  const businessName = userData?.business_name || userData?.name || 'Buyer';

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/buyer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/buyer/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/buyer/bids" className="nav-link">My Bids</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn">{businessName} ▼</button>
            <div className="dropdown-content">
              <Link to="/buyer/profile">My Profile</Link>
              <Link to="/buyer/overview" style={{ color: '#2e7d32', backgroundColor: '#f0f9f0' }}>Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="overview-main">
        <div className="overview-container">
          <h2 className="overview-title">Procurement Overview</h2>
          <p className="overview-subtitle">Track your bidding performance and total expenditures.</p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e3f2fd' }}>📊</div>
              <h3>Total Bids Placed</h3>
              <p className="stat-number text-primary">{stats.totalBidsPlaced}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#fff3e0' }}>⏳</div>
              <h3>Pending Bids</h3>
              <p className="stat-number" style={{ color: '#f57c00' }}>{stats.pendingBids}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#e8f5e9' }}>✅</div>
              <h3>Accepted Offers</h3>
              <p className="stat-number text-success">{stats.acceptedBids}</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#f3e5f5' }}>💰</div>
              <h3>Total Spent</h3>
              <p className="stat-number text-purple">
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
                    <tr key={item._id}>
                      <td>{item.date || new Date().toISOString().split('T')[0]}</td>
                      <td className="fw-bold">{item.crop_name}</td>
                      <td>{item.farmer_name}</td>
                      <td>{item.quantity}</td>
                      <td className="text-success fw-bold">₹{item.total_amount.toLocaleString('en-IN')}</td>
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