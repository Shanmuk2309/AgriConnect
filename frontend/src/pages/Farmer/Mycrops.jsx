import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './Dashboard.css';           
import './FarmerCrops.css';         

const MyCrops = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user data for the navbar
        const userRes = await axios.get(`/api/farmers/${userId}`);
        setUserData(userRes.data);

        // Fetch crops and filter to only show this farmer's crops
        const cropsRes = await axios.get('/api/crops');
        const myCrops = cropsRes.data.filter(crop => crop.farmerId === userId);
        setCrops(myCrops);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this crop listing?");
    if (confirmDelete) {
      try {
        // Delete from database
        await axios.delete(`/api/crops/${id}`);
        // Remove from UI
        setCrops(crops.filter(crop => crop._id !== id));
      } catch (error) {
        console.error("Error deleting crop:", error);
        alert("Failed to delete crop. Please try again.");
      }
    }
  };

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Farmer';

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your crops...</div>;

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/farmer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/farmer/crops" className="nav-link" style={{ color: '#2e7d32' }}>My Crops</Link>
          <Link to="/farmer/bids" className="nav-link">Bids & Offers</Link>
          <Link to="/farmer/storage" className="nav-link">Cold Storages</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn">{firstName} ▼</button>
            <div className="dropdown-content">
              <Link to="/farmer/profile">My Profile</Link>
              <Link to="/farmer/overview">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="crops-main">
        <div className="crops-container">
          <div className="crops-header">
            <div>
              <h2>My Crop Inventory</h2>
              <p>Manage your listings and keep quantities up to date.</p>
            </div>
            <Link to="/farmer/crops/add" className="btn-primary">+ Add New Crop</Link>
          </div>

          <div className="table-responsive">
            <table className="crops-table">
              <thead>
                <tr>
                  <th>Crop Name</th>
                  <th>Date Listed</th>
                  <th>Quantity (Qtl)</th>
                  <th>Expected Price (₹/Qtl)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.length > 0 ? (
                  crops.map((crop) => (
                    <tr key={crop._id}>
                      <td className="fw-bold">{crop.crop_name}</td>
                      <td style={{ color: '#666', fontSize: '0.9rem' }}>{crop.listed_date || new Date().toISOString().split('T')[0]}</td>
                      <td>{crop.quantity}</td>
                      <td className="text-success fw-bold">₹{crop.expected_price}</td>
                      <td>
                        <span className={`status-badge ${(crop.status || 'listed').toLowerCase().replace(' ', '-')}`}>
                          {crop.status || 'Listed'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button className="btn-edit" onClick={() => navigate(`/farmer/crops/edit/${crop._id}`)}>Edit</button>
                        <button className="btn-delete" onClick={() => handleDelete(crop._id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">You haven't listed any crops yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MyCrops;