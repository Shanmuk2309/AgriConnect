import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf"; 
import { confirmDialog } from '../../utils/confirm';
import '../Public/LandingPage.css'; 
import './ColdStorageOwnerDashboard.css'; 
import './StorageRequests.css'; 

const FarmerRequests = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [ownerRes, bookingsRes, farmersRes, storagesRes] = await Promise.all([
          axios.get(`/api/cs_owners/${userId}`),
          axios.get('/api/bookings', { params: { cs_ownerId: userId } }),
          axios.get('/api/farmers'),
          axios.get('/api/cold-storages')
        ]);

        setOwnerData(ownerRes.data);

        const farmersById = (farmersRes.data || []).reduce((acc, farmer) => {
          acc[String(farmer._id)] = farmer;
          return acc;
        }, {});

        const storagesById = (storagesRes.data || []).reduce((acc, storage) => {
          acc[String(storage._id)] = storage;
          return acc;
        }, {});

        const normalizedRequests = (bookingsRes.data || []).map((booking) => {
          const farmer = farmersById[String(booking.farmerId)] || {};
          const storage = storagesById[String(booking.facility_id)] || {};

          return {
            ...booking,
            farmer_name: booking.farmer_name || farmer.name || 'Farmer',
            facility_name: booking.facility_name || storage.name || 'Facility',
            status: booking.status || 'Pending',
            date: booking.date || '-',
            from_date: booking.from_date || '-'
          };
        });

        setRequests(normalizedRequests);
      } catch (fetchError) {
        console.error('Failed to fetch storage requests:', fetchError);
        setError('Failed to load farmer requests. Please refresh and try again.');
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

  const downloadAcknowledgment = (req) => {
    const doc = new jsPDF();
    const totalCost = req.weight * req.price_per_ton;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(21, 101, 192); 
    doc.text("AgriConnect", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Storage Acknowledgment (Facility Copy)", 105, 30, null, null, "center");
    
    // Divider
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // --- UPDATED: Transaction Details (Added Storage Start Date) ---
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Booking ID: CS-REQ-${Math.floor(Math.random() * 100000)}`, 20, 45);
    doc.text(`Facility: ${req.facility_name}`, 20, 53);
    doc.text(`Approval Date: ${new Date().toLocaleDateString()}`, 20, 61);
    doc.text(`Client (Farmer): ${req.farmer_name}`, 20, 69);
    doc.text(`Storage Start Date: ${req.from_date}`, 20, 77); // New Date Line
    
    // Table Header (Pushed down slightly to make room for the new line)
    doc.setFillColor(227, 242, 253); 
    doc.rect(20, 85, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Commodity", 25, 92);
    doc.text("Space Reserved", 80, 92);
    doc.text("Rate / Ton", 125, 92);
    doc.text("Est. Revenue", 160, 92);
    
    // Table Content
    doc.setFont("helvetica", "normal");
    doc.text(`${req.crop}`, 25, 105);
    doc.text(`${req.weight} Tons`, 80, 105);
    doc.text(`Rs. ${req.price_per_ton}`, 125, 105);
    doc.text(`Rs. ${totalCost.toLocaleString('en-IN')}`, 160, 105);
    
    // Total Calculation Line
    doc.setLineWidth(0.5);
    doc.line(20, 115, 190, 115);
    
    doc.setFont("helvetica", "bold");
    doc.text("Est. Monthly Revenue:", 115, 125);
    doc.setTextColor(21, 101, 192); 
    doc.setFontSize(14);
    doc.text(`Rs. ${totalCost.toLocaleString('en-IN')}`, 160, 125);

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Retain this copy for your facility's internal records.", 105, 155, null, null, "center");

    doc.save(`Storage_Ack_${req.facility_name}_${req.farmer_name}.pdf`);
  };

  const deductCapacity = async (facilityId, weight) => {
    try {
      const storageRes = await axios.get(`/api/cold-storages/${facilityId}`);
      const currentCapacity = storageRes.data.available_capacity || 0;
      const newCapacity = currentCapacity - weight;

      if (newCapacity < 0) {
        alert('Insufficient capacity available. Please check facility availability.');
        return false;
      }

      await axios.put(`/api/cold-storages/${facilityId}`, { available_capacity: newCapacity });
      return true;
    } catch (deductError) {
      console.error('Failed to deduct capacity:', deductError);
      alert('Failed to update facility capacity. Please try again.');
      return false;
    }
  };

  const handleAction = async (id, newStatus) => {
    const targetRequest = requests.find((request) => String(request._id) === String(id));
    if (!targetRequest) return;

    try {
      // Handle capacity changes BEFORE updating booking status
      if (newStatus === 'Approved') {
        const capacityDeducted = await deductCapacity(targetRequest.facility_id, targetRequest.weight);
        if (!capacityDeducted) {
          return; // Don't proceed with approval if capacity deduction fails
        }
      }
      // If declining, do NOT restore capacity (it was never reserved)

      // Update booking status after capacity is handled
      await axios.put(`/api/bookings/${id}`, { status: newStatus });

      const updatedRequests = requests.map((request) =>
        String(request._id) === String(id) ? { ...request, status: newStatus } : request
      );
      setRequests(updatedRequests);

      if (newStatus === 'Approved') {
        const approvedRequest = { ...targetRequest, status: 'Approved' };
        downloadAcknowledgment(approvedRequest);
        alert(`Space approved for ${approvedRequest.farmer_name}! Capacity deducted. Your acknowledgment receipt is downloading.`);
      } else if (newStatus === 'Declined') {
        alert(`Request from ${targetRequest.farmer_name} has been declined.`);
      }
    } catch (updateError) {
      console.error('Failed to update booking status:', updateError);
      alert('Failed to update request status. Please try again.');
    }
  };

  const handleDeleteDeclined = async (requestId) => {
    const confirmDelete = await confirmDialog({
      title: 'Delete Request',
      message: 'Delete this declined request?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      tone: 'danger',
    });
    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`/api/bookings/${requestId}`);
      setRequests(requests.filter((request) => String(request._id) !== String(requestId)));
      alert('Declined request deleted successfully.');
    } catch (error) {
      console.error('Failed to delete declined request:', error);
      alert('Failed to delete declined request. Please try again.');
    }
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading booking requests...</div>;
  }

  if (error) {
    return <div style={{ padding: '50px', textAlign: 'center', color: '#d32f2f' }}>{error}</div>;
  }

  const displayName = ownerData?.name || 'Owner';

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
            <button className="profile-btn">{displayName} ▼</button>
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

                    {/* --- NEW: Display Start Date --- */}
                    <div className="request-detail">
                      <span className="detail-label">Start Date (From):</span>
                      <span className="detail-value" style={{ color: '#1565c0', fontWeight: 'bold' }}>{req.from_date}</span>
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

                  {req.status === 'Declined' && (
                    <div className="request-card-actions">
                      <button
                        className="btn-secondary"
                        style={{ width: '100%', borderColor: '#d32f2f', color: '#d32f2f' }}
                        onClick={() => handleDeleteDeclined(req._id)}
                      >
                        Delete Declined Request
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