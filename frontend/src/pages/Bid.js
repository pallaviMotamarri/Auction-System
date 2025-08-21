import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Hash, Clock, Eye, Gavel } from 'lucide-react';
import { toast } from 'react-toastify';
import AuctionCard from '../components/AuctionCard';
import api from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const Bid = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    status: 'live',
    sortBy: 'endingSoon'
  });
  const [joinAuctionId, setJoinAuctionId] = useState('');

  const categories = [
    'All Categories', 'Electronics', 'Fashion', 'Home & Garden', 'Sports', 
    'Collectibles', 'Art', 'Books', 'Music', 'Toys', 'Automotive', 'Other'
  ];

  const statusOptions = [
    { value: 'live', label: 'Live Auctions' },
    { value: 'upcoming', label: 'Upcoming Auctions' },
    { value: 'ending', label: 'Ending Soon' },
    { value: 'all', label: 'All Auctions' }
  ];

  const sortOptions = [
    { value: 'endingSoon', label: 'Ending Soon' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priceHigh', label: 'Highest Price' },
    { value: 'priceLow', label: 'Lowest Price' },
    { value: 'mostBids', label: 'Most Bids' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchAuctions();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    applyFilters();
  }, [auctions, filters]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auctions');
      setAuctions(response.data.auctions || []);
    } catch (error) {
      toast.error('Failed to fetch auctions');
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = auctions.filter(a => a.status !== 'deleted');
    const now = new Date();

    // Filter by category
    if (filters.category && filters.category !== 'All Categories') {
      filtered = filtered.filter(auction => 
        auction.category === filters.category
      );
    }

    // Filter by status
    switch (filters.status) {
      case 'live':
        filtered = filtered.filter(auction => {
          const startDate = new Date(auction.startDate);
          const endDate = new Date(auction.endDate);
          return startDate <= now && endDate > now;
        });
        break;
      case 'upcoming':
        filtered = filtered.filter(auction => {
          const startDate = new Date(auction.startDate);
          return startDate > now;
        });
        break;
      case 'ending':
        filtered = filtered.filter(auction => {
          const endDate = new Date(auction.endDate);
          const hoursLeft = (endDate - now) / (1000 * 60 * 60);
          return hoursLeft <= 24 && hoursLeft > 0;
        });
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }

    // Sort auctions
    switch (filters.sortBy) {
      case 'endingSoon':
        filtered.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'priceHigh':
        filtered.sort((a, b) => (b.currentBid || b.startingPrice) - (a.currentBid || a.startingPrice));
        break;
      case 'priceLow':
        filtered.sort((a, b) => (a.currentBid || a.startingPrice) - (b.currentBid || b.startingPrice));
        break;
      case 'mostBids':
        filtered.sort((a, b) => (b.bids?.length || 0) - (a.bids?.length || 0));
        break;
      default:
        break;
    }

    setFilteredAuctions(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleJoinAuction = () => {
    if (!joinAuctionId.trim()) {
      toast.error('Please enter an auction ID');
      return;
    }

    // Find auction by ID or participation code
    const auction = auctions.find(a => 
      a.auctionId?.toLowerCase() === joinAuctionId.toLowerCase() ||
      a._id === joinAuctionId ||
      a.participationCode === joinAuctionId
    );

    if (auction) {
      navigate(`/auction/${auction._id}`);
    } else {
      toast.error('Auction not found with the provided ID or participation code');
    }
  };

  const getLiveAuctionsCount = () => {
    const now = new Date();
    return auctions.filter(auction => {
      const startDate = new Date(auction.startDate);
      const endDate = new Date(auction.endDate);
      return startDate <= now && endDate > now;
    }).length;
  };

  if (loading) {
    return (
      <div className="bid-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading auctions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bid-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              <Gavel className="page-icon" />
              Live Bidding
            </h1>
            <p className="page-subtitle">
              Join live auctions and place your bids on amazing items
            </p>
          </div>
          <div className="live-stats">
            <div className="stat-item">
              <span className="stat-number">{getLiveAuctionsCount()}</span>
              <span className="stat-label">Live Auctions</span>
            </div>
          </div>
        </div>

        {/* Join Auction Section */}
        <div className="join-auction-section">
          <h2 className="section-title">
            <Hash className="section-icon" />
            Join Auction by ID
          </h2>
          <div className="join-auction-form">
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter auction ID (e.g., AUC-123456)"
                value={joinAuctionId}
                onChange={(e) => setJoinAuctionId(e.target.value)}
                className="auction-id-input"
              />
              <button 
                onClick={handleJoinAuction}
                className="join-btn"
              >
                Join Auction
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="filters-section">
          <div className="filters-header">
            <h2 className="section-title">
              <Filter className="section-icon" />
              Filter Auctions
            </h2>
            <button
              onClick={() => setFilters({ category: '', status: 'live', sortBy: 'endingSoon' })}
              className="reset-filters-btn"
            >
              Reset Filters
            </button>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category === 'All Categories' ? '' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="filter-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Auctions Grid */}
        <div className="auctions-section">
          <div className="section-header">
            <h2 className="section-title">
              {filters.status === 'live' && 'Live Auctions'}
              {filters.status === 'upcoming' && 'Upcoming Auctions'}
              {filters.status === 'ending' && 'Ending Soon'}
              {filters.status === 'all' && 'All Auctions'}
            </h2>
            <div className="results-count">
              {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {filteredAuctions.length > 0 ? (
            <div className="auctions-grid">
              {filteredAuctions.map(auction => (
                <AuctionCard
                  key={auction._id}
                  auction={auction}
                  showStatus={true}
                  showBidButton={true}
                />
              ))}
            </div>
          ) : (
            <div className="no-auctions">
              <div className="no-auctions-content">
                <Search className="no-auctions-icon" />
                <h3>No auctions found</h3>
                <p>
                  {filters.category || filters.status !== 'all' 
                    ? 'Try adjusting your filters to see more auctions.'
                    : 'There are no auctions available at the moment.'}
                </p>
                <button
                  onClick={() => setFilters({ category: '', status: 'all', sortBy: 'newest' })}
                  className="clear-filters-btn"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card">
            <Clock className="action-icon" />
            <h3>Ending Soon</h3>
            <p>Don't miss out on auctions ending in the next 24 hours</p>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'ending', sortBy: 'endingSoon' }))}
              className="action-btn"
            >
              <Eye className="btn-icon" />
              View Ending Soon
            </button>
          </div>

          <div className="action-card">
            <Gavel className="action-icon" />
            <h3>Most Active</h3>
            <p>See auctions with the most bidding activity</p>
            <button
              onClick={() => setFilters(prev => ({ ...prev, status: 'live', sortBy: 'mostBids' }))}
              className="action-btn"
            >
              <Eye className="btn-icon" />
              View Most Active
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bid;
