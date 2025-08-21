import React, { useState } from 'react';
import axios from 'axios';
import './admin.css';

export default function AdminRegister({ onRegistered }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:5001/api/admin/auth/register', form);
      onRegistered();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="admin-container">
      <main className="admin-main-content">
        <form className="admin-card" onSubmit={handleSubmit}>
          <h2>Admin Register</h2>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} required />
          <button type="submit">Register</button>
          {error && <div className="error">{error}</div>}
        </form>
      </main>
    </div>
  );
}
