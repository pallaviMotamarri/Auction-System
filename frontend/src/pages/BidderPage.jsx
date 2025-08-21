import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import api from '../utils/api';
import { ArrowLeft, User, DollarSign, Clock, Gavel } from 'lucide-react';

const BidderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [userBidHistory, setUserBidHistory] = useState([]);

  useEffect(() => {
    fetchAuctionDetails();
    // Only fetch bid history when user is loaded
    if (user && user._id) {
      fetchUserBidHistory();
    }
    // eslint-disable-next-line
  }, [id, user]);
  // Fetch user's bid history for this auction
  const fetchUserBidHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/auctions/user/participated-bids', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && user?._id) {
        // Compare ObjectId as string
        const userBids = res.data.filter(bid => {
          // Handle both ObjectId and populated object
          if (String(bid.auction) === String(id)) return true;
          if (bid.auction && bid.auction._id && String(bid.auction._id) === String(id)) return true;
          return false;
        });
        setUserBidHistory(userBids);
      } else {
        setUserBidHistory([]);
      }
    } catch (err) {
      setUserBidHistory([]);
    }
  };

  const handlePlaceBid = async () => {
    setBidError('');
    if (!bidAmount || isNaN(bidAmount)) {
      setBidError('Please enter a valid bid amount.');
      return;
    }
    const minBid = auction.currentBid || auction.startingPrice || 0;
    if (Number(bidAmount) <= minBid) {
      setBidError(`Bid must be greater than ${formatPrice(minBid)}`);
      return;
    }
    setBidLoading(true);
    try {
      const response = await api.post(`/auctions/${auction._id}/bid`, { amount: Number(bidAmount) });
      setBidAmount('');
      // Show success message
      setBidError('');
      window.setTimeout(() => {
        setBidError('Bid placed successfully!');
      }, 100);
      // Refetch auction details and user bid history
      await fetchAuctionDetails();
      await fetchUserBidHistory();
    } catch (err) {
      setBidError(err.response?.data?.message || 'Failed to place bid.');
    } finally {
      setBidLoading(false);
    }
  };

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data);
      // Filter user's bids from auction.bids
      if (response.data?.bids && user?._id) {
        const userBids = response.data.bids.filter(bid => {
          if (!bid.bidder) return false;
          // bidder can be an object or a string (id)
          if (typeof bid.bidder === 'string') {
            return bid.bidder === user._id;
          }
          return bid.bidder._id === user._id;
        });
        setUserBidHistory(userBids);
      } else {
        setUserBidHistory([]);
      }
    } catch (error) {
      console.error('Error fetching auction:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!auction?.currency || auction.currency === 'Other') {
      return `${price}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: auction.currency
    }).format(price);
  };

  const formatTimeLeft = (auction) => {
    if (!auction) return '--';
    const now = new Date();
    let target = null;
    let label = '';
    // Use startDate/endDate if startTime/endTime are missing
    if (auction.status === 'upcoming') {
      if (auction.startTime) {
        target = new Date(auction.startTime);
      } else if (auction.startDate) {
        target = new Date(auction.startDate);
      }
      label = 'Starts in';
    } else {
      if (auction.endTime) {
        target = new Date(auction.endTime);
      } else if (auction.endDate) {
        target = new Date(auction.endDate);
      }
      label = 'Ends in';
    }
    // If still no valid date, try fallback to auction.startDate/endDate
    if (!target || isNaN(target.getTime())) {
      if (auction.status === 'upcoming' && auction.startDate) {
        target = new Date(auction.startDate);
      } else if (auction.endDate) {
        target = new Date(auction.endDate);
      }
    }
    if (!target || isNaN(target.getTime())) return '--';
    const diff = target - now;
    if (diff <= 0) return auction.status === 'upcoming' ? 'Started' : 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${label} ${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${label} ${hours}h ${minutes}m`;
    return `${label} ${minutes}m`;
  };

  if (loading) return <div>Loading...</div>;
  if (!auction) return <div>Auction not found</div>;
  // Prevent access if user is not verified
  if (user && (!user.isEmailVerified || !user.isPhoneVerified)) {
    return (
      <div className="auction-details-page">
        <div className="container">
          <div style={{marginTop: '2rem', color: '#ef4444', fontWeight: 600, fontSize: '1.2rem', textAlign: 'center'}}>
            You must verify your email and phone number to participate in bidding.<br />
            <button
              style={{marginTop: '1rem', background: '#6366f1', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '6px', fontWeight: 500, border: 'none', cursor: 'pointer'}}
              onClick={() => navigate('/profile')}
            >Go to Profile Verification</button>
          </div>
        </div>
      </div>
    );
  }

  // Safe fallback for missing fields
  const auctionTitle = auction.title || 'No Title';
  const auctionSeller = auction.seller?.fullName || 'Unknown Seller';
  let auctionImage = '';
  if (auction.images && auction.images.length > 0) {
    auctionImage = auction.images[0].startsWith('http')
      ? auction.images[0]
      : `http://localhost:5001/${auction.images[0]}`;
  } else if (auction.image) {
    auctionImage = auction.image.startsWith('http')
      ? auction.image
      : `http://localhost:5001/${auction.image}`;
  } else {
    auctionImage = 'https://res.cloudinary.com/dhjbphutc/image/upload/v1755457818/no-image-found_kgenoc.png';
  }
  const auctionDescription = auction.description || 'No description available.';

  return (
    <div className="auction-details-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft className="btn-icon" />
          Back to Auctions
        </button>

        <div className="auction-details-header">
          <h1 className="auction-title">{auctionTitle}</h1>
          <div className="auction-type-info">
            <span className="auction-type-label">Auction Type:</span>
            <span className="auction-type-value">{auction.auctionType ? auction.auctionType.charAt(0).toUpperCase() + auction.auctionType.slice(1) : 'Unknown'}</span>
          </div>
          <div className="seller-info">
            <User className="seller-icon" />
            <div className="seller-details">
              <span className="seller-label">Seller</span>
              <span className="seller-name">{auctionSeller}</span>
            </div>
          </div>
          <div className="bid-time-left">
            <Clock className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Time Left</span>
              <span className="stat-value">{formatTimeLeft(auction)}</span>
            </div>
          </div>
          <div className="bid-total-count">
            <Gavel className="stat-icon" />
            <div className="stat-content">
              <span className="stat-label">Total Bids</span>
              <span className="stat-value">{auction.bids?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="auction-details-grid">
          {/* Image Section */}
          <div className="auction-image-section">
            <div className="auction-image-container">
              <img 
                src={auctionImage}
                alt={auctionTitle}
                style={{ width: '100%', maxWidth: '500px', height: '100%', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
            </div>
           
          </div>
           
          
          {/* Details Section */}
          <div className="auction-details-info-section">
            <div className="auction-details-stats">
              <div className="auction-details-stat-card auction-details-starting-amount">
                <DollarSign className="auction-details-stat-icon" />
                <div className="auction-details-stat-content">
                  <span className="auction-details-stat-label">Starting Amount</span>
                  <span className="auction-details-stat-value">{formatPrice(auction.startingPrice || 0)}</span>
                </div>
              </div>
              {auction.auctionType === 'reserve' ? (
                <div className="auction-details-stat-card auction-details-current-bid">
                  <DollarSign className="auction-details-stat-icon" />
                  <div className="auction-details-stat-content">
                    <span className="auction-details-stat-label">Your Highest Bid</span>
                    <span className="auction-details-stat-value">
                      {(() => {
                        if (!userBidHistory || userBidHistory.length === 0) return formatPrice(0);
                        const highestBid = userBidHistory.reduce((max, bid) => bid.amount > max.amount ? bid : max, userBidHistory[0]);
                        return formatPrice(highestBid.amount);
                      })()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="auction-details-stat-card auction-details-current-bid">
                  <DollarSign className="auction-details-stat-icon" />
                  <div className="auction-details-stat-content">
                    <span className="auction-details-stat-label">Current Bid</span>
                    <span className="auction-details-stat-value">{formatPrice(auction.currentBid || 0)}</span>
                  </div>
                </div>
              )}
              {/* Reserved Amount for reserve auctions */}
              {auction.auctionType === 'reserve' && auction.reservedAmount && (
                <div className="auction-details-stat-card auction-details-reserved-amount">
                  <DollarSign className="auction-details-stat-icon" />
                  <div className="auction-details-stat-content">
                    <span className="auction-details-stat-label">Reserved Amount</span>
                    <span className="auction-details-stat-value">{formatPrice(auction.reservedAmount)}</span>
                  </div>
                </div>
              )}
            </div>

             
            {/* Conditional Bid UI */}
            {auction.auctionType !== 'reserve' ? (
              <form
                className="auction-details-place-bid-section"
                onSubmit={e => {
                  e.preventDefault();
                  handlePlaceBid();
                }}
              >
                <h3>Place Your Bid</h3>
                <input
                  type="number"
                  min={auction.currentBid || auction.startingPrice || 0}
                  placeholder="Enter bid amount"
                  className="auction-details-bid-input"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  disabled={bidLoading}
                />
                <button
                  type="submit"
                  className="auction-details-place-bid-btn"
                  disabled={bidLoading}
                >
                  {bidLoading ? 'Placing Bid...' : 'Place Bid'}
                </button>

                {bidError && <div style={{ color: 'red', marginTop: '8px' }}>{bidError}</div>}
              </form>
            ) : (
              <div className="auction-details-reserve-section">
                <h3>Reserve Auction Participation</h3>
                <p>To participate in this reserve auction, you must pay an initial amount. Click below to get payment details.</p>
                <button className="auction-details-payment-details-btn">Click here to get payment details</button>
              </div>
            )}
          </div>

            {/* User Bid History Section - moved below image */}
            <div className="auction-details-bid-history-section">
              <h3>Your Bid History</h3>
              {userBidHistory.length === 0 ? (
                <div className="auction-details-no-bid-history">No bids placed yet.</div>
              ) : (
                <table className="auction-details-bid-history-table">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBidHistory.map((bid, idx) => (
                      <tr key={bid._id || idx}>
                        <td>{formatPrice(bid.amount)}</td>
                        <td>{
                          (bid.createdAt && !isNaN(new Date(bid.createdAt).getTime()))
                            ? new Date(bid.createdAt).toLocaleString()
                            : (bid.timestamp && !isNaN(new Date(bid.timestamp).getTime()))
                              ? new Date(bid.timestamp).toLocaleString()
                              : 'Unknown'
                        }</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* For reserve auctions, show only user's bid history, not global bid list */}
            </div>

        </div>
      </div>
    </div>
  );
};

export default BidderPage;
