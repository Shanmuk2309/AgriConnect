import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './Dashboard.css';     
import './FarmerStorage.css'; 

const FarmerStorage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // --- NEW: Modal and Booking State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [bookingData, setBookingData] = useState({
    cropName: '',
    weight: '' // in Tons
  });

  const [storages, setStorages] = useState([
    { _id: '1', name: 'Wisdom Cold Storage', location: 'Kakinada, Andhra Pradesh', available_capacity: 500, price_per_ton: 1500 },
    { _id: '2', name: 'Kisan Fresh Vault', location: 'Rajahmundry, Andhra Pradesh', available_capacity: 120, price_per_ton: 1400 },
    { _id: '3', name: 'AgriSafe Storage', location: 'Visakhapatnam, Andhra Pradesh', available_capacity: 0, price_per_ton: 1600 }
  ]);

  const handleLogout = () => {
    navigate('/login');
  };

  // --- NEW: Booking Functions ---
  const openBookingModal = (storage) => {
    setSelectedStorage(storage);
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedStorage(null);
    setBookingData({ cropName: '', weight: '' }); // Reset form
  };

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    
    const bookedWeight = Number(bookingData.weight);

    // Validation: Ensure they don't book more than available
    if (bookedWeight > selectedStorage.available_capacity) {
      alert(`Error: You cannot book more than the available ${selectedStorage.available_capacity} Tons.`);
      return;
    }

    // Prepare the payload for the backend (To be used later with axios)
    const bookingPayload = {
      farmerId: "Dummy_Farmer_123",
      storageId: selectedStorage._id,
      crop_name: bookingData.cropName,
      weight_booked: bookedWeight
    };
    console.log("Submitting Booking:", bookingPayload);

    // Update the local mock data to instantly reflect the new capacity
    const updatedStorages = storages.map(storage => {
      if (storage._id === selectedStorage._id) {
        return { ...storage, available_capacity: storage.available_capacity - bookedWeight };
      }
      return storage;
    });

    setStorages(updatedStorages);
    closeBookingModal();
    alert(`Successfully booked ${bookedWeight} Tons for ${bookingData.cropName} at ${selectedStorage.name}!`);
  };

  const filteredStorages = storages.filter(storage => 
    storage.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    storage.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="landing-container">
      {/* --- Navigation Bar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/farmer/dashboard" style={{ textDecoration: 'none' }}>
            <h1>AgriConnect</h1>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/farmer/crops" className="nav-link">My Crops</Link>
          <Link to="/farmer/bids" className="nav-link">Bids & Offers</Link>
          <Link to="/farmer/storage" className="nav-link" style={{ color: '#2e7d32' }}>Cold Storages</Link>

          <div className="nav-divider"></div>

          <div className="profile-menu">
            <button className="profile-btn">Ramesh ▼</button>
            <div className="dropdown-content">
              <Link to="/farmer/profile">My Profile</Link>
              <Link to="/farmer/dashboard">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="storage-main">
        <div className="storage-container">
          <div className="storage-header">
            <div>
              <h2>Find Cold Storage</h2>
              <p>Locate nearby facilities to extend the shelf life of your harvest.</p>
            </div>
            
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search by name or city..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="storage-grid">
            {filteredStorages.length > 0 ? (
              filteredStorages.map((storage) => (
                <div key={storage._id} className="storage-card">
                  <div className="storage-card-header">
                    <div className="storage-icon">❄️</div>
                    <div>
                      <h4>{storage.name}</h4>
                      <p className="location-text">{storage.location}</p>
                    </div>
                  </div>
                  
                  <div className="storage-card-body">
                    <div className="storage-detail">
                      <span className="detail-label">Available Capacity:</span>
                      <span className={`detail-value ${storage.available_capacity === 0 ? 'text-danger' : ''}`}>
                        {storage.available_capacity > 0 ? `${storage.available_capacity} Tons` : 'Full'}
                      </span>
                    </div>
                    <div className="storage-detail">
                      <span className="detail-label">Price per Ton:</span>
                      <span className="detail-value text-success">₹{storage.price_per_ton} / month</span>
                    </div>
                  </div>

                  <div className="storage-card-actions">
                    <button 
                      className={`btn-book ${storage.available_capacity === 0 ? 'disabled' : ''}`}
                      onClick={() => openBookingModal(storage)}
                      disabled={storage.available_capacity === 0}
                    >
                      {storage.available_capacity === 0 ? 'Currently Full' : 'Book Space'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No storage facilities found matching "{searchTerm}".</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- NEW: Booking Modal Overlay --- */}
      {isModalOpen && selectedStorage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Book Storage Space</h3>
              <button className="btn-close" onClick={closeBookingModal}>&times;</button>
            </div>
            
            <p className="modal-subtitle">Booking at <strong>{selectedStorage.name}</strong></p>
            
            <form onSubmit={handleBookingSubmit} className="modal-form">
              <div className="form-group">
                <label>Crop Name</label>
                <input 
                  type="text" 
                  name="cropName" 
                  value={bookingData.cropName} 
                  onChange={handleBookingChange} 
                  placeholder="e.g., Potatoes" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Weight to Store (Tons)</label>
                <input 
                  type="number" 
                  name="weight" 
                  value={bookingData.weight} 
                  onChange={handleBookingChange} 
                  placeholder="e.g., 5" 
                  min="1"
                  max={selectedStorage.available_capacity}
                  required 
                />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                  Max available: {selectedStorage.available_capacity} Tons
                </small>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeBookingModal}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Footer --- */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default FarmerStorage;