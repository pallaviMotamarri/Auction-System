import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Gavel, Clock } from 'lucide-react';
import './MyAuctions.css';

const DeletedAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeletedAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auctions/my?status=deleted', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAuctions(res.data);
      } catch (err) {
        setError('Failed to load deleted auctions');
      } finally {
        setLoading(false);
      }
    };
    fetchDeletedAuctions();
  }, []);

  return (
    <div className="dashboard-my-auctions">
      <div className="dashboard-header">
        <h1><Gavel className="icon" /> Deleted Auctions</h1>
        <Link to="/my-auctions" className="add-auction-btn">Back to My Auctions</Link>
      </div>
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
              </tr>
            </thead>
            <tbody>
              {auctions.filter(a => a.status === 'deleted').map(auction => (
                <tr key={auction._id}>
                  <td>{auction.title}</td>
                  <td>{auction.category}</td>
                  <td>${auction.startingPrice.toFixed(2)}</td>
                  <td><span className="status-badge">Deleted</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeletedAuctions;
