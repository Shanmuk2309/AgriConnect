import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './BuyerDashboard.css';     
import './BuyerMarketPlace.css'; 

const BuyerMarketplace = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // --- Modal & Bidding State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // --- UPDATED: Added listed_date to the mock data ---
  const [crops, setCrops] = useState([
    { _id: '101', crop_name: 'Tomatoes', farmer_name: 'Ramesh Kumar', location: 'Chittoor, AP', quantity: 50, expected_price: 2500, listed_date: '2026-03-14' },
    { _id: '102', crop_name: 'Onions', farmer_name: 'Srinivas', location: 'Kurnool, AP', quantity: 200, expected_price: 3000, listed_date: '2026-03-12' },
    { _id: '103', crop_name: 'Potatoes', farmer_name: 'Venkatesh', location: 'Vizag, AP', quantity: 100, expected_price: 1800, listed_date: '2026-03-10' }
  ]);

  const handleLogout = () => navigate('/login');

  // --- Bidding Functions ---
  const openBidModal = (crop) => {
    setSelectedCrop(crop);
    setBidAmount(''); // Clear previous inputs
    setIsModalOpen(true);
  };

  const closeBidModal = () => {
    setIsModalOpen(false);
    setSelectedCrop(null);
  };

  const handleBidSubmit = (e) => {
    e.preventDefault();
    
    // Prepare payload for backend
    const bidPayload = {
      buyerId: "Dummy_Buyer_456",
      cropId: selectedCrop._id,
      farmerName: selectedCrop.farmer_name,
      amount: Number(bidAmount)
    };
    
    console.log("Submitting Bid:", bidPayload);
    alert(`Successfully placed a bid of ₹${bidAmount} for ${selectedCrop.crop_name}!`);

    const updatedCrops = crops.filter(crop => crop._id !== selectedCrop._id);
    setCrops(updatedCrops);
    closeBidModal();
  };

  // Filter crops based on search input
  const filteredCrops = crops.filter(crop => 
    crop.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="landing-container">
      {/* --- Navbar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/buyer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/buyer/marketplace" className="nav-link" style={{ color: '#2e7d32' }}>Marketplace</Link>
          <Link to="/buyer/bids" className="nav-link">My Bids</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn">Suresh Traders ▼</button>
            <div className="dropdown-content">
              <Link to="/buyer/profile">My Profile</Link>
              <Link to="/buyer/dashboard">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content --- */}
      <main className="market-main">
        <div className="market-container">
          <div className="market-header">
            <div>
              <h2>Live Marketplace</h2>
              <p>Browse fresh produce listed directly by farmers.</p>
            </div>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search crop or location..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="crop-grid">
            {filteredCrops.length > 0 ? (
              filteredCrops.map((crop) => (
                <div key={crop._id} className="crop-card">
                  <div className="crop-card-header">
                    <h4>{crop.crop_name}</h4>
                    <span className="badge-available">Available</span>
                  </div>
                  
                  <div className="crop-card-body">
                    <div className="crop-detail">
                      <span className="detail-label">Farmer:</span>
                      <span className="detail-value">{crop.farmer_name}</span>
                    </div>
                    <div className="crop-detail">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{crop.location}</span>
                    </div>
                    
                    {/* --- NEW: Date Listed Display --- */}
                    <div className="crop-detail">
                      <span className="detail-label">Listed On:</span>
                      <span className="detail-value" style={{ color: '#1565c0', fontWeight: 'bold' }}>{crop.listed_date}</span>
                    </div>

                    <div className="crop-detail">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{crop.quantity} Qtl</span>
                    </div>
                    <div className="crop-detail price-row">
                      <span className="detail-label">Expected Price:</span>
                      <span className="detail-value price">₹{crop.expected_price} / Qtl</span>
                    </div>
                  </div>

                  <div className="crop-card-actions">
                    <button className="btn-bid" onClick={() => openBidModal(crop)}>Place Bid</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <p>No crops found matching "{searchTerm}".</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Bidding Modal --- */}
      {isModalOpen && selectedCrop && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Place a Bid</h3>
              <button className="btn-close" onClick={closeBidModal}>&times;</button>
            </div>
            
            <p className="modal-subtitle">
              Bidding on <strong>{selectedCrop.quantity} Qtl</strong> of <strong>{selectedCrop.crop_name}</strong> from {selectedCrop.farmer_name}.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
              Farmer's Expected Price: <strong>₹{selectedCrop.expected_price} / Qtl</strong>
            </p>
            
            <form onSubmit={handleBidSubmit} className="modal-form">
              <div className="form-group">
                <label>Your Offer Price (₹ per Quintal)</label>
                <input 
                  type="number" 
                  value={bidAmount} 
                  onChange={(e) => setBidAmount(e.target.value)} 
                  placeholder={`e.g., ${selectedCrop.expected_price - 100}`} 
                  min="1"
                  required 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeBidModal}>Cancel</button>
                <button type="submit" className="btn-primary">Submit Bid</button>
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

export default BuyerMarketplace;