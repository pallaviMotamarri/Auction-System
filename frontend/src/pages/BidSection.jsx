import { useState } from 'react';
import React from 'react';
import { Gavel, CheckCircle, AlertCircle } from 'lucide-react';

const BidSection = ({ auction, isAuthenticated, isOwner, isHighestBidder, handlePlaceBid, bidAmount, setBidAmount, isSubmittingBid, formatPrice }) => {
  const [participationCode, setParticipationCode] = useState('');
  const generateParticipationCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setParticipationCode(code);
  };

  return (
    <div className="bidding-section">
      <h3 className="bidding-title">Place Your Bid</h3>
      {isHighestBidder && (
        <div className="bid-status winning">
          <CheckCircle className="status-icon" />
          <span>You are currently the highest bidder!</span>
        </div>
      )}
      <form onSubmit={handlePlaceBid} className="bid-form">
        <div className="bid-input-container">
          <span className="currency-symbol">$</span>
          <input
            type="number"
            value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
            min={auction.currentBid + auction.bidIncrement}
            step="0.01"
            className="bid-input"
            placeholder="Enter bid amount"
          />
        </div>
        <p className="bid-hint">
          Minimum bid: {formatPrice(auction.currentBid + auction.bidIncrement)}
        </p>
        <button
          type="submit"
          disabled={isSubmittingBid || !isAuthenticated}
          className="place-bid-btn"
        >
          {isSubmittingBid ? (
            <>
              <div className="btn-spinner"></div>
              Placing Bid...
            </>
          ) : (
            <>
              <Gavel className="btn-icon" />
              Place Bid
            </>
          )}
        </button>
      </form>
      {!isAuthenticated && auction.status === 'active' && (
        <div className="auth-required">
          <AlertCircle className="status-icon" />
          <span>Please login to place bids on this auction.</span>
        </div>
      )}
        {/* Auction Participation Code Section */}
        <div className="form-group">
          <label className="form-label">Auction Participation Code</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              value={participationCode || ''}
              readOnly
              placeholder="Click Generate"
              style={{ width: '180px' }}
            />
            <button type="button" className="btn btn-secondary" onClick={generateParticipationCode}>
              Generate
            </button>
          </div>
          <small className="form-hint">Click 'Generate' to get your participation code for joining the auction.</small>
        </div>
    </div>
  );
};

export default BidSection;
