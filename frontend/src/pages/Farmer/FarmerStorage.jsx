import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from "jspdf"; 
import '../Public/LandingPage.css'; 
import './Dashboard.css';     
import './FarmerStorage.css'; 

const FarmerStorage = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  
  const [userData, setUserData] = useState(null);
  const [storages, setStorages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [bookingData, setBookingData] = useState({ cropName: '', weight: '', fromDate: '' });
  
  // Real dynamic bookings from DB
  const [myBookings, setMyBookings] = useState([]);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const userRes = await axios.get(`/api/farmers/${userId}`);
        setUserData(userRes.data);

        // Fetch storages
        const storagesRes = await axios.get('/api/cold-storages');
        setStorages(storagesRes.data);

        // Fetch my real bookings from the new API
        const bookingsRes = await axios.get(`/api/bookings?farmerId=${userId}`);
        setMyBookings(bookingsRes.data);

      } catch (error) {
        console.error("Error fetching data:", error);
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

  const openBookingModal = (storage) => {
    setSelectedStorage(storage);
    setBookingData({ cropName: '', weight: '', fromDate: '' });
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const bookedWeight = Number(bookingData.weight);

    if (bookedWeight > selectedStorage.available_capacity) {
      alert(`Error: You cannot book more than the available ${selectedStorage.available_capacity} Tons.`);
      return;
    }

    try {
      // 1. Create the Payload for the database
      const bookingPayload = {
        farmerId: userId,
        farmer_name: userData.name,
        cs_ownerId: selectedStorage.cs_ownerId,
        facility_id: selectedStorage._id,
        facility_name: selectedStorage.name,
        location: selectedStorage.location,
        crop: bookingData.cropName,
        weight: bookedWeight,
        from_date: bookingData.fromDate,
        price_per_ton: selectedStorage.price_per_ton,
        status: 'Pending'
      };

      // 2. Actually send it to the new Booking API
      const res = await axios.post('/api/bookings/add', bookingPayload);

      // 3. Update the local UI immediately
      setMyBookings([...myBookings, { ...bookingPayload, _id: res.data.bookingId }]);

      // 4. Update the Cold Storage Capacity dynamically in the Database
      const newCapacity = selectedStorage.available_capacity - bookedWeight;
      await axios.put(`/api/cold-storages/${selectedStorage._id}`, { available_capacity: newCapacity });

      setStorages(storages.map(s => 
        s._id === selectedStorage._id ? { ...s, available_capacity: newCapacity } : s
      ));

      setIsModalOpen(false);
      alert(`Request sent! You can track your booking status in the table below.`);
    } catch (error) {
      console.error("Failed to book storage:", error);
      alert("Booking failed. Please try again.");
    }
  };

  const generateReceipt = (booking) => {
    const doc = new jsPDF();
    const totalCost = booking.weight * booking.price_per_ton;

    doc.setFontSize(22);
    doc.setTextColor(27, 94, 32); 
    doc.text("AgriConnect", 105, 20, null, null, "center");
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text("Cold Storage Allocation Receipt", 105, 30, null, null, "center");
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Booking ID: ${booking._id}`, 20, 45);
    doc.text(`Facility: ${booking.facility_name}`, 20, 53);
    doc.text(`Location: ${booking.location}`, 20, 61);
    doc.text(`Storage Start Date: ${booking.from_date}`, 20, 69);
    
    doc.setFillColor(232, 245, 233); 
    doc.rect(20, 80, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Crop", 25, 87);
    doc.text("Weight", 80, 87);
    doc.text("Rate / Month", 120, 87);
    doc.text("Est. Monthly Cost", 160, 87);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${booking.crop}`, 25, 100);
    doc.text(`${booking.weight} Tons`, 80, 100);
    doc.text(`Rs. ${booking.price_per_ton}`, 120, 100);
    doc.text(`Rs. ${totalCost.toLocaleString('en-IN')}`, 160, 100);
    
    doc.setLineWidth(0.5);
    doc.line(20, 110, 190, 110);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Please present this receipt at the facility gate.", 105, 140, null, null, "center");

    doc.save(`Storage_Receipt_${booking.facility_name}.pdf`);
  };

  const filteredStorages = storages.filter(storage => 
    storage.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    storage.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const firstName = userData?.name ? userData.name.split(' ')[0] : 'Farmer';

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading storage facilities...</div>;

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/farmer/dashboard" style={{ textDecoration: 'none' }}><h1>AgriConnect</h1></Link>
        </div>
        <div className="navbar-links">
          <Link to="/farmer/crops" className="nav-link">My Crops</Link>
          <Link to="/farmer/bids" className="nav-link">Bids & Offers</Link>
          <Link to="/farmer/storage" className="nav-link" style={{ color: '#2e7d32' }}>Cold Storages</Link>
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

      <main className="storage-main">
        <div className="storage-container" style={{ maxWidth: '1200px' }}>
          
          <div className="storage-header">
            <div>
              <h2>Find Cold Storage</h2>
              <p>Locate nearby facilities to extend the shelf life of your harvest.</p>
            </div>
            <div className="search-box">
              <input type="text" placeholder="Search by name or city..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="storage-grid">
            {filteredStorages.length > 0 ? (
              filteredStorages.map((storage) => (
                <div key={storage._id} className="storage-card">
                  <div className="storage-card-header">
                    <div className="storage-icon">❄️</div>
                    <div>
                      <h4>{storage.name}</h4>
                      <p className="location-text">{storage.location || "Multiple Locations"}</p>
                    </div>
                  </div>
                  
                  <div className="storage-card-body">
                    <div className="storage-detail">
                      <span className="detail-label">Available:</span>
                      <span className={`detail-value ${storage.available_capacity <= 0 ? 'text-danger' : ''}`}>
                        {storage.available_capacity > 0 ? `${storage.available_capacity} Tons` : 'Full'}
                      </span>
                    </div>
                    <div className="storage-detail">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value text-success">₹{storage.price_per_ton} / Ton</span>
                    </div>
                  </div>

                  <div className="storage-card-actions">
                    <button 
                      className={`btn-book ${storage.available_capacity <= 0 ? 'disabled' : ''}`}
                      onClick={() => openBookingModal(storage)}
                      disabled={storage.available_capacity <= 0}
                    >
                      {storage.available_capacity <= 0 ? 'Currently Full' : 'Request Space'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results"><p>No storage facilities found matching your search.</p></div>
            )}
          </div>

          {/* Status Tracking Table */}
          <div style={{ marginTop: '4rem', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '1.5rem', borderBottom: '2px solid #e8f5e9', paddingBottom: '0.8rem' }}>My Storage Requests</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', color: '#444' }}>
                    <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Facility</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Crop</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Weight (Tons)</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Start Date</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Status</th>
                    <th style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.length > 0 ? (
                    myBookings.map((booking) => (
                      <tr key={booking._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1565c0' }}>{booking.facility_name}</td>
                        <td style={{ padding: '1rem' }}>{booking.crop}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{booking.weight}</td>
                        <td style={{ padding: '1rem', color: '#666' }}>{booking.from_date}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`status-badge ${(booking.status || 'Pending').toLowerCase()}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {booking.status === 'Pending' ? (
                            <span style={{ color: '#666', fontStyle: 'italic', fontSize: '0.85rem' }}>Waiting for owner...</span>
                          ) : booking.status === 'Approved' ? (
                            <button onClick={() => generateReceipt(booking)} style={{ padding: '0.5rem 1rem', border: 'none', background: '#1e88e5', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>📄 Download Receipt</button>
                          ) : (
                             <span style={{ color: '#d32f2f', fontSize: '0.85rem' }}>Declined</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>You have not requested any storage space yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {isModalOpen && selectedStorage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Storage Space</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <p className="modal-subtitle">Requesting at <strong>{selectedStorage.name}</strong></p>
            <form onSubmit={handleBookingSubmit} className="modal-form">
              <div className="form-group">
                <label>Crop Name</label>
                <input type="text" name="cropName" value={bookingData.cropName} onChange={(e) => setBookingData({...bookingData, cropName: e.target.value})} placeholder="e.g., Potatoes" required />
              </div>
              <div className="form-group">
                <label>Weight to Store (Tons)</label>
                <input type="number" name="weight" value={bookingData.weight} onChange={(e) => setBookingData({...bookingData, weight: e.target.value})} placeholder="e.g., 5" min="1" max={selectedStorage.available_capacity} required />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Max available: {selectedStorage.available_capacity} Tons</small>
              </div>
              <div className="form-group">
                <label>Start Date (From Date)</label>
                <input type="date" name="fromDate" value={bookingData.fromDate} onChange={(e) => setBookingData({...bookingData, fromDate: e.target.value})} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Send Request</button>
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

export default FarmerStorage;