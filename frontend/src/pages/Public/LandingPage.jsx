import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; 

const LandingPage = () => {
  const [searchParams, setSearchParams] = useState({
    commodity: 'Tomato',
    state: 'Andhra Pradesh',
    district: 'Chittoor'
  });
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- NEW: Smooth Scroll Function ---
  const scrollToMarket = (e) => {
    e.preventDefault(); // Prevent default anchor jump
    const marketSection = document.getElementById('market-section');
    if (marketSection) {
      marketSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const fetchMarketPrices = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setMarketData({
        success: true,
        date_fetched: new Date().toLocaleDateString(),
        records: [
          { market: 'Madanapalle', min_price: 2000, max_price: 3200, modal_price: 2800 },
          { market: 'Punganur', min_price: 1800, max_price: 3000, modal_price: 2500 },
          { market: 'V.Kota', min_price: 2100, max_price: 3300, modal_price: 2900 }
        ]
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="landing-container">
      {/* --- UPDATED: Navigation Bar --- */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>AgriConnect</h1>
        </div>
        <div className="navbar-links">
          {/* New Market Prices Link */}
          <a href="#market-section" onClick={scrollToMarket} className="nav-link">Market Prices</a>
          
          <Link to="/login" className="nav-link">Log In</Link>
          
          {/* New Vertical Divider */}
          <div className="nav-divider"></div>
          
          <Link to="/register" className="btn-primary">Get Started</Link>
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
            <Link to="/register" className="btn-primary large">Join the Network</Link>
            <Link to="/login" className="btn-secondary large">Access Dashboard</Link>
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

      {/* --- UPDATED: Added id="market-section" --- */}
      <section id="market-section" className="market-section">
        <div className="market-container">
          <div className="market-header">
            <h3>Live Market Prices</h3>
            <p>Check today's Mandi rates directly from Agmarknet before making a trade.</p>
          </div>

          <form onSubmit={fetchMarketPrices} className="market-search-form">
            <div className="form-group">
              <label>Commodity</label>
              <input type="text" name="commodity" value={searchParams.commodity} onChange={handleInputChange} placeholder="e.g., Tomato" required />
            </div>
            <div className="form-group">
              <label>State</label>
              <input type="text" name="state" value={searchParams.state} onChange={handleInputChange} placeholder="e.g., Andhra Pradesh" required />
            </div>
            <div className="form-group">
              <label>District</label>
              <input type="text" name="district" value={searchParams.district} onChange={handleInputChange} placeholder="e.g., Chittoor" required />
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
                      <th>Min Price (₹/Qtl)</th>
                      <th>Max Price (₹/Qtl)</th>
                      <th>Modal Price (₹/Qtl)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.records.length > 0 ? (
                      marketData.records.map((record, index) => (
                        <tr key={index}>
                          <td className="fw-bold">{record.market}</td>
                          <td className="text-danger">₹{record.min_price}</td>
                          <td className="text-success">₹{record.max_price}</td>
                          <td className="fw-bold">₹{record.modal_price}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">No data found for this selection.</td>
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