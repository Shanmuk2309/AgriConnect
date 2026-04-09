import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf"; 
import { toast } from '../../utils/toast';
import { confirmDialog } from '../../utils/confirm';
import '../Public/LandingPage.css'; 
import './Dashboard.css';      
import './FarmerBids.css'; 

const BidsOffers = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch User Data
        const userRes = await axios.get(`/api/farmers/${userId}`);
        setUserData(userRes.data);

        // 2. Fetch Crops, Bids, AND Buyers from the database at the same time
        const [cropsRes, bidsRes, buyersRes] = await Promise.all([
          axios.get('/api/crops'),
          axios.get('/api/bids'),
          axios.get('/api/buyers') // Fetching buyers to get their Business Names
        ]);

        const myCrops = cropsRes.data.filter(c => c.farmerId === userId);
        const myCropIds = myCrops.map(c => c._id);
        const allBuyers = buyersRes.data;

        // 3. Map crop names and buyer names to the bids
        const myBids = bidsRes.data
          .filter(bid => myCropIds.includes(bid.cropId))
          .map(bid => {
             const matchedCrop = myCrops.find(c => c._id === bid.cropId);
             
             // MATCH THE BUYER: Find the buyer whose ID matches the bid's buyerId
             const matchedBuyer = allBuyers.find(b => b._id === bid.buyerId);
             
             return {
               ...bid,
               crop_name: matchedCrop ? matchedCrop.crop_name : 'Unknown Crop',
               quantity: matchedCrop ? matchedCrop.quantity : 0,
               
               // DYNAMIC BUYER NAME: Use business_name, fallback to name, fallback to 'Unknown Buyer'
               buyer_name: matchedBuyer ? (matchedBuyer.business_name || matchedBuyer.name) : 'Unknown Buyer', 
               
               status: bid.status || 'Pending',
               date: bid.date || new Date().toISOString().split('T')[0]
             };
          });

        setBids(myBids);
      } catch (error) {
        console.error("Error fetching bids:", error);
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

  // --- ENSURED FIX: Now receives cropId and updates the Crop database ---
  const handleStatusUpdate = async (id, newStatus, cropId) => {
    try {
      // Update the Bid's status
      await axios.put(`/api/bids/${id}`, { status: newStatus });
      
      // Update the Crop's status to 'Sold' so it disappears from Marketplace
      if (newStatus === 'Accepted' && cropId) {
        await axios.put(`/api/crops/${cropId}`, { status: 'Sold' });
        toast.success('Offer Accepted');
      } else if (newStatus === 'Rejected') {
        toast.warning('Offer Rejected');
      }

      // Update the local UI state
      setBids(bids.map(bid => bid._id === id ? { ...bid, status: newStatus } : bid));
      
    } catch (error) {
      console.error(`Failed to mark bid as ${newStatus}:`, error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteRejectedBid = async (bidId) => {
    const confirmDelete = await confirmDialog({
      title: 'Delete Rejected Bid',
      message: 'Delete this rejected bid?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    });
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`/api/bids/${bidId}`);
      setBids(bids.filter((bid) => bid._id !== bidId));
      alert('Rejected bid deleted successfully.');
    } catch (error) {
      console.error('Failed to delete rejected bid:', error);
      alert('Failed to delete rejected bid. Please try again.');
    }
  };

  const downloadReceipt = (bid) => {
    const doc = new jsPDF();
    const totalAmount = bid.quantity * bid.bid_amount;
    
    doc.setFontSize(24);
    doc.setTextColor(46, 125, 50); 
    doc.text("AgriConnect", 105, 20, null, null, "center");
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Payment Receipt (Seller Copy)", 105, 30, null, null, "center");
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Receipt ID: TXN-${Math.floor(Math.random() * 1000000)}`, 20, 50);
    doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 20, 58);
    doc.text(`Received From: ${bid.buyer_name} (Buyer)`, 20, 66);
    doc.text(`Paid To: ${userData?.name || 'Farmer'}`, 20, 74); 
    
    doc.setFillColor(232, 245, 233); 
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

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Farmer';

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading incoming bids...</div>;

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/farmer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/farmer/crops" className="nav-link">My Crops</Link>
          <Link to="/farmer/bids" className="nav-link" style={{ color: '#2e7d32' }}>Bids & Offers</Link>
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
                    <div className="bid-detail"><span className="detail-label">Buyer:</span><span className="detail-value" style={{fontWeight: 'bold', color: '#1565c0'}}>{bid.buyer_name}</span></div>
                    <div className="bid-detail"><span className="detail-label">Quantity:</span><span className="detail-value">{bid.quantity} Qtl</span></div>
                    <div className="bid-detail"><span className="detail-label">Date:</span><span className="detail-value">{bid.date}</span></div>
                    <div className="bid-detail amount"><span className="detail-label">Offer Rate:</span><span className="detail-value price">₹{bid.bid_amount} / Qtl</span></div>
                  </div>

                  {bid.status === 'Pending' && (
                    <div className="bid-card-actions">
                      {/* PASSED bid.cropId TO THE FUNCTION */}
                      <button className="btn-accept" onClick={() => handleStatusUpdate(bid._id, 'Accepted', bid.cropId)}>Accept Offer</button>
                      <button className="btn-reject" onClick={() => handleStatusUpdate(bid._id, 'Rejected', bid.cropId)}>Reject</button>
                    </div>
                  )}

                  {bid.status === 'Accepted' && (
                    <div style={{ textAlign: 'center', padding: '0.8rem', backgroundColor: '#f5f5f5', color: '#666', borderRadius: '4px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                      ⏳ Waiting for Buyer Payment
                    </div>
                  )}

                  {bid.status === 'Paid' && (
                    <div className="bid-card-actions">
                      <button className="btn-secondary" style={{ width: '100%', borderColor: '#1565c0', color: '#1565c0' }} onClick={() => downloadReceipt(bid)}>
                        📄 Download Seller Receipt
                      </button>
                    </div>
                  )}

                  {bid.status === 'Rejected' && (
                    <div className="bid-card-actions">
                      <button
                        className="btn-secondary"
                        style={{ width: '100%', borderColor: '#d32f2f', color: '#d32f2f' }}
                        onClick={() => handleDeleteRejectedBid(bid._id)}
                      >
                        Delete Rejected Offer
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-bids"><p>You have no incoming bids right now.</p></div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: 'auto' }}>
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BidsOffers;