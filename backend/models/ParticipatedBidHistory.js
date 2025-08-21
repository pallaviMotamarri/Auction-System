const mongoose = require('mongoose');

const participatedBidHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  bids: [
    {
      auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
      },
      auctionTitle: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('ParticipatedBidHistory', participatedBidHistorySchema);
