import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Gavel } from 'lucide-react';
import './AuctionEndedDetails.css';

const AuctionEndedDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/auctions/${id}`);
        setAuction(res.data);
      } catch (err) {
        setError('Failed to load auction details');
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!auction) return null;

  return (
    <div className="auction-ended-details-container">
      <button onClick={() => navigate('/my-auctions')} className="back-btn">
        <ArrowLeft /> Back
      </button>
      <h2>{auction.title} - Ended Auction Details</h2>
      <div className="winner-section">
        <h3>Winner</h3>
        {auction.currentHighestBidder ? (
          <div className="winner-info">
            <User /> {auction.currentHighestBidder.fullName} (Bid: ${auction.currentBid})
          </div>
        ) : (
          <div>No winner (no bids placed)</div>
        )}
      </div>
      <div className="participants-section">
        <h3>Participants</h3>
        <ul>
            {[...new Set(
              auction.bids
                .filter(bid => bid.bidder && bid.bidder.fullName)
                .map(bid => bid.bidder.fullName)
            )].map((name, idx) => (
              <li key={idx}><User /> {name}</li>
            ))}
        </ul>
      </div>
      <div className="bid-history-section">
        <h3>Bidding History</h3>
        <ul>
            {auction.bids
              .filter(bid => bid.bidder && bid.bidder.fullName)
              .map((bid, idx) => (
                <li key={idx}>
                  <User /> {bid.bidder.fullName} - ${bid.amount} at {new Date(bid.timestamp).toLocaleString()}
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
};

export default AuctionEndedDetails;
