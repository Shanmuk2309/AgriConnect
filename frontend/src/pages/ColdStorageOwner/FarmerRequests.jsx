import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css'; 
import './StorageRequests.css'; // We'll create this below

const FarmerRequests = () => {
  const navigate = useNavigate();

  // Mock data of incoming bookings from Farmers
  const [requests, setRequests] = useState([
    { _id: 'r1', farmer_name: 'Ramesh Kumar', crop: 'Potatoes', weight: 15, facility_name: 'AgriSafe Storage Main', status: 'Pending', date: '2026-03-14' },
    { _id: 'r2', farmer_name: 'Srinivas', crop: 'Apples', weight: 5, facility_name: 'AgriSafe Storage Main', status: 'Approved', date: '2026-03-13' },
    { _id: 'r3', farmer_name: 'Venkatesh', crop: 'Onions', weight: 40, facility_name: 'AgriSafe Storage North', status: 'Declined', date: '2026-03-12' }
  ]);

  const handleLogout = () => navigate('/login');

  const handleAction = (id, newStatus) => {
    // Later: axios.put(`/api/storage/requests/${id}`, { status: newStatus })
    const updatedRequests = requests.map(req => 
      req._id === id ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
  };

  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand"><Link to="/storage/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link></div>
        <div className="navbar-links">
          <Link to="/storage/capacity" className="nav-link">My Facilities</Link>
          <Link to="/storage/requests" className="nav-link" style={{ color: '#2e7d32' }}>Farmer Requests</Link>
          <div className="nav-divider"></div>
          <div className="profile-menu">
            <button className="profile-btn">Vikram Singh ▼</button>
            <div className="dropdown-content">
              <Link to="/storage/profile">My Owner Profile</Link>
              <Link to="/storage/overview">Business Overview</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="requests-main">
        <div className="requests-container">
          <div className="requests-header">
            <h2>Incoming Booking Requests</h2>
            <p>Review and manage storage space requests from local farmers.</p>
          </div>

          <div className="requests-grid">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div key={req._id} className={`request-card ${req.status.toLowerCase()}`}>
                  <div className="request-card-header">
                    <h4>{req.farmer_name}</h4>
                    <span className={`badge-${req.status.toLowerCase()}`}>{req.status}</span>
                  </div>
                  
                  <div className="request-card-body">
                    <div className="request-detail">
                      <span className="detail-label">Facility:</span>
                      <span className="detail-value text-primary">{req.facility_name}</span>
                    </div>
                    <div className="request-detail">
                      <span className="detail-label">Crop to Store:</span>
                      <span className="detail-value">{req.crop}</span>
                    </div>
                    <div className="request-detail">
                      <span className="detail-label">Date Requested:</span>
                      <span className="detail-value">{req.date}</span>
                    </div>
                    <div className="request-detail highlight">
                      <span className="detail-label">Weight Required:</span>
                      <span className="detail-value weight">{req.weight} Tons</span>
                    </div>
                  </div>

                  {req.status === 'Pending' && (
                    <div className="request-card-actions">
                      <button className="btn-approve" onClick={() => handleAction(req._id, 'Approved')}>Approve Space</button>
                      <button className="btn-decline" onClick={() => handleAction(req._id, 'Declined')}>Decline</button>
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