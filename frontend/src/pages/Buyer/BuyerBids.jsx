import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf"; 
import { toast } from '../../utils/toast';
import '../Public/LandingPage.css'; 
import './BuyerDashboard.css';     
import './BuyerBids.css'; 

const BuyerBids = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [userData, setUserData] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isEditBidOpen, setIsEditBidOpen] = useState(false);
  const [editingBid, setEditingBid] = useState(null);
  const [editBidAmount, setEditBidAmount] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingBid, setDeletingBid] = useState(null);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/api/buyers/${userId}`);
        setUserData(userRes.data);

        // Fetch Bids, Crops, and Farmers
        const [bidsRes, cropsRes, farmersRes] = await Promise.all([
          axios.get('/api/bids'),
          axios.get('/api/crops'),
          axios.get('/api/farmers')
        ]);

        const myBids = bidsRes.data.filter(bid => bid.buyerId === userId);
        
        // Populate the bids with crop and farmer names
        const populatedBids = myBids.map(bid => {
          const crop = cropsRes.data.find(c => c._id === bid.cropId);
          const farmer = crop ? farmersRes.data.find(f => f._id === crop.farmerId) : null;
          return {
            ...bid,
            crop_name: crop?.crop_name || 'Unknown Crop',
            quantity: crop?.quantity || 0,
            farmer_name: farmer?.name || 'Unknown Farmer'
          };
        });

        setBids(populatedBids);
      } catch (error) {
        console.error("Failed to fetch bids data:", error);
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

  const openPaymentModal = (bid) => {
    setSelectedBid(bid);
    setIsPaymentOpen(true);
  };

  const openEditBidModal = (bid) => {
    setEditingBid(bid);
    setEditBidAmount(String(bid.bid_amount || ''));
    setIsEditBidOpen(true);
  };

  const closeEditBidModal = () => {
    setIsEditBidOpen(false);
    setEditingBid(null);
    setEditBidAmount('');
  };

  const handleBidUpdate = async (e) => {
    e.preventDefault();

    if (!editingBid) {
      return;
    }

    try {
      const payload = { bid_amount: Number(editBidAmount) };
      await axios.put(`/api/bids/${editingBid._id}`, payload);

      setBids(bids.map((bid) => (
        bid._id === editingBid._id
          ? { ...bid, bid_amount: Number(editBidAmount) }
          : bid
      )));

      closeEditBidModal();
      toast.success('Bid Updated');
    } catch (error) {
      console.error('Failed to update bid:', error);
      toast.error('Failed to update bid');
    }
  };

  const openDeleteConfirm = (bid) => {
    setDeletingBid(bid);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setDeletingBid(null);
  };

  const handleBidDelete = async () => {
    if (!deletingBid) {
      return;
    }

    try {
      await axios.delete(`/api/bids/${deletingBid._id}`);
      setBids(bids.filter((bid) => bid._id !== deletingBid._id));
      closeDeleteConfirm();
      toast.success(deletingBid.status === 'Rejected' ? 'Rejected Bid Deleted' : 'Bid Withdrawn');
    } catch (error) {
      console.error('Failed to delete bid:', error);
      toast.error('Failed to delete bid');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update bid status to "Paid" in the database
      await axios.put(`/api/bids/${selectedBid._id}`, { status: 'Paid' });
      
      // Update local state
      setBids(bids.map(b => b._id === selectedBid._id ? { ...b, status: 'Paid' } : b));
      
      setIsPaymentOpen(false);
      setSelectedBid(null);
      toast.success('Payment Successful');
    } catch (error) {
      console.error("Payment error:", error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const downloadReceipt = (bid) => {
    const doc = new jsPDF();
    const totalAmount = bid.quantity * bid.bid_amount;
    
    doc.setFontSize(24);
    doc.setTextColor(21, 101, 192); 
    doc.text("AgriConnect", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Payment Receipt (Buyer Copy)", 105, 30, null, null, "center");
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt ID: TXN-${Math.floor(Math.random() * 1000000)}`, 20, 50);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, 58);
    doc.text(`Paid By: ${userData?.business_name || userData?.name}`, 20, 66);
    doc.text(`Paid To: ${bid.farmer_name} (Farmer)`, 20, 74); 
    
    doc.setFillColor(227, 242, 253); 
    doc.rect(20, 85, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, 92);
    doc.text("Quantity", 100, 92);
    doc.text("Rate", 130, 92);
    doc.text("Amount", 160, 92);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${bid.crop_name}`, 25, 105);
    doc.text(`${bid.quantity} Qtl`, 100, 105);
    doc.text(`Rs. ${bid.bid_amount}`, 130, 105);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 160, 105);
    
    doc.setLineWidth(0.5);
    doc.line(20, 115, 190, 115);
    doc.setFont("helvetica", "bold");
    doc.text("Total Paid:", 120, 125);
    doc.setTextColor(21, 101, 192);
    doc.setFontSize(14);
    doc.text(`Rs. ${totalAmount.toLocaleString('en-IN')}`, 160, 125);

    doc.save(`AgriConnect_Receipt_${bid.crop_name}.pdf`);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your bids...</div>;

  const businessName = userData?.business_name || userData?.name || 'Buyer';

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/buyer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/buyer/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/buyer/bids" className="nav-link" style={{ color: '#2e7d32' }}>My Bids</Link>
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

      <main className="bids-main">
        <div className="bids-container">
          <div className="bids-header">
            <h2>My Bids & Offers</h2>
            <p>Track the status of your offers and complete payments for accepted bids.</p>
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
                    <div className="bid-detail"><span className="detail-label">Farmer:</span><span className="detail-value">{bid.farmer_name}</span></div>
                    <div className="bid-detail"><span className="detail-label">Quantity:</span><span className="detail-value">{bid.quantity} Qtl</span></div>
                    <div className="bid-detail"><span className="detail-label">Date Placed:</span><span className="detail-value">{bid.date || new Date().toISOString().split('T')[0]}</span></div>
                    <div className="bid-detail amount"><span className="detail-label">My Offer:</span><span className="detail-value price">₹{bid.bid_amount} / Qtl</span></div>
                  </div>

                  {bid.status === 'Accepted' && (
                    <div className="bid-card-actions">
                      <button className="btn-pay" onClick={() => openPaymentModal(bid)}>Proceed to Payment</button>
                    </div>
                  )}

                  {bid.status === 'Pending' && (
                    <div className="bid-card-actions" style={{ display: 'flex', gap: '0.6rem' }}>
                      <button className="btn-secondary" style={{ flex: 1 }} onClick={() => openEditBidModal(bid)}>
                        Update Offer
                      </button>
                      <button
                        className="btn-secondary"
                        style={{ flex: 1, borderColor: '#d32f2f', color: '#d32f2f' }}
                        onClick={() => openDeleteConfirm(bid)}
                      >
                        Withdraw
                      </button>
                    </div>
                  )}

                  {bid.status === 'Paid' && (
                    <div className="bid-card-actions">
                      <button className="btn-secondary" style={{ width: '100%', borderColor: '#1565c0', color: '#1565c0' }} onClick={() => downloadReceipt(bid)}>
                        📄 Download Receipt
                      </button>
                    </div>
                  )}

                  {bid.status === 'Rejected' && (
                    <div className="bid-card-actions">
                      <button
                        className="btn-secondary"
                        style={{ width: '100%', borderColor: '#d32f2f', color: '#d32f2f' }}
                        onClick={() => openDeleteConfirm(bid)}
                      >
                        Delete Rejected Bid
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-bids"><p>You haven't placed any bids yet. Visit the Marketplace to start!</p></div>
            )}
          </div>
        </div>
      </main>

      {/* --- Payment Modal --- */}
      {isPaymentOpen && selectedBid && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <div className="modal-header">
              <h3>Complete Payment</h3>
              <button className="btn-close" onClick={() => setIsPaymentOpen(false)}>&times;</button>
            </div>
            
            <div className="payment-summary">
              <p>Paying <strong>{selectedBid.farmer_name}</strong> for <strong>{selectedBid.quantity} Qtl</strong> of {selectedBid.crop_name}.</p>
              <div className="total-amount">
                <span>Total Amount:</span>
                <span className="amount-highlight">₹{(selectedBid.bid_amount * selectedBid.quantity).toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="modal-form">
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

      {isEditBidOpen && editingBid && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3>Update Your Bid</h3>
              <button className="btn-close" onClick={closeEditBidModal}>&times;</button>
            </div>

            <p className="modal-subtitle">
              Editing bid for <strong>{editingBid.crop_name}</strong>
            </p>

            <form onSubmit={handleBidUpdate} className="modal-form">
              <div className="form-group">
                <label>Offer Price (₹ per Quintal)</label>
                <input
                  type="number"
                  value={editBidAmount}
                  onChange={(e) => setEditBidAmount(e.target.value)}
                  min="1"
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeEditBidModal}>Cancel</button>
                <button type="submit" className="btn-primary">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && deletingBid && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3>{deletingBid.status === 'Rejected' ? 'Delete Rejected Bid' : 'Withdraw Bid'}</h3>
              <button className="btn-close" onClick={closeDeleteConfirm}>&times;</button>
            </div>

            <p className="modal-subtitle" style={{ marginBottom: '1rem' }}>
              {deletingBid.status === 'Rejected'
                ? `Remove this rejected bid for ${deletingBid.crop_name}?`
                : `Withdraw your pending offer for ${deletingBid.crop_name}?`}
            </p>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={closeDeleteConfirm}>Cancel</button>
              <button
                type="button"
                className="btn-secondary"
                style={{ borderColor: '#d32f2f', color: '#d32f2f' }}
                onClick={handleBidDelete}
              >
                Confirm
              </button>
            </div>
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