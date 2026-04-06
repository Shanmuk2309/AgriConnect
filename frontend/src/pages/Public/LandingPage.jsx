import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LandingPage.css'; 

const LandingPage = () => {
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Start with empty strings so the user can search for anything
  const [searchParams, setSearchParams] = useState({
    commodity: '',
    state: '',
    district: ''
  });
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);

  const scrollToMarket = (e) => {
    e.preventDefault(); 
    const marketSection = document.getElementById('market-section');
    if (marketSection) {
      marketSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const fetchMarketPrices = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get('/api/market/prices', { params: searchParams });
      setMarketData({
        success: true,
        date_fetched: response.data.date_fetched || new Date().toLocaleDateString(),
        records: response.data.records || []
      });
    } catch (error) {
      console.error("Error fetching market prices:", error);
      alert("Failed to fetch live market prices. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const getDashboardRoute = () => {
    if (userRole === 'Farmer') return '/farmer/dashboard';
    if (userRole === 'Buyer') return '/buyer/dashboard';
    if (userRole === 'Cold Storage Owner') return '/cs-owner/dashboard';
    return '/login';
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/'); 
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>AgriConnect</h1>
        </div>
        <div className="navbar-links">
          <a href="#market-section" onClick={scrollToMarket} className="nav-link">Market Prices</a>
          <div className="nav-divider"></div>
          
          {token ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to={getDashboardRoute()} className="nav-link" style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                My Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>
                Log Out
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/register" className="btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h2 className="hero-title">Empowering the Agricultural Supply Chain</h2>
          <p className="hero-subtitle">
            A unified platform bridging the gap between Farmers, Buyers, and Cold Storage Owners. 
            Trade smarter, store safer, and grow your business.
          </p>
          <div className="hero-actions">
            {token ? (
              <Link to={getDashboardRoute()} className="btn-primary large">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary large">Join the Network</Link>
                <Link to="/login" className="btn-secondary large">Access Dashboard</Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <section className="features-section">
        <h3 className="section-title">Who is AgriConnect For?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌾</div>
            <h4>Farmers</h4>
            <p>List your crops, discover nearby cold storage facilities to extend shelf life, and receive competitive bids directly from verified buyers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛒</div>
            <h4>Buyers</h4>
            <p>Browse a wide marketplace of fresh produce, place bids securely, and source high-quality crops directly from the growers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">❄️</div>
            <h4>Cold Storage Owners</h4>
            <p>Manage your facility's capacity, optimize your space utilization, and connect with local farmers who need immediate storage solutions.</p>
          </div>
        </div>
      </section>

      <section id="market-section" className="market-section">
        <div className="market-container">
          <div className="market-header">
            <h3>Live Market Prices</h3>
            <p>Check today's Mandi rates. <strong>Leave the commodity blank to view all crops in a region!</strong></p>
          </div>

          <form onSubmit={fetchMarketPrices} className="market-search-form">
            <div className="form-group">
              <label>Commodity (Optional)</label>
              {/* Removed 'required' so users can fetch all crops */}
              <input type="text" name="commodity" value={searchParams.commodity} onChange={handleInputChange} placeholder="Any Crop (e.g. Potato, Wheat)" />
            </div>
            <div className="form-group">
              <label>State (Optional)</label>
              <input type="text" name="state" value={searchParams.state} onChange={handleInputChange} placeholder="e.g., Andhra Pradesh" />
            </div>
            <div className="form-group">
              <label>District (Optional)</label>
              <input type="text" name="district" value={searchParams.district} onChange={handleInputChange} placeholder="e.g., Chittoor" />
            </div>
            <div className="form-action">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Searching...' : 'Get Prices'}
              </button>
            </div>
          </form>

          {marketData && (
            <div className="market-results">
              <div className="results-header">
                <strong>Prices as of: {marketData.date_fetched}</strong>
              </div>
              <div className="table-responsive">
                <table className="market-table">
                  <thead>
                    <tr>
                      <th>Market / Mandi</th>
                      <th>Commodity</th>
                      <th>Min Price (₹/Qtl)</th>
                      <th>Max Price (₹/Qtl)</th>
                      <th>Modal Price (₹/Qtl)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.records.length > 0 ? (
                      marketData.records.map((record, index) => (
                        <tr key={index}>
                          <td className="fw-bold">{record.market || record.Market}</td>
                          {/* Added Commodity Column to show what crop it is */}
                          <td>{record.commodity || record.Commodity}</td>
                          <td className="text-danger">₹{record.min_price || record.Min_Price}</td>
                          <td className="text-success">₹{record.max_price || record.Max_Price}</td>
                          <td className="fw-bold">₹{record.modal_price || record.Modal_Price}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center">No live data found for this selection. Try checking spelling or change filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;