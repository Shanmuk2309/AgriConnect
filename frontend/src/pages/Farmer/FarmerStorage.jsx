import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf"; 
import '../Public/LandingPage.css'; 
import './Dashboard.css';     
import './FarmerStorage.css'; 

const FarmerStorage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // --- Modal and Booking State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStorage, setSelectedStorage] = useState(null);
  
  const [bookingData, setBookingData] = useState({
    cropName: '',
    weight: '',
    fromDate: '' 
  });

  // Mock data for available storages
  const [storages, setStorages] = useState([
    { _id: '1', name: 'Wisdom Cold Storage', location: 'Kakinada, Andhra Pradesh', available_capacity: 500, price_per_ton: 1500 },
    { _id: '2', name: 'Kisan Fresh Vault', location: 'Rajahmundry, Andhra Pradesh', available_capacity: 120, price_per_ton: 1400 },
    { _id: '3', name: 'AgriSafe Storage', location: 'Visakhapatnam, Andhra Pradesh', available_capacity: 0, price_per_ton: 1600 }
  ]);

  // --- NEW: Mock data for the Farmer's active booking requests ---
  const [myBookings, setMyBookings] = useState([
    { 
      id: 'REQ-999', 
      facilityName: 'Kisan Fresh Vault', 
      location: 'Rajahmundry, Andhra Pradesh', 
      cropName: 'Apples', 
      weight: 10, 
      fromDate: '2026-03-20', 
      price_per_ton: 1400, 
      status: 'Approved' 
    }
  ]);

  const handleLogout = () => navigate('/login');

  const openBookingModal = (storage) => {
    setSelectedStorage(storage);
    setBookingData({ cropName: '', weight: '', fromDate: '' });
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedStorage(null);
  };

  const handleBookingChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const bookedWeight = Number(bookingData.weight);

    if (bookedWeight > selectedStorage.available_capacity) {
      alert(`Error: You cannot book more than the available ${selectedStorage.available_capacity} Tons.`);
      return;
    }

    // Create the new booking record for the table
    const newBooking = {
      id: 'REQ-' + Math.floor(Math.random() * 100000),
      facilityName: selectedStorage.name,
      location: selectedStorage.location,
      cropName: bookingData.cropName,
      weight: bookedWeight,
      fromDate: bookingData.fromDate,
      price_per_ton: selectedStorage.price_per_ton,
      status: 'Pending'
    };

    // Add it to the table
    setMyBookings([...myBookings, newBooking]);

    // Deduct the capacity from the storage grid
    const updatedStorages = storages.map(storage => {
      if (storage._id === selectedStorage._id) {
        return { ...storage, available_capacity: storage.available_capacity - bookedWeight };
      }
      return storage;
    });
    setStorages(updatedStorages);

    closeBookingModal();
    alert(`Request sent! You can track your booking status in the table below.`);
  };

  // --- NEW: Simulate Owner Approval ---
  const simulateApproval = (bookingId) => {
    const updatedBookings = myBookings.map(b => 
      b.id === bookingId ? { ...b, status: 'Approved' } : b
    );
    setMyBookings(updatedBookings);
  };

  // --- UPDATED: PDF Generation (Now takes a booking object from the table) ---
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
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Booking ID: ${booking.id}`, 20, 45);
    doc.text(`Facility: ${booking.facilityName}`, 20, 53);
    doc.text(`Location: ${booking.location}`, 20, 61);
    doc.text(`Storage Start Date: ${booking.fromDate}`, 20, 69);
    
    doc.setFillColor(232, 245, 233); 
    doc.rect(20, 80, 170, 10, 'F');
    doc.setFont("helvetica", "bold");
    doc.text("Crop", 25, 87);
    doc.text("Weight", 80, 87);
    doc.text("Rate / Month", 120, 87);
    doc.text("Est. Monthly Cost", 160, 87);
    
    doc.setFont("helvetica", "normal");
    doc.text(`${booking.cropName}`, 25, 100);
    doc.text(`${booking.weight} Tons`, 80, 100);
    doc.text(`Rs. ${booking.price_per_ton}`, 120, 100);
    doc.text(`Rs. ${totalCost.toLocaleString('en-IN')}`, 160, 100);
    
    doc.setLineWidth(0.5);
    doc.line(20, 110, 190, 110);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Please present this receipt at the facility gate.", 105, 140, null, null, "center");

    doc.save(`Storage_Receipt_${booking.facilityName}.pdf`);
  };

  const filteredStorages = storages.filter(storage => 
    storage.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    storage.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="landing-container">
      {/* --- Navigation Bar --- */}
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
            <button className="profile-btn">Ramesh ▼</button>
            <div className="dropdown-content">
              <Link to="/farmer/profile">My Profile</Link>
              <Link to="/farmer/overview">Overview Dashboard</Link>
              <button onClick={handleLogout} className="logout-btn">Log Out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Content Area --- */}
      <main className="storage-main">
        <div className="storage-container" style={{ maxWidth: '1200px' }}>
          
          {/* Top Section: Search & Grid */}
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
                      <p className="location-text">{storage.location}</p>
                    </div>
                  </div>
                  
                  <div className="storage-card-body">
                    <div className="storage-detail">
                      <span className="detail-label">Available:</span>
                      <span className={`detail-value ${storage.available_capacity === 0 ? 'text-danger' : ''}`}>
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
                      className={`btn-book ${storage.available_capacity === 0 ? 'disabled' : ''}`}
                      onClick={() => openBookingModal(storage)}
                      disabled={storage.available_capacity === 0}
                    >
                      {storage.available_capacity === 0 ? 'Currently Full' : 'Request Space'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results"><p>No storage facilities found.</p></div>
            )}
          </div>

          {/* --- NEW: Bottom Section: Status Tracking Table --- */}
          <div style={{ marginTop: '4rem', backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#1b5e20', marginBottom: '1.5rem', borderBottom: '2px solid #e8f5e9', paddingBottom: '0.8rem' }}>
              My Storage Requests
            </h3>
            
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
                      <tr key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#1565c0' }}>{booking.facilityName}</td>
                        <td style={{ padding: '1rem' }}>{booking.cropName}</td>
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>{booking.weight}</td>
                        <td style={{ padding: '1rem', color: '#666' }}>{booking.fromDate}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                            backgroundColor: booking.status === 'Pending' ? '#fff3e0' : '#e3f2fd',
                            color: booking.status === 'Pending' ? '#e65100' : '#1565c0'
                          }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {booking.status === 'Pending' ? (
                            <button 
                              onClick={() => simulateApproval(booking.id)}
                              style={{ padding: '0.5rem 1rem', border: '1px dashed #ccc', background: '#f9f9f9', borderRadius: '4px', cursor: 'pointer', color: '#666', fontSize: '0.85rem' }}
                            >
                              [Dev: Simulate Approve]
                            </button>
                          ) : (
                            <button 
                              onClick={() => generateReceipt(booking)}
                              style={{ padding: '0.5rem 1rem', border: 'none', background: '#1e88e5', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                            >
                              📄 Download Receipt
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#888', fontStyle: 'italic' }}>
                        You have not requested any storage space yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* --- Booking Form Modal --- */}
      {isModalOpen && selectedStorage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Storage Space</h3>
              <button className="btn-close" onClick={closeBookingModal}>&times;</button>
            </div>
            
            <p className="modal-subtitle">Requesting at <strong>{selectedStorage.name}</strong></p>
            
            <form onSubmit={handleBookingSubmit} className="modal-form">
              <div className="form-group">
                <label>Crop Name</label>
                <input type="text" name="cropName" value={bookingData.cropName} onChange={handleBookingChange} placeholder="e.g., Potatoes" required />
              </div>
              
              <div className="form-group">
                <label>Weight to Store (Tons)</label>
                <input type="number" name="weight" value={bookingData.weight} onChange={handleBookingChange} placeholder="e.g., 5" min="1" max={selectedStorage.available_capacity} required />
                <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>Max available: {selectedStorage.available_capacity} Tons</small>
              </div>

              <div className="form-group">
                <label>Start Date (From Date)</label>
                <input 
                  type="date" 
                  name="fromDate" 
                  value={bookingData.fromDate} 
                  onChange={handleBookingChange} 
                  required 
                  min={new Date().toISOString().split('T')[0]} 
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeBookingModal}>Cancel</button>
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