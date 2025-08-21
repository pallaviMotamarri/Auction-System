import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyContacts.css';
import { MessageCircle, MailPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyContacts = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/my-contacts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="dashboard-my-contacts">
      <div className="dashboard-header">
        <h2><MessageCircle /> My Contacts</h2>
        <Link to="/contact" className="send-message-btn"><MailPlus /> Send New Message</Link>
      </div>
      {loading ? <div className="loading">Loading...</div> : error ? <div className="error">{error}</div> : (
        <div className="messages-list">
          {messages.map(msg => (
            <div className="message-card" key={msg._id}>
              <div className="message-content">{msg.content}</div>
              <div className="message-meta">
                <span>{new Date(msg.dateSent).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyContacts;
