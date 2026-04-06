import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf"; 
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css'; 
import './StorageRequests.css'; 

const FarmerRequests = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [userData, setUserData] = useState(null);
  
  // Real dynamic requests from DB
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    const fetchUserAndRequests = async () => {
      try {
        const response = await axios.get(`/api/cs_owners/${userId}`);
        setUserData(response.data);

        // Fetch bookings assigned to this CS Owner
        const bookingsRes = await axios.get(`/api/bookings?cs_ownerId=${userId}`);
        setRequests(bookingsRes.data);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndRequests();
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAction = async (id, action) => {
    try {
      // Update in database
      await axios.put(`/api/bookings/${id}`, { status: action });
      
      // Update UI immediately
      setRequests(requests.map(req => 
        req._id === id ? { ...req, status: action } : req
      ));

      if (action === 'Approved') alert("Space approved! The farmer will receive an acknowledgment receipt.");
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update request.");
    }
  };

  const downloadAcknowledgment = (req) => {
    const doc = new jsPDF();
    const totalCost = req.weight * req.price_per_ton;
    
    doc.setFontSize(22);
    doc.setTextColor(27, 94, 32); 
    doc.text("AgriConnect", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Storage Space Acknowledgment", 105, 30, null, null, "center");
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Acknowledgment ID: ${req._id}`, 20, 45);
    doc.text(`Approved By: ${userData?.business_name || userData?.name}`, 20, 53);
    doc.text(`Facility: ${req.facility_name}`, 20, 61);
    doc.text(`Farmer Name: ${req.farmer_name}`, 20, 69);
    doc.text(`Storage Start Date: ${req.from_date}`, 20, 77);
    
    doc.setFillColor(232, 245, 233); 
    doc.rect(20, 85, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Crop", 25, 92);
    doc.text("Weight", 80, 92);
    doc.text("Rate / Month", 120, 92);
    doc.text("Est. Monthly Cost", 160, 92);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${req.crop}`, 25, 105);
    doc.text(`${req.weight} Tons`, 80, 105);
    doc.text(`Rs. ${req.price_per_ton}`, 120, 105);
    doc.text(`Rs. ${totalCost.toLocaleString('en-IN')}`, 160, 105);
    
    doc.setLineWidth(0.5);
    doc.line(20, 115, 190, 115);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Please ensure goods are transported by the start date.", 105, 140, null, null, "center");

    doc.save(`Storage_Ack_${req.farmer_name}.pdf`);
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  const displayName = userData?.name || 'Owner';

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/storage/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/storage/capacity" className="nav-link">My Facilities</Link>
          <Link to="/storage/requests" className="nav-link" style={{ color: '#2e7d32' }}>Farmer Requests</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn">{displayName} ▼</button>
            <div className="dropdown-content">
              <Link to="/storage/profile">My Owner Profile</Link>
              <Link to="/storage/overview">Business Overview</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="requests-main">
        <div className="requests-container">
          <div className="requests-header">
            <h2>Farmer Storage Requests</h2>
            <p>Review and manage incoming booking requests for your facilities.</p>
          </div>

          <div className="requests-grid">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div key={req._id} className={`request-card ${req.status.toLowerCase()}`}>
                  <div className="request-card-header">
                    <div>
                      <h4>{req.farmer_name}</h4>
                      <p className="facility-requested">For: {req.facility_name}</p>
                    </div>
                    <span className={`badge-${req.status.toLowerCase()}`}>{req.status}</span>
                  </div>
                  
                  <div className="request-card-body">
                    <div className="request-detail">
                      <span className="detail-label">Requested On:</span>
                      <span className="detail-value">{req.date}</span>
                    </div>
                    <div className="request-detail">
                      <span className="detail-label">Storage Start:</span>
                      <span className="detail-value" style={{ color: '#1565c0', fontWeight: 'bold' }}>{req.from_date}</span>
                    </div>
                    <div className="request-detail highlight-row">
                      <span className="detail-label">Crop & Weight:</span>
                      <span className="detail-value crop">{req.crop}</span>
                      <span className="detail-value weight">{req.weight} Tons</span>
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="request-card-actions">
                      <button className="btn-approve" onClick={() => handleAction(req._id, 'Approved')}>Approve Space</button>
                      <button className="btn-decline" onClick={() => handleAction(req._id, 'Declined')}>Decline</button>
                    </div>
                  )}

                  {req.status === 'Approved' && (
                    <div className="request-card-actions">
                      <button 
                        className="btn-secondary" 
                        style={{ width: '100%', borderColor: '#1565c0', color: '#1565c0' }} 
                        onClick={() => downloadAcknowledgment(req)}
                      >
                        📄 Download Acknowledgment
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-requests"><p>No pending requests right now.</p></div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer" style={{ marginTop: 'auto' }}><p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p></footer>
    </div>
  );
};

export default FarmerRequests;