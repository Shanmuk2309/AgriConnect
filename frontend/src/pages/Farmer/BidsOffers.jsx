import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf"; // --- NEW: Import jsPDF ---
import '../Public/LandingPage.css'; 
import './Dashboard.css';      
import './FarmerBids.css'; 

const BidsOffers = () => {
  const navigate = useNavigate();

  // Mock data updated to include 'quantity' and a 'Paid' status for testing
  const [bids, setBids] = useState([
    { _id: '1', crop_name: 'Tomatoes', buyer_name: 'Ravi Kumar', quantity: 10, bid_amount: 2600, status: 'Pending', date: '2026-03-14' },
    { _id: '2', crop_name: 'Potatoes', buyer_name: 'Suresh Traders', quantity: 20, bid_amount: 1450, status: 'Paid', date: '2026-03-12' },
    { _id: '3', crop_name: 'Onions', buyer_name: 'Kisan Fresh', quantity: 15, bid_amount: 1866, status: 'Rejected', date: '2026-03-10' }
  ]);

  const handleLogout = () => {
    navigate('/login');
  };

  const handleAccept = (id) => {
    const updatedBids = bids.map(bid => 
      bid._id === id ? { ...bid, status: 'Accepted' } : bid
    );
    setBids(updatedBids);
    alert("Offer accepted! Waiting for the buyer to complete payment.");
  };

  const handleReject = (id) => {
    const updatedBids = bids.map(bid => 
      bid._id === id ? { ...bid, status: 'Rejected' } : bid
    );
    setBids(updatedBids);
  };

  // --- NEW: PDF Generation Function for Farmer ---
  const downloadReceipt = (bid) => {
    const doc = new jsPDF();
    const totalAmount = bid.quantity * bid.bid_amount;
    
    // Header
    doc.setFontSize(24);
    doc.setTextColor(46, 125, 50); 
    doc.text("AgriConnect", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Payment Receipt (Seller Copy)", 105, 30, null, null, "center");
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // Details
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt ID: TXN-${Math.floor(Math.random() * 1000000)}`, 20, 50);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, 58);
    doc.text(`Received From: ${bid.buyer_name} (Buyer)`, 20, 66);
    doc.text(`Paid To: Ramesh (Farmer)`, 20, 74); 
    
    // Table Header
    doc.setFillColor(232, 245, 233); 
    doc.rect(20, 85, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 92);
    doc.text("Quantity", 100, 92);
    doc.text("Rate", 130, 92);
    doc.text("Amount", 160, 92);
    
    // Table Content
    doc.setFont("helvetica", "normal");
    doc.text(`${bid.crop_name}`, 25, 105);
    doc.text(`${bid.quantity} Qtl`, 100, 105);
    doc.text(`Rs. ${bid.bid_amount}`, 130, 105);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 160, 105);
    
    // Total
    doc.setLineWidth(0.5);
    doc.line(20, 115, 190, 115);
    doc.setFont("helvetica", "bold");
    doc.text("Total Received:", 120, 125);
    doc.setTextColor(46, 125, 50);
    doc.setFontSize(14);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 160, 125);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for trading on AgriConnect!", 105, 150, null, null, "center");

    doc.save(`AgriConnect_Seller_Receipt_${bid.crop_name}.pdf`);
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/farmer/dashboard" style={{ textDecoration: 'none' }}>
            <h1>AgriConnect</h1>
          </Link>
        </div>
        <div className="navbar-links">
          <Link to="/farmer/crops" className="nav-link">My Crops</Link>
          <Link to="/farmer/bids" className="nav-link" style={{ color: '#2e7d32' }}>Bids & Offers</Link>
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

      {/* Main Content Area */}
      <main className="bids-main">
        <div className="bids-container">
          <div className="bids-header">
            <h2>Incoming Bids & Offers</h2>
            <p>Review and negotiate offers from verified buyers.</p>
          </div>

          <div className="bids-grid">
            {bids.length > 0 ? (
              bids.map((bid) => (
                <div key={bid._id} className={`bid-card ${bid.status.toLowerCase()}`}>
                  <div className="bid-card-header">
                    <h4>{bid.crop_name}</h4>
                    <span className={`badge-${bid.status.toLowerCase()}`}>{bid.status}</span>
                  </div>
                  
                  <div className="bid-card-body">
                    <div className="bid-detail">
                      <span className="detail-label">Buyer:</span>
                      <span className="detail-value">{bid.buyer_name}</span>
                    </div>
                    <div className="bid-detail">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{bid.quantity} Qtl</span>
                    </div>
                    <div className="bid-detail">
                      <span className="detail-label">Date:</span>
                      <span className="detail-value">{bid.date}</span>
                    </div>
                    <div className="bid-detail amount">
                      <span className="detail-label">Offer Rate:</span>
                      <span className="detail-value price">₹{bid.bid_amount} / Qtl</span>
                    </div>
                  </div>

                  {/* Actions for Pending Bids */}
                  {bid.status === 'Pending' && (
                    <div className="bid-card-actions">
                      <button className="btn-accept" onClick={() => handleAccept(bid._id)}>Accept Offer</button>
                      <button className="btn-reject" onClick={() => handleReject(bid._id)}>Reject</button>
                    </div>
                  )}

                  {/* Message for Accepted (Waiting on payment) */}
                  {bid.status === 'Accepted' && (
                    <div style={{ textAlign: 'center', padding: '0.8rem', backgroundColor: '#f5f5f5', color: '#666', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      ⏳ Waiting for Buyer Payment
                    </div>
                  )}

                  {/* --- NEW: Download Receipt for Paid Bids --- */}
                  {bid.status === 'Paid' && (
                    <div className="bid-card-actions">
                      <button 
                        className="btn-secondary" 
                        style={{ width: '100%', borderColor: '#1565c0', color: '#1565c0' }} 
                        onClick={() => downloadReceipt(bid)}
                      >
                        📄 Download Seller Receipt
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-bids">
                <p>You have no incoming bids right now.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BidsOffers;