import React, { useState } from 'react';
import axios from 'axios';
import './admin.css';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5001/api/admin/auth/reset-password', { email, newPassword });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    }
  };

  return (
    <div className="admin-container">
      <main className="admin-main-content">
        <form className="admin-card" onSubmit={handleSubmit}>
          <h2>Admin Password Reset</h2>
          <input name="email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input name="newPassword" type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          <button type="submit">Update Password</button>
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
        </form>
      </main>
    </div>
  );
}
