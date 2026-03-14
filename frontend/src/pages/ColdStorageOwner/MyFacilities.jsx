import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css'; 
import './StorageFacilities.css'; 

const MyFacilities = () => {
  const navigate = useNavigate();

  // Mock data for the owner's storage units
  const [facilities, setFacilities] = useState([
    { _id: 'f1', name: 'AgriSafe Storage Main', location: 'Visakhapatnam, AP', total_capacity: 1000, available_capacity: 250, price_per_ton: 1600 },
    { _id: 'f2', name: 'AgriSafe Storage North', location: 'Vizianagaram, AP', total_capacity: 500, available_capacity: 0, price_per_ton: 1500 }
  ]);

  // --- States for Edit Modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [newCapacity, setNewCapacity] = useState('');

  // --- NEW: States for Add Modal ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFacilityData, setNewFacilityData] = useState({
    name: '',
    location: '',
    total_capacity: '',
    price_per_ton: ''
  });

  const handleLogout = () => navigate('/login');

  // --- Edit Capacity Functions ---
  const openEditModal = (facility) => {
    setSelectedFacility(facility);
    setNewCapacity(facility.available_capacity);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedFacility(null);
  };

  const handleUpdateCapacity = (e) => {
    e.preventDefault();
    const updatedFacilities = facilities.map(fac => 
      fac._id === selectedFacility._id ? { ...fac, available_capacity: Number(newCapacity) } : fac
    );
    setFacilities(updatedFacilities);
    alert(`Successfully updated capacity for ${selectedFacility.name}!`);
    closeEditModal();
  };

  // --- NEW: Add Facility Functions ---
  const openAddModal = () => {
    // Reset form to blank when opening
    setNewFacilityData({ name: '', location: '', total_capacity: '', price_per_ton: '' });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewFacilityData({ ...newFacilityData, [name]: value });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    
    // Create a new facility object (mocking a database creation)
    const newFacility = {
      _id: 'f' + Date.now(), // Generate a random mock ID
      name: newFacilityData.name,
      location: newFacilityData.location,
      total_capacity: Number(newFacilityData.total_capacity),
      available_capacity: Number(newFacilityData.total_capacity), // A new facility starts 100% empty/available
      price_per_ton: Number(newFacilityData.price_per_ton)
    };

    // Add it to the existing array of facilities
    setFacilities([...facilities, newFacility]);
    
    alert(`Successfully added ${newFacility.name} to your portfolio!`);
    closeAddModal();
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand"><Link to="/storage/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link></div>
        <div className="navbar-links">
          <Link to="/storage/capacity" className="nav-link" style={{ color: '#2e7d32' }}>My Facilities</Link>
          <Link to="/storage/requests" className="nav-link">Farmer Requests</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn">Vikram Singh ▼</button>
            <div className="dropdown-content">
              <Link to="/storage/profile">My Owner Profile</Link>
              <Link to="/storage/overview">Business Overview</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="facilities-main">
        <div className="facilities-container">
          <div className="facilities-header">
            <div>
              <h2>Manage My Facilities</h2>
              <p>Keep your available capacity up to date so farmers can book space.</p>
            </div>
            {/* --- UPDATED: Connect button to openAddModal --- */}
            <button className="btn-primary" onClick={openAddModal}>+ Add New Facility</button>
          </div>

          <div className="facility-grid">
            {facilities.map((facility) => (
              <div key={facility._id} className="facility-card">
                <div className="facility-card-header">
                  <div className="facility-icon">🏢</div>
                  <div>
                    <h4>{facility.name}</h4>
                    <p className="location-text">{facility.location}</p>
                  </div>
                </div>
                
                <div className="facility-card-body">
                  <div className="facility-detail">
                    <span className="detail-label">Total Capacity:</span>
                    <span className="detail-value">{facility.total_capacity} Tons</span>
                  </div>
                  <div className="facility-detail">
                    <span className="detail-label">Available Space:</span>
                    <span className={`detail-value ${facility.available_capacity === 0 ? 'text-danger' : 'text-success'}`}>
                      {facility.available_capacity > 0 ? `${facility.available_capacity} Tons` : 'FULL'}
                    </span>
                  </div>
                  <div className="facility-detail">
                    <span className="detail-label">Price per Ton:</span>
                    <span className="detail-value">₹{facility.price_per_ton} / month</span>
                  </div>
                </div>

                <div className="facility-card-actions">
                  <button className="btn-secondary" style={{ width: '100%' }} onClick={() => openEditModal(facility)}>
                    Update Capacity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- Existing: Update Capacity Modal --- */}
      {isEditModalOpen && selectedFacility && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Available Capacity</h3>
              <button className="btn-close" onClick={closeEditModal}>&times;</button>
            </div>
            <p className="modal-subtitle">Updating <strong>{selectedFacility.name}</strong></p>
            
            <form onSubmit={handleUpdateCapacity} className="modal-form">
              <div className="form-group">
                <label>Available Space (in Tons)</label>
                <input 
                  type="number" 
                  value={newCapacity} 
                  onChange={(e) => setNewCapacity(e.target.value)} 
                  min="0" 
                  max={selectedFacility.total_capacity} 
                  required 
                />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Cannot exceed total capacity of {selectedFacility.total_capacity} Tons.
                </small>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Capacity</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW: Add Facility Modal --- */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Facility</h3>
              <button className="btn-close" onClick={closeAddModal}>&times;</button>
            </div>
            <p className="modal-subtitle">Add a new cold storage warehouse to your portfolio.</p>
            
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label>Facility Name</label>
                <input type="text" name="name" placeholder="e.g., AgriSafe South" value={newFacilityData.name} onChange={handleAddChange} required />
              </div>

              <div className="form-group">
                <label>Location (City, State)</label>
                <input type="text" name="location" placeholder="e.g., Guntur, AP" value={newFacilityData.location} onChange={handleAddChange} required />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Total Capacity (Tons)</label>
                  <input type="number" name="total_capacity" placeholder="e.g., 500" min="1" value={newFacilityData.total_capacity} onChange={handleAddChange} required />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price per Ton (₹/month)</label>
                  <input type="number" name="price_per_ton" placeholder="e.g., 1500" min="1" value={newFacilityData.price_per_ton} onChange={handleAddChange} required />
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={closeAddModal}>Cancel</button>
                <button type="submit" className="btn-primary">Add Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="footer" style={{ marginTop: 'auto' }}><p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p></footer>
    </div>
  );
};

export default MyFacilities;