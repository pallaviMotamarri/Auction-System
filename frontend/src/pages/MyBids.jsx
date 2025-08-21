import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyBids.css';
import { Search, Trophy } from 'lucide-react';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('active');
  const [expandedAuction, setExpandedAuction] = useState(null);
  const [expandedBids, setExpandedBids] = useState({});
  const [notifications, setNotifications] = useState(null);
  const [showWonClicked, setShowWonClicked] = useState(false);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auctions/user/winner-notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (err) {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchBids = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auctions/user/participated-bids', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Group bids by auction and find highest bid per auction
        const grouped = {};
        res.data.forEach(bid => {
          const auctionId = bid.auction;
          if (!grouped[auctionId]) grouped[auctionId] = [];
          grouped[auctionId].push(bid);
        });
        const mappedBids = Object.entries(grouped).map(([auctionId, bidsArr]) => {
          const highestBid = bidsArr.reduce((max, b) => b.amount > max.amount ? b : max, bidsArr[0]);
          return {
            auction: auctionId,
            auctionTitle: highestBid.auctionTitle,
            highestBid: highestBid.amount,
            bids: bidsArr,
          };
        });
        setBids(mappedBids);
      } catch (err) {
        setError('Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    fetchBids();
  }, []);

  // Refetch bid history for auction when expanded
  const handleExpandAuction = async (auctionId) => {
    if (expandedAuction === auctionId) {
      setExpandedAuction(null);
      return;
    }
    setExpandedAuction(auctionId);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/auctions/user/participated-bids', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const auctionBids = res.data.filter(bid => bid.auction === auctionId);
      setExpandedBids(prev => ({ ...prev, [auctionId]: auctionBids }));
    } catch (err) {
      setExpandedBids(prev => ({ ...prev, [auctionId]: [] }));
    }
  };

  const activeBids = bids.filter(bid => bid.status === 'active');
  const bidHistory = bids.filter(bid => bid.status !== 'active');

  return (
    <>
    <div className="dashboard-my-bids">
      <div className="dashboard-header">
        <h2><Search /> My Bids</h2>
      </div>
      <div className="bids-tabs">
        <button className={tab === 'active' ? 'tab active' : 'tab'} onClick={() => setTab('active')}>Active Bids</button>
        <button className={tab === 'history' ? 'tab active' : 'tab'} onClick={() => setTab('history')}>Bid History</button>
      </div>
      {loading ? <div className="loading">Loading...</div> : error ? <div className="error">{error}</div> : (
        <div className="bids-list">
          {bids.map(bid => (
            <div className="bid-card" key={bid.auction}>
              <div className="bid-title" style={{cursor:'pointer'}} onClick={() => handleExpandAuction(bid.auction)}>
                {bid.auctionTitle}
              </div>
              <div className="bid-details">
                <span>Your Highest Bid: {bid.highestBid}</span>
                <span>Click to view all your bids</span>
              </div>
              {expandedAuction === bid.auction && (
                <div className="bid-history-list">
                  <h4>Your Bid History</h4>
                  <table className="bid-history-table">
                    <thead>
                      <tr>
                        <th>Amount</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(expandedBids[bid.auction] || []).map((b, idx) => (
                        <tr key={b._id || idx}>
                          <td>{b.amount}</td>
                          <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Unknown'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Participate button for active auctions */}
                  {bids.find(b => b.auction === bid.auction && b.status === 'active') && (
                    <a
                      href={`/auction/${bid.auction}/bidder`}
                      className="participate-btn"
                      style={{ display: 'inline-block', marginTop: '1rem', background: '#6366f1', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
                    >
                      Participate in Auction
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {/* Notifications Section */}
    </div>
    <div className="notifications-section" style={{ marginTop: '2rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Auctions Won</h3>
      <button
        style={{ background: '#6366f1', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 500, marginBottom: '1rem' }}
        onClick={async () => {
          setShowWonClicked(true);
          const token = localStorage.getItem('token');
          try {
            const res = await axios.get('/api/auctions/user/winner-notifications', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.data || res.data.length === 0) {
              setNotifications([]);
            } else {
              setNotifications(res.data);
            }
          } catch (err) {
            setNotifications([]);
          }
        }}
      >Show Auctions Won</button>
      {/* Only show results after button is clicked */}
      {showWonClicked && notifications !== null ? (
        notifications.length === 0 ? (
          <div style={{ color: '#888' }}>You have not won any auction.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map(n => (
              <li key={n._id} style={{ background: '#f3f4f6', marginBottom: '1rem', padding: '1rem', borderRadius: '8px' }}>
                <div><strong>Auction:</strong> {n.auction && typeof n.auction === 'object' ? n.auction.title : 'Unknown'}</div>
                <div><strong>Winning Bid:</strong> ${n.amount}</div>
                <div><strong>Your Details:</strong> {n.fullName} | {n.email} | {n.phone}</div>
                <div><strong>Time:</strong> {n.createdAt ? new Date(n.createdAt).toLocaleString() : 'Unknown'}</div>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
    </>
  );
};

export default MyBids;
