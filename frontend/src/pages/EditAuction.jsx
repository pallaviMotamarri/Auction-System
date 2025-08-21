  // Add missing handleFileChange function
 
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './EditAuction.css';

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    startTime: '',
    endTime: '',
    startingPrice: '',
    currency: '',
    images: [],
    video: ''
  });
  const [mediaPreview, setMediaPreview] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
 const handleFileChange = e => {
    setForm(prev => ({ ...prev, images: Array.from(e.target.files) }));
    setMediaPreview(Array.from(e.target.files).map(file => URL.createObjectURL(file)));
  };

  useEffect(() => {
    const fetchAuction = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/auctions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAuction(res.data);
        setForm({
          title: res.data.title,
          category: res.data.category,
          description: res.data.description,
          startTime: res.data.startTime || '',
          endTime: res.data.endTime || '',
          startingPrice: res.data.startingPrice,
          currency: res.data.currency,
          images: res.data.images || [],
          video: res.data.video || ''
        });
        setMediaPreview(res.data.images || []);
  const handleFileChange = e => {
    setForm(prev => ({ ...prev, images: Array.from(e.target.files) }));
    setMediaPreview(Array.from(e.target.files).map(file => URL.createObjectURL(file)));
  };
        setCanEdit(res.data.status === 'upcoming');
      } catch (err) {
        setError('Failed to load auction');
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'images') {
          value.forEach(img => formData.append('images', img));
        } else {
          formData.append(key, value);
        }
      });
      await axios.put(`/api/auctions/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data' }
      });
      navigate('/my-auctions');
    } catch (err) {
      setError('Failed to update auction');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/auctions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/my-auctions');
    } catch (err) {
      setError('Failed to delete auction');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!auction) return null;

  return (
    <div className="edit-auction-container">
      <h2>Edit Auction</h2>
      {canEdit ? (
        <form onSubmit={handleSubmit} className="edit-auction-form">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} required />
          <label>Category</label>
          <input name="category" value={form.category} onChange={handleChange} required />
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} required />
          <label>Start Time</label>
          <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} required />
          <label>End Time</label>
          <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} required />
          <label>Starting Price</label>
          <input type="number" name="startingPrice" value={form.startingPrice} onChange={handleChange} required />
          <label>Currency</label>
          <input name="currency" value={form.currency} onChange={handleChange} required />
          <label>Images</label>
          <input type="file" name="images" multiple onChange={handleFileChange} accept="image/*" />
          <div className="media-preview">
            {mediaPreview.map((src, idx) => (
              <img key={idx} src={src} alt="preview" style={{ width: 80, marginRight: 8 }} />
            ))}
          </div>
          <label>Video</label>
          <input name="video" value={form.video} onChange={handleChange} />
          <button type="submit">Update Auction</button>
          <button type="button" onClick={handleDelete} className="delete-btn">Delete Auction</button>
        </form>
      ) : auction.status === 'active' ? (
        <form onSubmit={async e => {
          e.preventDefault();
          try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/auctions/${id}/endtime`, { endTime: form.endTime }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/my-auctions');
          } catch (err) {
            setError('Failed to update end time');
          }
        }} className="edit-auction-form">
          <p>You can only modify the ending time for an active auction.</p>
          <label>End Time</label>
          <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} required />
          <button type="submit">Update End Time</button>
          <button type="button" onClick={handleDelete} className="delete-btn">Delete Auction</button>
        </form>
      ) : (
        <div>
          <p>This auction has ended. You cannot edit or delete it.</p>
        </div>
      )}
    </div>
  );
};

export default EditAuction;
