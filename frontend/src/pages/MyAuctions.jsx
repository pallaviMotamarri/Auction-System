import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyAuctions.css';
import { Link } from 'react-router-dom';
import { Gavel, Edit, Trash2, Plus, Clock, Zap, CheckCircle } from 'lucide-react';

const MyAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    total: 0,
    upcoming: 0,
    active: 0,
    ended: 0
  });
  // Add showActive state at the top
  const [showActive, setShowActive] = useState(false);

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auctions/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAuctions(res.data);
        
        // Calculate counts
        const upcomingCount = res.data.filter(a => a.status === 'upcoming').length;
        const activeCount = res.data.filter(a => a.status === 'active').length;
        const endedCount = res.data.filter(a => a.status === 'ended').length;
        const deletedCount = res.data.filter(a => a.status === 'deleted').length;
        setCounts({
          total: res.data.length,
          upcoming: upcomingCount,
          active: activeCount,
          ended: endedCount,
          deleted: deletedCount
        });
      } catch (err) {
        setError('Failed to load auctions');
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming':
        return <span className="status-badge status-upcoming"><Clock size={14} /> Upcoming</span>;
      case 'active':
        return <span className="status-badge status-active"><Zap size={14} /> Active</span>;
      case 'ended':
        return <span className="status-badge status-ended"><CheckCircle size={14} /> Ended</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="dashboard-my-auctions">
      <div className="dashboard-header">
        <div>
          <h1><Gavel className="icon" /> My Auctions</h1>
          <p className="auction-count">Total: {counts.total} | Upcoming: {counts.upcoming} | Active: {counts.active} | Ended: {counts.ended} | Deleted: {counts.deleted}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/create-auction" className="add-auction-btn"><Plus size={18} /> Add Auction</Link>
          <Link to="/dashboard/deleted-auctions" className="add-auction-btn" style={{ background: '#ef4444' }}>
            <Trash2 size={18} /> Deleted Auctions
          </Link>
        </div>
      </div>

      {/* Active Auctions Button and List */}
      <div style={{ margin: '1rem 0' }}>
        <button
          className="show-active-auctions-btn"
          onClick={() => setShowActive(prev => !prev)}
        >
          {showActive ? 'Hide Active Auctions' : 'Show Active Auctions'}
        </button>
      </div>

      {showActive && (
        <div id="active-auctions-section" style={{ marginBottom: '2rem' }}>
          <h3>Active Auctions</h3>
          {auctions.filter(a => a.status === 'active').length === 0 ? (
            <div style={{ color: '#888', marginBottom: '1rem' }}>No active auctions.</div>
          ) : (
            auctions.filter(a => a.status === 'active').map(a => (
              <div key={a._id} className="active-auction-card">
                <div className="active-auction-title">{a.title}</div>
                <Link to={`/auction/${a._id}/auctionbid`} className="go-bid-btn">
                  Go to Bidding Page
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="auction-table-wrapper">
          <table className="auction-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Starting Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map(auction => (
                <tr key={auction._id}>
                  <td>{auction.title}</td>
                  <td>{auction.category}</td>
                  <td>${auction.startingPrice.toFixed(2)}</td>
                  <td>{getStatusBadge(auction.status)}</td>
                  <td>
                    <div className="action-buttons">
                      {auction.status === 'deleted' ? (
                        <span className="status-deleted" >Deleted</span>
                      ) : auction.status === 'ended' ? (
                        <Link to={`/dashboard/auction-ended-details/${auction._id}`} className="action-btn view-details-btn">
                          <Gavel size={16} /> View Results
                        </Link>
                      ) : (
                        <>
                          <Link to={`/dashboard/edit-auction/${auction._id}`} className="action-btn edit-btn">
                            <Edit size={16} /> Edit
                          </Link>
                          <button
                            className="action-btn delete-btn"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this auction?')) {
                                try {
                                  const token = localStorage.getItem('token');
                                  await axios.delete(`/api/auctions/${auction._id}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  setAuctions(prev => prev.filter(a => a._id !== auction._id));
                                } catch (err) {
                                  alert('Failed to delete auction');
                                }
                              }
                            }}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyAuctions;