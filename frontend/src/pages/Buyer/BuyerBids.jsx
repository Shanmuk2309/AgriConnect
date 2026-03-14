import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf"; // --- NEW: Import the PDF library ---
import '../Public/LandingPage.css'; 
import './BuyerDashboard.css';     
import './BuyerBids.css'; 

const BuyerBids = () => {
  const navigate = useNavigate();

  const [bids, setBids] = useState([
    { _id: 'b1', crop_name: 'Tomatoes', farmer_name: 'Ramesh Kumar', quantity: 50, bid_amount: 2400, status: 'Pending', date: '2026-03-14' },
    { _id: 'b2', crop_name: 'Onions', farmer_name: 'Srinivas', quantity: 200, bid_amount: 3100, status: 'Accepted', date: '2026-03-12' },
    { _id: 'b3', crop_name: 'Potatoes', farmer_name: 'Venkatesh', quantity: 100, bid_amount: 1700, status: 'Rejected', date: '2026-03-10' }
  ]);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const handleLogout = () => navigate('/login');

  const handleCancelBid = (id) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this bid?");
    if (confirmCancel) {
      const updatedBids = bids.filter(bid => bid._id !== id);
      setBids(updatedBids);
    }
  };

  const openPaymentModal = (bid) => {
    setSelectedBid(bid);
    setIsPaymentOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentOpen(false);
    setSelectedBid(null);
    setPaymentMethod('UPI'); 
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const totalAmount = selectedBid.bid_amount * selectedBid.quantity;
    alert(`Payment of ₹${totalAmount.toLocaleString('en-IN')} Successful!`);
    
    const updatedBids = bids.map(bid => 
      bid._id === selectedBid._id ? { ...bid, status: 'Paid' } : bid
    );
    
    setBids(updatedBids);
    closePaymentModal();
  };

  // --- NEW: PDF Generation Function ---
  const downloadReceipt = (bid) => {
    const doc = new jsPDF();
    const totalAmount = bid.quantity * bid.bid_amount;
    
    // 1. Header (Branding)
    doc.setFontSize(24);
    doc.setTextColor(46, 125, 50); // AgriConnect Green
    doc.text("AgriConnect", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Official Payment Receipt", 105, 30, null, null, "center");
    
    // Divider Line
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // 2. Transaction Details
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt ID: TXN-${Math.floor(Math.random() * 1000000)}`, 20, 50);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, 58);
    doc.text(`Billed To: Suresh Traders (Buyer)`, 20, 66);
    doc.text(`Paid To: ${bid.farmer_name} (Farmer)`, 20, 74);
    
    // 3. Table Header Background
    doc.setFillColor(232, 245, 233); // Light green background
    doc.rect(20, 85, 170, 10, 'F');
    
    // Table Headers
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 92);
    doc.text("Quantity", 100, 92);
    doc.text("Rate", 130, 92);
    doc.text("Amount", 160, 92);
    
    // 4. Table Content
    doc.setFont("helvetica", "normal");
    doc.text(`${bid.crop_name}`, 25, 105);
    doc.text(`${bid.quantity} Qtl`, 100, 105);
    doc.text(`Rs. ${bid.bid_amount}`, 130, 105);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 160, 105);
    
    // 5. Total Calculation Line
    doc.setLineWidth(0.5);
    doc.line(20, 115, 190, 115);
    
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 125, 125);
    doc.setTextColor(46, 125, 50); // Green total
    doc.setFontSize(14);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 160, 125);
    
    // 6. Footer message
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Thank you for trading on AgriConnect!", 105, 150, null, null, "center");

    // 7. Trigger the download!
    doc.save(`AgriConnect_Receipt_${bid.crop_name}.pdf`);
  };

  return (
    <div className="landing-container">
      {/* Navbar stays the same */}
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/buyer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/buyer/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/buyer/bids" className="nav-link" style={{ color: '#2e7d32' }}>My Bids</Link>
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

      {/* Main Content */}
      <main className="buyer-bids-main">
        <div className="buyer-bids-container">
          <div className="buyer-bids-header">
            <h2>Track My Bids</h2>
            <p>Monitor the status of your offers and complete payments.</p>
          </div>

          <div className="buyer-bids-grid">
            {bids.length > 0 ? (
              bids.map((bid) => (
                <div key={bid._id} className={`buyer-bid-card ${bid.status.toLowerCase()}`}>
                  <div className="buyer-bid-card-header">
                    <h4>{bid.crop_name}</h4>
                    <span className={`badge-${bid.status.toLowerCase()}`}>{bid.status}</span>
                  </div>
                  
                  <div className="buyer-bid-card-body">
                    <div className="buyer-bid-detail">
                      <span className="detail-label">Farmer:</span>
                      <span className="detail-value">{bid.farmer_name}</span>
                    </div>
                    <div className="buyer-bid-detail">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{bid.quantity} Qtl</span>
                    </div>
                    <div className="buyer-bid-detail amount">
                      <span className="detail-label">My Offer:</span>
                      <span className="detail-value price">₹{bid.bid_amount} / Qtl</span>
                    </div>
                  </div>

                  {bid.status === 'Pending' && (
                    <div className="buyer-bid-card-actions">
                      <button className="btn-cancel-bid" onClick={() => handleCancelBid(bid._id)}>Cancel Bid</button>
                    </div>
                  )}

                  {bid.status === 'Accepted' && (
                    <div className="buyer-bid-card-actions">
                      <button className="btn-proceed" onClick={() => openPaymentModal(bid)}>Proceed to Payment</button>
                    </div>
                  )}

                  {/* --- UPDATED: Connect the button to the PDF generator --- */}
                  {bid.status === 'Paid' && (
                    <div className="buyer-bid-card-actions">
                      <button 
                        className="btn-secondary" 
                        style={{ width: '100%', borderColor: '#1565c0', color: '#1565c0' }} 
                        onClick={() => downloadReceipt(bid)}
                      >
                        📄 Download Receipt PDF
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-bids">
                <p>You haven't placed any bids yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Payment Modal stays exactly the same */}
      {isPaymentOpen && selectedBid && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <div className="modal-header">
              <h3>Secure Checkout</h3>
              <button className="btn-close" onClick={closePaymentModal}>&times;</button>
            </div>
            
            <div className="order-summary">
              <h4>Order Summary</h4>
              <div className="summary-row"><span>Crop:</span> <strong>{selectedBid.crop_name}</strong></div>
              <div className="summary-row"><span>Quantity:</span> <strong>{selectedBid.quantity} Qtl</strong></div>
              <div className="summary-total">
                <span>Total Amount to Pay:</span>
                <span className="total-price">₹{(selectedBid.bid_amount * selectedBid.quantity).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="payment-form">
              <div className="form-group">
                <label>Select Payment Method</label>
                <div className="payment-options">
                  <label className={`pay-option ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} /> UPI
                  </label>
                  <label className={`pay-option ${paymentMethod === 'Card' ? 'active' : ''}`}>
                    <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={(e) => setPaymentMethod(e.target.value)} /> Card
                  </label>
                </div>
              </div>

              {paymentMethod === 'UPI' ? (
                <div className="form-group fade-in">
                  <label>Enter UPI ID</label>
                  <input type="text" placeholder="e.g., ramesh@okhdfcbank" required />
                </div>
              ) : (
                <div className="fade-in">
                  <div className="form-group"><label>Card Number</label><input type="text" required /></div>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="submit" className="btn-pay-now">
                  Pay ₹{(selectedBid.bid_amount * selectedBid.quantity).toLocaleString('en-IN')}
                </button>
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

export default BuyerBids;