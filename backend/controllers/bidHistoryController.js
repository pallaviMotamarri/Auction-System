const CreatedBidHistory = require('../models/CreatedBidHistory');
// Add bid to created bid history for seller
exports.addCreatedBid = async (auctionId, sellerId, bidderId, amount) => {
  let history = await CreatedBidHistory.findOne({ auction: auctionId, seller: sellerId });
  if (!history) {
    history = new CreatedBidHistory({ auction: auctionId, seller: sellerId, bids: [] });
  }
  history.bids.push({ bidder: bidderId, amount, createdAt: new Date() });
  await history.save();
};
const ParticipatedBidHistory = require('../models/ParticipatedBidHistory');
const Auction = require('../models/Auction');
const User = require('../models/User');

// Add bid to participated bid history
exports.addParticipatedBid = async (userId, email, auctionId, auctionTitle, amount) => {
  let history = await ParticipatedBidHistory.findOne({ user: userId });
  if (!history) {
    history = new ParticipatedBidHistory({ user: userId, email, bids: [] });
  }
  history.bids.push({ auction: auctionId, auctionTitle, amount, createdAt: new Date() });
  await history.save();
};

// Get user's participated bid history
exports.getParticipatedBidHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await ParticipatedBidHistory.findOne({ user: userId });
    res.json(history ? history.bids : []);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching participated bid history' });
  }
};
