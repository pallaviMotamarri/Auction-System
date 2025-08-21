const express = require('express');
const router = express.Router();
const User = require('../models/User');

// PUT /api/admin/users/:id/suspend
router.put('/users/:id/suspend', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.suspended = true;
  await user.save();
  res.json({ message: 'User suspended' });
});

// PUT /api/admin/users/:id/unsuspend
router.put('/users/:id/unsuspend', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.suspended = false;
  await user.save();
  res.json({ message: 'User unsuspended' });
});

// GET /api/admin/users?search=&page=1&pageSize=10
router.get('/users', async (req, res) => {
  const { search = '', page = 1, pageSize = 10 } = req.query;
  const query = search
    ? {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    : {};
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .skip((page - 1) * pageSize)
    .limit(Number(pageSize));
  res.json({ users, total });
});

module.exports = router;
