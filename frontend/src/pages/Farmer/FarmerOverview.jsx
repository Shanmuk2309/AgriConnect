import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { confirmDialog } from '../../utils/confirm';
import '../Public/LandingPage.css'; 
import './Dashboard.css';     
import './FarmerOverview.css'; 

const FarmerOverview = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({ totalListed: 0, acceptedBids: 0, rejectedBids: 0, inStorageCount: 0 });
  const [storageDetails, setStorageDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  const updateOverviewState = (myCrops, myIncomingBids, approvedBookings) => {
    setStats({
      totalListed: myCrops.length,
      acceptedBids: myIncomingBids.filter((b) => b.status === 'Accepted' || b.status === 'Paid').length,
      rejectedBids: myIncomingBids.filter((b) => b.status === 'Rejected').length,
      inStorageCount: approvedBookings.length
    });

    setStorageDetails(approvedBookings);
  };

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/api/farmers/${userId}`);
        setUserData(userRes.data);

        // Fetch Data from DB
        const [cropsRes, bidsRes, bookingsRes] = await Promise.all([
          axios.get('/api/crops'),
          axios.get('/api/bids'),
          axios.get(`/api/bookings?farmerId=${userId}`)
        ]);

        // Calculate Real Stats
        const myCrops = cropsRes.data.filter(c => c.farmerId === userId);
        const myCropIds = myCrops.map(c => c._id);
        
        const myIncomingBids = bidsRes.data.filter(bid => myCropIds.includes(bid.cropId));
        const approvedBookings = bookingsRes.data.filter(b => b.status === 'Approved');

        updateOverviewState(myCrops, myIncomingBids, approvedBookings);

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

  const handleRemoveFromStorage = async (bookingId) => {
    const confirmDelete = await confirmDialog({
      title: 'Remove From Storage',
      message: 'Mark this crop as removed from cold storage?',
      confirmText: 'Remove',
      cancelText: 'Cancel',
      tone: 'danger',
    });
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`/api/bookings/${bookingId}`);
      const updatedStorage = storageDetails.filter((item) => item._id !== bookingId);
      setStorageDetails(updatedStorage);
      setStats((prev) => ({ ...prev, inStorageCount: updatedStorage.length }));
      alert('Crop removed from storage records and capacity restored.');
    } catch (error) {
      console.error('Failed to remove crop from storage:', error);
      alert('Failed to remove crop from storage. Please try again.');
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading overview...</div>;

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Farmer';

  return (
    <div className="landing-container">
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
            <button className="profile-btn" style={{ color: '#2e7d32', fontWeight: 'bold' }}>{firstName} ▼</button>
            <div className="dropdown-content">
              <Link to="/farmer/profile">My Profile</Link>
              <Link to="/farmer/overview" style={{ color: '#2e7d32', backgroundColor: '#f0f9f0' }}>Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {storageDetails.map(item => (
                    <tr key={item._id}>
                      <td className="fw-bold">{item.crop}</td>
                      <td>{item.weight}</td>
                      <td>{item.facility_name}</td>
                      <td>
                        <button
                          onClick={() => handleRemoveFromStorage(item._id)}
                          style={{ padding: '0.35rem 0.75rem', border: '1px solid #d32f2f', background: 'white', color: '#d32f2f', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                        >
                          Delete
                        </button>
                      </td>
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