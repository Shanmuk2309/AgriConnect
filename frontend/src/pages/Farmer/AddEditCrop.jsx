import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../Public/LandingPage.css'; 
import './Dashboard.css';     

const AddEditCrop = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditMode = Boolean(id); 
  const userId = localStorage.getItem('userId');

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(isEditMode); 

  const [formData, setFormData] = useState({
    crop_name: '',
    quantity: '',
    expected_price: '',
    listed_date: new Date().toISOString().split('T')[0] 
  });

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Get user for Navbar
        const userRes = await axios.get(`/api/farmers/${userId}`);
        setUserData(userRes.data);

        // If editing, get the crop data
        if (isEditMode) {
          const cropRes = await axios.get(`/api/crops/${id}`);
          setFormData({
            crop_name: cropRes.data.crop_name,
            quantity: cropRes.data.quantity,
            expected_price: cropRes.data.expected_price,
            listed_date: cropRes.data.listed_date || formData.listed_date
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode, userId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      farmerId: userId, // Dynamically use the logged-in farmer's ID
      crop_name: formData.crop_name,
      quantity: Number(formData.quantity),
      expected_price: Number(formData.expected_price),
      listed_date: formData.listed_date,
      status: 'Listed'
    };

    try {
      if (isEditMode) {
        await axios.put(`/api/crops/${id}`, payload);
      } else {
        await axios.post('/api/crops/add', payload);
      }
      navigate('/farmer/crops');
    } catch (error) {
      console.error("Failed to save crop:", error);
      alert("Failed to save crop data. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Farmer';

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;

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
        <div className="crops-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 0' }}> 
          <div className="crops-header" style={{ marginBottom: '2rem' }}>
            <div>
              <h2 style={{ color: '#1b5e20', margin: '0 0 0.5rem 0' }}>{isEditMode ? 'Edit Crop Details' : 'List a New Crop'}</h2>
              <p style={{ color: '#666', margin: 0 }}>{isEditMode ? 'Update your quantities or pricing.' : 'Enter the details of the harvest you want to sell.'}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="market-search-form" style={{ display: 'flex', flexDirection: 'column', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            
            <div className="form-group" style={{ width: '100%', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#444', marginBottom: '0.5rem', display: 'block' }}>Date Listed</label>
              <input type="date" name="listed_date" value={formData.listed_date} readOnly style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f5f5f5', color: '#666', cursor: 'not-allowed' }} />
            </div>

            <div className="form-group" style={{ width: '100%', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#444', marginBottom: '0.5rem', display: 'block' }}>Crop Name</label>
              <input type="text" name="crop_name" value={formData.crop_name} onChange={handleChange} placeholder="e.g., Tomatoes" required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div className="form-group" style={{ width: '100%', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#444', marginBottom: '0.5rem', display: 'block' }}>Quantity Available (in Quintals)</label>
              <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g., 50" min="1" required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div className="form-group" style={{ width: '100%', marginBottom: '2rem' }}>
              <label style={{ fontWeight: '600', color: '#444', marginBottom: '0.5rem', display: 'block' }}>Expected Price (₹ per Quintal)</label>
              <input type="number" name="expected_price" value={formData.expected_price} onChange={handleChange} placeholder="e.g., 2500" min="1" required style={{ width: '100%', padding: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-secondary" onClick={() => navigate('/farmer/crops')} style={{ padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc', background: '#f5f5f5', fontWeight: 'bold' }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: '0.8rem 1.5rem', borderRadius: '4px', cursor: 'pointer', border: 'none', background: '#2e7d32', color: 'white', fontWeight: 'bold' }}>{isEditMode ? 'Save Changes' : 'List Crop'}</button>
            </div>

          </form>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AddEditCrop;