import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Public/LandingPage';
import Login from './pages/Public/Login';
import Register from './pages/Public/Register';
import FarmerDashboard from './pages/Farmer/FarmerDashboard';
import MyCrops from './pages/Farmer/Mycrops';
import AddEditCrop from './pages/Farmer/AddEditCrop';
import BidsOffers from './pages/Farmer/BidsOffers';
import FarmerStorage from './pages/Farmer/FarmerStorage';
import FarmerProfile from './pages/Farmer/FarmerProfile';
import FarmerOverview from './pages/Farmer/FarmerOverview';
import BuyerDashboard from './pages/Buyer/BuyerDashboard';
import BuyerMarketPlace from './pages/Buyer/BuyerMarketPlace';
import BuyerBids from './pages/Buyer/BuyerBids';
import BuyerProfile from './pages/Buyer/BuyerProfile';
import BuyerOverview from './pages/Buyer/BuyerOverview';
import ColdStorageOwnerDashboard from './pages/ColdStorageOwner/ColdStorageOwnerDashboard';
import MyFacilities from './pages/ColdStorageOwner/MyFacilities';
import FarmerRequests from './pages/ColdStorageOwner/FarmerRequests';
import ColdStorageProfile from './pages/ColdStorageOwner/ColdStorageOwnerProfile';
import ColdStorageOverview from './pages/ColdStorageOwner/ColdStorageOwnerOverview';
import GlobalToast from './components/GlobalToast';
import GlobalConfirm from './components/GlobalConfirm';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/crops" element={<MyCrops />} />
        <Route path="/farmer/crops/add" element={<AddEditCrop />} />
        <Route path="/farmer/crops/edit/:id" element={<AddEditCrop />} />
        <Route path="/farmer/bids" element={<BidsOffers />} />
        <Route path="/farmer/storage" element={<FarmerStorage />} />
        <Route path="/farmer/profile" element={<FarmerProfile />} />
        <Route path="/farmer/overview" element={<FarmerOverview />} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/marketplace" element={<BuyerMarketPlace />} />
        <Route path="/buyer/bids" element={<BuyerBids />} />
        <Route path="/buyer/profile" element={<BuyerProfile />} />
        <Route path="/buyer/overview" element={<BuyerOverview />} />
        <Route path="/storage/dashboard" element={<ColdStorageOwnerDashboard />} />
        <Route path="/storage/capacity" element={<MyFacilities />} />
        <Route path="/storage/requests" element={<FarmerRequests />} />
        <Route path="/storage/profile" element={<ColdStorageProfile />} />
        <Route path="/storage/overview" element={<ColdStorageOverview />} />
      </Routes>
      <GlobalToast />
      <GlobalConfirm />
    </>
  );
}

export default App;