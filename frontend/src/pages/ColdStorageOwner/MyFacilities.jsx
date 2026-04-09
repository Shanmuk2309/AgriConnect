import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { confirmDialog } from '../../utils/confirm';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css'; 
import './StorageFacilities.css'; 

const MyFacilities = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [facilities, setFacilities] = useState([]);

  // --- UPDATED: States for Edit Modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  
  // New states to track WHAT we are updating and its VALUE
  const [editType, setEditType] = useState('capacity'); 
  const [editValue, setEditValue] = useState('');

  // --- States for Add Modal ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFacilityData, setNewFacilityData] = useState({
    name: '',
    location: '',
    total_capacity: '',
    price_per_ton: ''
  });

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [ownerResponse, facilitiesResponse] = await Promise.all([
          axios.get(`/api/cs_owners/${userId}`),
          axios.get('/api/cold-storages')
        ]);

        setUserData(ownerResponse.data);

        const ownerFacilities = (facilitiesResponse.data || []).filter(
          (facility) => String(facility.cs_ownerId) === String(userId)
        );
        setFacilities(ownerFacilities);
      } catch (fetchError) {
        console.error('Failed to fetch facilities data:', fetchError);
        setError('Failed to load your facilities. Please refresh and try again.');
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

  // --- UPDATED: Edit Functions ---
  const openEditModal = (facility) => {
    setSelectedFacility(facility);
    setEditType('capacity'); // Default to capacity when opened
    setEditValue(facility.available_capacity);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedFacility(null);
  };

  const handleEditTypeChange = (e) => {
    const type = e.target.value;
    setEditType(type);
    // Automatically swap the input value to the current capacity or price of the facility
    setEditValue(type === 'capacity' ? selectedFacility.available_capacity : selectedFacility.price_per_ton);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {};
      if (editType === 'capacity') {
        payload.available_capacity = Number(editValue);
      } else if (editType === 'price') {
        payload.price_per_ton = Number(editValue);
      }

      await axios.put(`/api/cold-storages/${selectedFacility._id}`, payload);

      const updatedFacilities = facilities.map(fac => {
        if (fac._id === selectedFacility._id) {
          return { ...fac, ...payload };
        }
        return fac;
      });

      setFacilities(updatedFacilities);
      alert(`Successfully updated the ${editType} for ${selectedFacility.name}!`);
      closeEditModal();
    } catch (updateError) {
      console.error('Failed to update facility:', updateError);
      alert('Failed to update facility. Please try again.');
    }
  };

  const handleDeleteFacility = async (facilityId, facilityName) => {
    const confirmDelete = await confirmDialog({
      title: 'Delete Facility',
      message: `Delete ${facilityName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    });
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`/api/cold-storages/${facilityId}`);
      setFacilities(facilities.filter((facility) => facility._id !== facilityId));
      alert('Facility deleted successfully.');
    } catch (deleteError) {
      console.error('Failed to delete facility:', deleteError);
      alert('Failed to delete facility. Please try again.');
    }
  };

  // --- Add Facility Functions ---
  const openAddModal = () => {
    setNewFacilityData({ name: '', location: '', total_capacity: '', price_per_ton: '' });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setNewFacilityData({ ...newFacilityData, [name]: value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        cs_ownerId: userId,
        name: newFacilityData.name,
        location: newFacilityData.location,
        total_capacity: Number(newFacilityData.total_capacity),
        available_capacity: Number(newFacilityData.total_capacity),
        price_per_ton: Number(newFacilityData.price_per_ton)
      };

      const response = await axios.post('/api/cold-storages/add', payload);
      const createdFacility = { ...payload, _id: response.data.storageId };

      setFacilities([...facilities, createdFacility]);
      alert(`Successfully added ${createdFacility.name} to your portfolio!`);
      closeAddModal();
    } catch (addError) {
      console.error('Failed to add facility:', addError);
      alert('Failed to add facility. Please try again.');
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your facilities...</div>;
  }

  if (error) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#d32f2f' }}>{error}</div>;
  }

  const displayName = userData?.name || 'Owner';

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
            <button className="profile-btn">{displayName} ▼</button>
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
              <p>Keep your available capacity and pricing up to date.</p>
            </div>
            <button className="btn-primary" onClick={openAddModal}>+ Add New Facility</button>
          </div>

          <div className="facility-grid">
            {facilities.length > 0 ? facilities.map((facility) => (
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

                <div className="facility-card-actions" style={{ display: 'flex', gap: '0.6rem' }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => openEditModal(facility)}>
                    Update
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ flex: 1, borderColor: '#d32f2f', color: '#d32f2f' }}
                    onClick={() => handleDeleteFacility(facility._id, facility.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )) : (
              <div className="no-facilities">
                <p>You have not added any facilities yet. Click Add New Facility to get started.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- UPDATED: Dynamic Update Modal --- */}
      {isEditModalOpen && selectedFacility && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Facility Details</h3>
              <button className="btn-close" onClick={closeEditModal}>&times;</button>
            </div>
            <p className="modal-subtitle">Updating <strong>{selectedFacility.name}</strong></p>
            
            <form onSubmit={handleUpdateSubmit} className="modal-form">
              
              {/* Dropdown to select WHAT to update */}
              <div className="form-group">
                <label>What would you like to update?</label>
                <select 
                  value={editType} 
                  onChange={handleEditTypeChange}
                  style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
                >
                  <option value="capacity">Available Capacity</option>
                  <option value="price">Price per Ton</option>
                </select>
              </div>

              {/* Dynamic Input based on selection */}
              <div className="form-group">
                <label>
                  {editType === 'capacity' ? 'Available Space (in Tons)' : 'New Price (₹/month)'}
                </label>
                <input 
                  type="number" 
                  value={editValue} 
                  onChange={(e) => setEditValue(e.target.value)} 
                  min="0" 
                  max={editType === 'capacity' ? selectedFacility.total_capacity : undefined} 
                  required 
                />
                
                {/* Only show the capacity warning if they are editing capacity */}
                {editType === 'capacity' && (
                  <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                    Cannot exceed total capacity of {selectedFacility.total_capacity} Tons.
                  </small>
                )}
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Add Facility Modal (Unchanged) --- */}
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