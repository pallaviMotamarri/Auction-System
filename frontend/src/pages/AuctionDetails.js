import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, User, Clock, DollarSign, Gavel, AlertCircle, CheckCircle, PlayCircle, MoveLeft, MoveRight } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import api from '../utils/api';
// import './AuctionDetails.css'; // Assuming you have a CSS file for styling
const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

  useEffect(() => {
    fetchAuctionDetails();
  }, [id]);

  const fetchAuctionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/auctions/${id}`);
      setAuction(response.data);
      setBidAmount((response.data.currentBid + response.data.bidIncrement).toString());
    } catch (error) {
      console.error('Error fetching auction details:', error);
      toast.error('Failed to load auction details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    
    if (isNaN(amount) || amount <= auction.currentBid) {
      toast.error(`Bid must be higher than current bid of $${auction.currentBid}`);
      return;
    }

    if (amount < auction.currentBid + auction.bidIncrement) {
      toast.error(`Minimum bid increment is $${auction.bidIncrement}`);
      return;
    }

    setIsSubmittingBid(true);
    try {
      const response = await api.post(`/auctions/${id}/bid`, { amount });
      setAuction(response.data.auction);
      setBidAmount((response.data.auction.currentBid + response.data.auction.bidIncrement).toString());
      toast.success('Bid placed successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to place bid';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatTimeLeft = (auction) => {
    const now = new Date();
    let target;
    let label = '';
    if (auction?.status === 'upcoming') {
      target = new Date(auction?.startTime || auction?.startDate);
      label = 'Starts in';
    } else {
      target = new Date(auction?.endTime || auction?.endDate);
      label = 'Ends in';
    }
    if (!target || isNaN(target.getTime())) return 'Unknown';
    const diff = target - now;
    if (diff <= 0) return auction?.status === 'upcoming' ? 'Started' : 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${label} ${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${label} ${hours}h ${minutes}m`;
    return `${label} ${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'upcoming':
        return 'status-upcoming';
      case 'ended':
        return 'status-ended';
      default:
        return 'status-default';
    }
  };

  const isOwner = user && auction && auction.seller._id === user._id;
  const isHighestBidder = user && auction && auction.currentHighestBidder?._id === user.id;

  if (loading) {
    return (
      <div className="auction-details-page">
        <div className="auction-details-container">
          <div className="auction-details-loading-container">
            <div className="auction-details-loading-spinner"></div>
            <p>Loading auction details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="auction-details-page">
        <div className="auction-details-container">
          <div className="auction-details-error-container">
            <h2>Auction not found</h2>
            <button onClick={() => navigate('/')} className="auction-details-back-btn">
              <ArrowLeft className="auction-details-btn-icon" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Combine images and videos for thumbnail navigation
  // Combine images and video for thumbnail navigation
  const mediaList = [
    ...(auction?.images || []),
    ...(auction?.video ? [auction.video] : [])
  ];

  // Helper to check if media is a video (simple check for .mp4, .webm, .mov, etc.)
  const isVideo = (url) => {
    return /\.(mp4|webm|ogg|mov)$/i.test(url);
  };

  // Main preview: show selected image or video
  const renderMainPreview = () => {
    if (mediaList.length === 0) {
      return <img src="/placeholder-image.jpg" alt="No image" className="auction-details-image" />;
    }
    const url = mediaList[selectedMediaIdx];
    if (isVideo(url)) {
      return (
        <video
          src={url.startsWith('http') ? url : `http://localhost:5001/${url}`}
          className="auction-details-image"
          controls
          style={{ background: '#000' }}
        />
      );
    }
    return (
      <img
        src={url.startsWith('http') ? url : `http://localhost:5001/${url}`}
        alt={auction.title}
        className="auction-details-image"
        onError={(e) => {
          e.target.src = '/placeholder-image.jpg';
        }}
      />
    );
  };

  // Slider navigation
  const handlePrev = () => {
    setSelectedMediaIdx((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setSelectedMediaIdx((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="auction-details-page">
      <div className="auction-details-container">
        <button onClick={() => navigate('/')} className="auction-details-back-btn">
          <ArrowLeft className="auction-details-btn-icon" />
          Back to Auctions
        </button>

        <div className="auction-details-grid">
          {/* Image/Video Section + Title/Category */}
          <div className="auction-details-image-section">
            <div className="auction-details-slider">
              <div className="auction-details-main-preview">
                {renderMainPreview()}
              </div>
            </div>
            <div className="auction-details-thumbnails-row">
              {mediaList.length > 0 ? (
                mediaList.map((url, idx) => (
                  <div
                    key={idx}
                    className={`auction-details-thumbnail${selectedMediaIdx === idx ? ' selected' : ''}`}
                    onClick={() => setSelectedMediaIdx(idx)}
                  >
                    {isVideo(url) ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <video
                          src={url.startsWith('http') ? url : `http://localhost:5001/${url}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                          muted
                          preload="metadata"
                        />
                        <PlayCircle style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#3182ce', background: 'rgba(255,255,255,0.7)', borderRadius: '50%' }} size={32} />
                      </div>
                    ) : (
                      <img
                        src={url.startsWith('http') ? url : `http://localhost:5001/${url}`}
                        alt={auction.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.jpg';
                        }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <img src="/placeholder-image.jpg" alt="No image" className="auction-details-thumbnail" />
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="auction-details-info-section">
            <div className="auction-details-header">
              <h1 className="auction-details-title">{auction.title}</h1>
              
            </div>
              <p className="auction-details-category">{auction.category}</p>
            <div className="auction-details-stats">
              <div className="auction-details-stat-card current-bid" style={{ height: 'auto', minHeight: 'unset' }}>
                <div className="auction-details-stat-content">
                  <span className="auction-details-stat-label">Current Bid</span>
                  <span className="auction-details-stat-value">₹{auction.currentBid.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="auction-details-stat-card time-left">
                
                <div className="auction-details-stat-content">
                  {/* <Clock className="auction-details-stat-icon" /> */}
                  <span className="auction-details-stat-label">Time Left</span>
                  <span className="auction-details-stat-value">{formatTimeLeft(auction)}</span>
                </div>
              </div>

              <div className="auction-details-stat-card bid-count">
                {/* <Gavel className="auction-details-stat-icon" /> */}
                <div className="auction-details-stat-content">
                  <span className="auction-details-stat-label">Total Bids</span>
                  <span className="auction-details-stat-value">{auction.bids?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Auction Participation Code & Type Info */}
         <div className="auction-details-participation-info">
  <div className="participation-info-card">
    <div className="info-section">
      <span className="info-label">Participation Code</span>
      <span className="info-value code-highlight">{auction.participationCode || 'N/A'}</span>
    </div>
    <div className="info-section">
      <span className="info-label">Auction Type</span>
      <span className="info-value type-badge">{auction.type || 'Standard'}</span>
    </div>
  </div>
</div>
            {/* Seller Info */}
            <div className="auction-details-seller-info">
              <User className="auction-details-seller-icon" />
              <div className="auction-details-seller-details">
                <span className="auction-details-seller-label">Seller</span>
                <span className="auction-details-seller-name">{auction.seller.fullName}</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Description Section */}
        <div className="auction-details-description">
          <h2>Description</h2>
          <p>{auction.description}</p>
        </div>
        {/* Conditional rendering for bidding/participation button */}
        {isOwner ? (
          <button
            className="auction-details-action-btn"
            style={{ marginTop: '1rem', display: 'inline-block', width: 'fit-content' }}
            onClick={() => navigate(`/auction/${auction._id}/bid`)}
          >
            Go to Bidding Page
          </button>
        ) : (
          <button
            className="auction-details-action-btn"
            style={{ marginTop: '1rem', display: 'inline-block', width: 'fit-content' }}
            onClick={() => navigate(`/auction/${auction._id}/bidder`)}
          >
            Participate in Auction
          </button>
        )}

        {/* Bid History */}
        {/* {auction.bids && auction.bids.length > 0 && (
          <div className="auction-details-bid-history">
            <h2>Bid History</h2>
            <div className="auction-details-bid-list">
              {auction.bids
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 10)
                .map((bid, index) => (
                  <div key={index} className="auction-details-bid-item">
                    <div className="auction-details-bid-user">
                      <User className="auction-details-user-icon" />
                      <span>{bid.bidder.fullName}</span>
                    </div>
                    <div className="auction-details-bid-amount">{formatPrice(bid.amount)}</div>
                    <div className="auction-details-bid-time">
                      {new Date(bid.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default AuctionDetails;
