import React, { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';

const PAGE_SIZE = 10;

const AdminHandleUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Debounce search input
  const searchTimeout = useRef();
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Replace with your backend API endpoint
      const res = await axios.get(`/api/admin/users`, {
        params: { search: search.trim(), page, pageSize: PAGE_SIZE }
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setForm({ ...user, password: '' });
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/admin/users/${editUser._id}`, form);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      // handle error
    }
    setLoading(false);
  };

  return (
    <div className="admin-users-page">
      <h2>Handle Users</h2>
      <div className="user-search-bar">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') fetchUsers(); }}
        />
        <button className="search-btn" onClick={fetchUsers} title="Search">
          <Search size={20} />
        </button>
      </div>
      {loading ? <div>Loading...</div> : (
        <table className="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              {/* <th>Crown Score</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.role}</td>
                {/* <td>{user.crownScore}</td> */}
                <td>
                  <button onClick={() => handleEdit(user)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination">
        {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => (
          <button key={i} onClick={() => setPage(i + 1)} className={page === i + 1 ? 'active' : ''}>{i + 1}</button>
        ))}
      </div>
      {editUser && (
        <div className="edit-modal">
          <h3>Edit User</h3>
          <form onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
            <input name="fullName" value={form.fullName} onChange={handleFormChange} placeholder="Full Name" />
            <input name="email" value={form.email} onChange={handleFormChange} placeholder="Email" />
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} placeholder="Phone Number" />
            <input name="role" value={form.role} onChange={handleFormChange} placeholder="Role" />
            {/* <input name="crownScore" value={form.crownScore} onChange={handleFormChange} placeholder="Crown Score" type="number" /> */}
            <input name="password" value={form.password} onChange={handleFormChange} placeholder="New Password (optional)" type="password" />
            {/* Add more fields as needed from your user schema */}
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditUser(null)}>Cancel</button>
            <button
              type="button"
              style={{background: editUser.suspended ? '#67b26f' : '#d63031', color: '#fff', marginLeft: 8}}
              onClick={async () => {
                setLoading(true);
                await axios.put(`/api/admin/users/${editUser._id}/${editUser.suspended ? 'unsuspend' : 'suspend'}`);
                setEditUser(null);
                fetchUsers();
                setLoading(false);
              }}
            >
              {editUser.suspended ? 'Unsuspend User' : 'Suspend User'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminHandleUsers;
