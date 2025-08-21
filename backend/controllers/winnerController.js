const Winner = require('../models/Winner');

// Get all winner notifications for a user
exports.getWinnerNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const winners = await Winner.find({ user: userId }).populate('auction');
    res.json(winners);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching winner notifications' });
  }
};
