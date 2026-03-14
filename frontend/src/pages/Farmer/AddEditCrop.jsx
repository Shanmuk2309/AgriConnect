import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './Dashboard.css';     

const AddEditCrop = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = Boolean(id); 

  // --- UPDATED: Added listed_date to state and default it to TODAY ---
  const [formData, setFormData] = useState({
    crop_name: '',
    quantity: '',
    expected_price: '',
    // Generates today's date in YYYY-MM-DD format (e.g., "2026-03-14")
    listed_date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    if (isEditMode) {
      // Mock fetched data, including the original date it was listed
      const mockFetchedCrop = {
        crop_name: 'Tomatoes',
        quantity: 50,
        expected_price: 2500,
        listed_date: '2026-03-10' // Keeps the original listing date when editing
      };
      setFormData(mockFetchedCrop);
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- UPDATED: Include listed_date in the final payload ---
    const payload = {
      farmerId: "Dummy_Farmer_123", 
      crop_name: formData.crop_name,
      quantity: Number(formData.quantity),
      expected_price: Number(formData.expected_price),
      listed_date: formData.listed_date 
    };

    if (isEditMode) {
      console.log("Updating crop with payload:", payload);
    } else {
      console.log("Adding new crop with payload:", payload);
    }

    navigate('/farmer/crops');
  };

  const handleLogout = () => {
    navigate('/login');
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
      <main className="crops-main">
        <div className="crops-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}> 
          <div className="crops-header" style={{ marginBottom: '2rem' }}>
            <div>
              <h2 style={{ color: '#1b5e20', margin: '0 0 0.5rem 0' }}>{isEditMode ? 'Edit Crop Details' : 'List a New Crop'}</h2>
              <p style={{ color: '#666', margin: 0 }}>{isEditMode ? 'Update your quantities or pricing.' : 'Enter the details of the harvest you want to sell.'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="market-search-form" style={{ display: 'flex', flexDirection: 'column', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            
            {/* --- NEW: Read-Only Date Field --- */}
            <div className="form-group" style={{ width: '100%', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#444', marginBottom: '0.5rem', display: 'block' }}>Date Listed</label>
              <input 
                type="date" 
                name="listed_date" 
                value={formData.listed_date} 
                readOnly // Prevents the user from changing it
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group" style={{ width: '100%', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#444', marginBottom: '0.5rem', display: 'block' }}>Crop Name</label>
              <input 
                type="text" 
                name="crop_name" 
                value={formData.crop_name} 
                onChange={handleChange} 
                placeholder="e.g., Tomatoes" 
                required 
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div className="form-group" style={{ width: '100%', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#444', marginBottom: '0.5rem', display: 'block' }}>Quantity Available (in Quintals)</label>
              <input 
                type="number" 
                name="quantity" 
                value={formData.quantity} 
                onChange={handleChange} 
                placeholder="e.g., 50" 
                min="1"
                required 
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div className="form-group" style={{ width: '100%', marginBottom: '2rem' }}>
              <label style={{ fontWeight: '600', color: '#444', marginBottom: '0.5rem', display: 'block' }}>Expected Price (₹ per Quintal)</label>
              <input 
                type="number" 
                name="expected_price" 
                value={formData.expected_price} 
                onChange={handleChange} 
                placeholder="e.g., 2500" 
                min="1"
                required 
                style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate('/farmer/crops')}
                style={{ padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc', background: '#f5f5f5', fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                style={{ padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', border: 'none', background: '#2e7d32', color: 'white', fontWeight: 'bold' }}
              >
                {isEditMode ? 'Save Changes' : 'List Crop'}
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* --- Footer --- */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AddEditCrop;