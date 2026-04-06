import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './BuyerDashboard.css';     
import './BuyerMarketPlace.css'; 

const BuyerMarketplace = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [userData, setUserData] = useState(null);

  // --- State for Farmer Listings (Database) ---
  const [crops, setCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCrops, setLoadingCrops] = useState(true);

  // --- State for Agmarknet API (Real-time Prices) ---
  const [marketSearch, setMarketSearch] = useState({ commodity: 'Tomato', state: 'Andhra Pradesh', district: 'Chittoor' });
  const [marketPrices, setMarketPrices] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);

  // --- Modal & Bidding State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [bidAmount, setBidAmount] = useState('');

  // 1. Initial Data Fetch (User Info & Farmer Crops)
  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        const userRes = await axios.get(`/api/buyers/${userId}`);
        setUserData(userRes.data);

        // Fetch crops listed by farmers from our database
        const cropsRes = await axios.get('/api/crops');
        // Only show crops that are 'Listed' (not already sold)
        const availableCrops = cropsRes.data.filter(crop => crop.status === 'Listed' || !crop.status);
        
        // Fetch farmer names for each crop
        const populatedCrops = await Promise.all(availableCrops.map(async (crop) => {
          try {
            const farmerRes = await axios.get(`/api/farmers/${crop.farmerId}`);
            return { 
              ...crop, 
              farmer_name: farmerRes.data.name,
              location: `${farmerRes.data.address?.district || 'Unknown'}, ${farmerRes.data.address?.state || ''}`
            };
          } catch (e) {
            return { ...crop, farmer_name: 'Unknown Farmer', location: 'Unknown Location' };
          }
        }));

        setCrops(populatedCrops);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingCrops(false);
      }
    };

    fetchInitialData();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // 2. Fetch Live Prices from Agmarknet API
  const handleMarketSearch = async (e) => {
    e.preventDefault();
    setMarketLoading(true);
    try {
      // Calls your backend route which securely fetches from Agmarknet
      const response = await axios.get('/api/market/prices', { params: marketSearch });
      setMarketPrices(response.data.records || []);
    } catch (error) {
      console.error("Error fetching market prices:", error);
      alert("Failed to fetch live market prices. Please try again.");
    } finally {
      setMarketLoading(false);
    }
  };

  // 3. Bidding Functions
  const openBidModal = (crop) => {
    setSelectedCrop(crop);
    setBidAmount('');
    setIsModalOpen(true);
  };

  const closeBidModal = () => {
    setIsModalOpen(false);
    setSelectedCrop(null);
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    try {
      const bidPayload = {
        buyerId: userId,
        cropId: selectedCrop._id,
        bid_amount: Number(bidAmount),
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };
      
      // Save bid to database
      await axios.post('/api/bids/add', bidPayload);
      
      alert(`Successfully placed a bid of ₹${bidAmount} for ${selectedCrop.crop_name}!`);
      closeBidModal();
      
      // Optionally remove the crop from the view so they don't bid twice
      setCrops(crops.filter(crop => crop._id !== selectedCrop._id));
    } catch (error) {
      console.error("Error submitting bid:", error);
      alert("Failed to submit bid.");
    }
  };

  const filteredCrops = crops.filter(crop => 
    crop.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crop.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const businessName = userData?.business_name || userData?.name || 'Buyer';

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
            <button className="profile-btn">{businessName} ▼</button>
            <div className="dropdown-content">
              <Link to="/buyer/profile">My Profile</Link>
              <Link to="/buyer/dashboard">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="market-main">
        <div className="market-container">
          
          {/* --- SECTION 1: Agmarknet Live Prices --- */}
          <div style={{ backgroundColor: '#e8f5e9', padding: '2rem', borderRadius: '8px', marginBottom: '3rem', border: '1px solid #c8e6c9' }}>
            <h2 style={{ color: '#1b5e20', marginBottom: '0.5rem' }}>Live Market Trends (Agmarknet)</h2>
            <p style={{ color: '#2e7d32', marginBottom: '1.5rem' }}>Check official government mandi prices before placing your bids.</p>
            
            <form onSubmit={handleMarketSearch} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <input type="text" placeholder="Commodity (e.g. Tomato)" value={marketSearch.commodity} onChange={e => setMarketSearch({...marketSearch, commodity: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: '200px' }} required />
              <input type="text" placeholder="State (e.g. Andhra Pradesh)" value={marketSearch.state} onChange={e => setMarketSearch({...marketSearch, state: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: '200px' }} />
              <input type="text" placeholder="District" value={marketSearch.district} onChange={e => setMarketSearch({...marketSearch, district: e.target.value})} style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: '200px' }} />
              <button type="submit" className="btn-primary" disabled={marketLoading} style={{ padding: '0 2rem' }}>
                {marketLoading ? 'Searching...' : 'Check Prices'}
              </button>
            </form>

            {marketPrices.length > 0 && (
              <div style={{ backgroundColor: 'white', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: '#f5f5f5' }}>
                    <tr>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Market</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Commodity</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Min Price (₹/Qtl)</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Max Price (₹/Qtl)</th>
                      <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Modal Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketPrices.map((record, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem' }}>{record.market || record.Market}</td>
                        <td style={{ padding: '1rem' }}>{record.commodity || record.Commodity}</td>
                        <td style={{ padding: '1rem', color: '#d32f2f' }}>₹{record.min_price || record.Min_Price}</td>
                        <td style={{ padding: '1rem', color: '#1976d2' }}>₹{record.max_price || record.Max_Price}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#2e7d32' }}>₹{record.modal_price || record.Modal_Price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {marketPrices.length === 0 && !marketLoading && (
               <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>Search to view live prices.</p>
            )}
          </div>

          {/* --- SECTION 2: Farmer Listings (Database) --- */}
          <div className="market-header">
            <div>
              <h2>Available Farmer Listings</h2>
              <p>Browse fresh produce listed directly by farmers and place your bids.</p>
            </div>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search local crops or locations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loadingCrops ? (
             <div style={{ textAlign: 'center', padding: '3rem' }}>Loading marketplace...</div>
          ) : (
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
                      <div className="crop-detail">
                        <span className="detail-label">Listed On:</span>
                        <span className="detail-value" style={{ color: '#1565c0', fontWeight: 'bold' }}>
                          {crop.listed_date || new Date().toISOString().split('T')[0]}
                        </span>
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
                  <p>No crops currently listed by farmers.</p>
                </div>
              )}
            </div>
          )}
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

      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BuyerMarketplace;