import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; // Global layout and navbar styles
import './Dashboard.css';           // Profile dropdown styles (shared with FarmerDashboard)
import './FarmerCrops.css';         // Specific styles for the crops table

const MyCrops = () => {
  const navigate = useNavigate();

  // --- UPDATED: Added listed_date to the mock data ---
  const [crops, setCrops] = useState([
    { _id: '1', crop_name: 'Tomatoes', quantity: 50, expected_price: 2500, status: 'Listed', listed_date: '2026-03-14' },
    { _id: '2', crop_name: 'Potatoes', quantity: 100, expected_price: 1800, status: 'In Storage', listed_date: '2026-03-12' },
    { _id: '3', crop_name: 'Onions', quantity: 200, expected_price: 3000, status: 'Sold', listed_date: '2026-03-10' }
  ]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleDelete = (id) => {
    // Later: axios.delete(`/api/crops/${id}`)
    const confirmDelete = window.confirm("Are you sure you want to delete this crop listing?");
    if (confirmDelete) {
      const updatedCrops = crops.filter(crop => crop._id !== id);
      setCrops(updatedCrops);
    }
  };

  return (
    <div className="landing-container">
      {/* --- Consistent Navigation Bar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/farmer/dashboard" style={{ textDecoration: 'none' }}>
            <h1>AgriConnect</h1>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/farmer/crops" className="nav-link" style={{ color: '#2e7d32' }}>My Crops</Link>
          <Link to="/farmer/bids" className="nav-link">Bids & Offers</Link>
          <Link to="/farmer/storage" className="nav-link">Cold Storages</Link>

          <div className="nav-divider"></div>

          <div className="profile-menu">
            <button className="profile-btn">
              Ramesh ▼
            </button>
            <div className="dropdown-content">
              <Link to="/farmer/profile">My Profile</Link>
              <Link to="/farmer/overview">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="crops-main">
        <div className="crops-container">
          <div className="crops-header">
            <div>
              <h2>My Crop Inventory</h2>
              <p>Manage your listings and keep quantities up to date.</p>
            </div>
            <Link to="/farmer/crops/add" className="btn-primary">
              + Add New Crop
            </Link>
          </div>

          <div className="table-responsive">
            <table className="crops-table">
              <thead>
                <tr>
                  <th>Crop Name</th>
                  {/* --- NEW: Date Header --- */}
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
                      {/* --- NEW: Date Data Cell --- */}
                      <td style={{ color: '#666', fontSize: '0.9rem' }}>{crop.listed_date}</td>
                      <td>{crop.quantity}</td>
                      <td className="text-success fw-bold">₹{crop.expected_price}</td>
                      <td>
                        <span className={`status-badge ${crop.status.toLowerCase().replace(' ', '-')}`}>
                          {crop.status}
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
                    {/* --- UPDATED: colSpan changed from 5 to 6 to account for the new column --- */}
                    <td colSpan="6" className="text-center">You haven't listed any crops yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MyCrops;