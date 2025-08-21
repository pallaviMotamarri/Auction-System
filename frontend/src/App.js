import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminAuthPage from './admin/AdminAuthPage.jsx';
import AdminForgotPassword from './admin/AdminForgotPassword.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import AdminRegister from './admin/AdminRegister.jsx';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AuctionDetails from './pages/AuctionDetails';
import AuctionBidPage from './pages/AuctionBidPage.jsx';
import BidderPage from './pages/BidderPage.jsx';
import EditAuction from './pages/EditAuction.jsx';
import AuctionEndedDetails from './pages/AuctionEndedDetails.jsx';
import CreateAuction from './pages/CreateAuction';
import Bid from './pages/Bid';
import Profile from './pages/Profile';
import MyAuctions from './pages/MyAuctions.jsx';
import DeletedAuctions from './pages/DeletedAuctions.jsx';
import MyBids from './pages/MyBids.jsx';
import MyContacts from './pages/MyContacts.jsx';
import CrownScore from './pages/CrownScore.jsx';
import Terms from './pages/Terms';

// Utils
import { AuthProvider } from './utils/AuthContext';

import './styles/App.css';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin/');
  return (
    <div className="App">
      {!isAdminRoute && <Navbar />}
      {isAdminRoute ? (
        <main className="admin-main-content">
          <Routes>
            <Route path="/admin/auth" element={<AdminAuthPage />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/register" element={<AdminRegister />} />
          </Routes>
        </main>
      ) : (
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auction/:id" element={<AuctionDetails />} />
            <Route path="/auction/:id/bid" element={<AuctionBidPage />} />
            <Route path="/auction/:id/auctionbid" element={<AuctionBidPage />} />
            <Route path="/auction/:id/bidder" element={<BidderPage />} />
            <Route path="/create-auction" element={<CreateAuction />} />
            <Route path="/bid" element={<Bid />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-auctions" element={<MyAuctions />} />
            <Route path="/my-bids" element={<MyBids />} />
            <Route path="/my-contacts" element={<MyContacts />} />
            <Route path="/crown-score" element={<CrownScore />} />
            <Route path="/dashboard/edit-auction/:id" element={<EditAuction />} />
            <Route path="/dashboard/auction-ended-details/:id" element={<AuctionEndedDetails />} />
            <Route path="/dashboard/deleted-auctions" element={<DeletedAuctions />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
      )}
      {!isAdminRoute && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
