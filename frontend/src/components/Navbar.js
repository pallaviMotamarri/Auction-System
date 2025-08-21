import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { User, LogOut, Menu, X, Gavel, Search, Plus, Hammer, UserCircle, Home, MessageCircle, Crown } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('participation'); // default to participation

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsSideMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const closeSideMenu = () => {
    setIsSideMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchType === 'participation') {
        navigate(`/?participationCode=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      }
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <Gavel className="logo-icon" />
          <span>Auction Hub</span>
        </Link>

        {/* Search Bar - Only visible when logged in */}
        {/* {isAuthenticated && (
          <form className="navbar-search" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder={searchType === 'participation' ? "Enter Participation ID..." : "Search auctions..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="navbar-search-input"
              />
              <select value={searchType} onChange={e => setSearchType(e.target.value)} className="navbar-search-type">
                <option value="participation">Participation ID</option>
                <option value="title">Title</option>
              </select>
            </div>
          </form>
        )} */}

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/" className="navbar-link" onClick={closeMenu}>
                <Home className="nav-icon" />
                Home
              </Link>
              <Link to="/create-auction" className="navbar-link" onClick={closeMenu}>
                <Plus className="nav-icon" />
                Create Auction
              </Link>
              <Link to="/bid" className="navbar-link" onClick={closeMenu}>
                <Hammer className="nav-icon" />
                Bid
              </Link>
              <Link to="/profile" className="navbar-link" onClick={closeMenu}>
                <UserCircle className="nav-icon" />
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="navbar-link" onClick={closeMenu}>
                Home
              </Link>
              <Link to="/about" className="navbar-link" onClick={closeMenu}>
                About
              </Link>
              <Link to="/contact" className="navbar-link" onClick={closeMenu}>
                Contact
              </Link>
            </>
          )}
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="menu-toggle-btn" onClick={toggleSideMenu}>
                <Menu className="menu-icon" />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="register-btn" onClick={closeMenu}>
                Register
              </Link>
            </div>
          )}
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Side Menu - Only for authenticated users */}
      {isAuthenticated && (
        <>
          <div className={`side-menu-overlay ${isSideMenuOpen ? 'active' : ''}`} onClick={closeSideMenu}></div>
          <div className={`side-menu ${isSideMenuOpen ? 'active' : ''}`}>
            <div className="side-menu-header">
              <div className="welcome-message">
                <User className="welcome-icon" />
                <div>
                  <h3>Welcome back!</h3>
                  <p>{user?.fullName}</p>
                </div>
              </div>
              <button className="close-side-menu" onClick={closeSideMenu}>
                <X />
              </button>
            </div>
            
            <div className="side-menu-content">
              <nav className="side-menu-nav">
                <Link to="/" className="side-menu-link" onClick={closeSideMenu}>
                  <Home className="side-menu-icon" />
                  Home
                </Link>
                {/* <Link to="/create-auction" className="side-menu-link" onClick={closeSideMenu}>
                  <Plus className="side-menu-icon" />
                  Create Auction
                </Link>
                <Link to="/bid" className="side-menu-link" onClick={closeSideMenu}>
                  <Hammer className="side-menu-icon" />
                  Bid
                </Link> */}
                <Link to="/profile" className="side-menu-link" onClick={closeSideMenu}>
                  <UserCircle className="side-menu-icon" />
                  Profile
                </Link>
                  <Link to="/my-auctions" className="side-menu-link" onClick={closeSideMenu}>
                    <Gavel className="side-menu-icon" />
                    My Auctions
                  </Link>
                  <Link to="/my-bids" className="side-menu-link" onClick={closeSideMenu}>
                    <Search className="side-menu-icon" />
                    My Bids
                  </Link>
                  <Link to="/my-contacts" className="side-menu-link" onClick={closeSideMenu}>
                    <MessageCircle className="side-menu-icon" />
                    My Contacts
                  </Link>
                    <Link to="/crown-score" className="side-menu-link" onClick={closeSideMenu}>
                      <Crown className="side-menu-icon" />
                      Crown Score
                    </Link>
                  
              </nav>
              
              <button className="side-menu-logout" onClick={handleLogout}>
                <LogOut className="side-menu-icon" />
                Logout
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            {isAuthenticated ? (
              <>
                <Link to="/" className="mobile-link" onClick={closeMenu}>
                  <Home className="mobile-icon" />
                  Home
                </Link>
                <Link to="/create-auction" className="mobile-link" onClick={closeMenu}>
                  <Plus className="mobile-icon" />
                  Create Auction
                </Link>
                <Link to="/bid" className="mobile-link" onClick={closeMenu}>
                  <Hammer className="mobile-icon" />
                  Bid
                </Link>
                <Link to="/profile" className="mobile-link" onClick={closeMenu}>
                  <UserCircle className="mobile-icon" />
                  Profile
                </Link>
                  <Link to="/my-contacts" className="navbar-link" onClick={closeMenu}>
                    <MessageCircle className="nav-icon" />
                    My Contacts
                  </Link>
                  <Link to="/crown-score" className="navbar-link" onClick={closeMenu}>
                    <Crown className="nav-icon" />
                    Crown Score
                  </Link>
                <Link to="/contact" className="mobile-link" onClick={closeMenu}>
                  <MessageCircle className="mobile-icon" />
                  Contact
                </Link>
                <div className="mobile-user-info">
                  <User className="user-icon" />
                  <span>{user?.fullName}</span>
                </div>
                <button className="mobile-logout-btn" onClick={handleLogout}>
                  <LogOut className="logout-icon" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="mobile-link" onClick={closeMenu}>
                  Home
                </Link>
                <Link to="/about" className="mobile-link" onClick={closeMenu}>
                  About
                </Link>
                <Link to="/contact" className="mobile-link" onClick={closeMenu}>
                  Contact
                </Link>
                <Link to="/login" className="mobile-auth-btn login" onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className="mobile-auth-btn register" onClick={closeMenu}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
