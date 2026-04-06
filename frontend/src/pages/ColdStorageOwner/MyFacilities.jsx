import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css'; 
import './StorageFacilities.css'; 

const MyFacilities = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const [userData, setUserData] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [editType, setEditType] = useState('capacity'); 
  const [editValue, setEditValue] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFacilityData, setNewFacilityData] = useState({
    name: '', location: '', total_capacity: '', price_per_ton: ''
  });

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/api/cs_owners/${userId}`);
        setUserData(userRes.data);

        // Fetch all storages and filter by owner
        const storageRes = await axios.get('/api/cold-storages');
        const myFacilities = storageRes.data.filter(s => s.cs_ownerId === userId);
        setFacilities(myFacilities);
      } catch (error) {
        console.error("Error fetching facilities:", error);
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

  // --- Add Facility Functions ---
  const openAddModal = () => {
    setNewFacilityData({ name: '', location: '', total_capacity: '', price_per_ton: '' });
    setIsAddModalOpen(true);
  };
  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddChange = (e) => {
    setNewFacilityData({ ...newFacilityData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        cs_ownerId: userId,
        name: newFacilityData.name,
        location: newFacilityData.location,
        total_capacity: Number(newFacilityData.total_capacity),
        available_capacity: Number(newFacilityData.total_capacity), // Defaults to total
        price_per_ton: Number(newFacilityData.price_per_ton)
      };

      const res = await axios.post('/api/cold-storages/add', payload);
      setFacilities([...facilities, { ...payload, _id: res.data.storageId }]);
      closeAddModal();
    } catch (error) {
      console.error("Failed to add facility:", error);
      alert("Failed to add facility.");
    }
  };

  // --- Edit Facility Functions ---
  const openEditModal = (facility, type) => {
    setSelectedFacility(facility);
    setEditType(type);
    setEditValue(type === 'capacity' ? facility.available_capacity : facility.price_per_ton);
    setIsEditModalOpen(true);
  };
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      if (editType === 'capacity') payload.available_capacity = Number(editValue);
      if (editType === 'price') payload.price_per_ton = Number(editValue);

      await axios.put(`/api/cold-storages/${selectedFacility._id}`, payload);

      setFacilities(facilities.map(fac => 
        fac._id === selectedFacility._id ? { ...fac, ...payload } : fac
      ));
      closeEditModal();
    } catch (error) {
      console.error("Failed to update facility:", error);
      alert("Failed to save changes.");
    }
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your facilities...</div>;
  const displayName = userData?.name || 'Owner';

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/storage/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/storage/capacity" className="nav-link" style={{ color: '#2e7d32' }}>My Facilities</Link>
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

      <main className="facilities-main">
        <div className="facilities-container">
          <div className="facilities-header">
            <div>
              <h2>My Storage Facilities</h2>
              <p>Manage your properties, track available space, and update monthly pricing.</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>+ Add New Facility</button>
          </div>

          <div className="facilities-grid">
            {facilities.length > 0 ? (
              facilities.map((fac) => (
                <div key={fac._id} className="facility-card">
                  <div className="facility-card-header">
                    <h4>{fac.name}</h4>
                    <span className="location-pin">📍 {fac.location || 'Location Not Set'}</span>
                  </div>
                  
                  <div className="facility-card-body">
                    <div className="capacity-section">
                      <div className="cap-details">
                        <span className="cap-label">Available Capacity</span>
                        <span className={`cap-value ${fac.available_capacity <= 0 ? 'text-danger' : ''}`}>
                          {fac.available_capacity > 0 ? `${fac.available_capacity} Tons` : 'FULL'}
                        </span>
                        <span className="cap-total">out of {fac.total_capacity || fac.available_capacity} Tons</span>
                      </div>
                      <button className="btn-icon" onClick={() => openEditModal(fac, 'capacity')} title="Update Capacity">✏️</button>
                    </div>

                    <div className="price-section">
                      <div className="price-details">
                        <span className="price-label">Current Pricing</span>
                        <span className="price-value">₹{fac.price_per_ton} <small>/ ton / month</small></span>
                      </div>
                      <button className="btn-icon" onClick={() => openEditModal(fac, 'price')} title="Update Price">✏️</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-facilities">
                <p>You haven't added any facilities yet. Click "Add New Facility" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Modals --- */}
      {isEditModalOpen && selectedFacility && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editType === 'capacity' ? 'Update Available Capacity' : 'Update Monthly Pricing'}</h3>
              <button className="btn-close" onClick={closeEditModal}>&times;</button>
            </div>
            <p className="modal-subtitle">Updating <strong>{selectedFacility.name}</strong></p>
            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label>{editType === 'capacity' ? 'New Available Space (Tons)' : 'New Price (₹ per Ton)'}</label>
                <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} min="0" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content add-modal">
            <div className="modal-header">
              <h3>Register New Facility</h3>
              <button className="btn-close" onClick={closeAddModal}>&times;</button>
            </div>
            <p className="modal-subtitle">List a new storage unit on the AgriConnect network.</p>
            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group"><label>Facility Name</label><input type="text" name="name" placeholder="e.g., AgriSafe Storage East" value={newFacilityData.name} onChange={handleAddChange} required /></div>
              <div className="form-group"><label>Location (City, State)</label><input type="text" name="location" placeholder="e.g., Guntur, AP" value={newFacilityData.location} onChange={handleAddChange} required /></div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}><label>Total Capacity (Tons)</label><input type="number" name="total_capacity" placeholder="e.g., 500" min="1" value={newFacilityData.total_capacity} onChange={handleAddChange} required /></div>
                <div className="form-group" style={{ flex: 1 }}><label>Price per Ton (₹/mo)</label><input type="number" name="price_per_ton" placeholder="e.g., 1500" min="1" value={newFacilityData.price_per_ton} onChange={handleAddChange} required /></div>
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