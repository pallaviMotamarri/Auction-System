const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  auctionId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Fashion', 'Home & Garden', 'Collectibles', 'Art', 'Books','Music','Jewelry', 'Vehicles', 'Automotive', 'Sports', 'Other']
  },
  auctionType: {
    type: String,
    required: true,
    enum: ['english', 'dutch', 'sealed', 'reserve'],
    default: 'english'
  },
  images: [{
    type: String,
    required: true
  }],
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'CAD', 'AUD', 'CHF', 'SGD', 'NZD', 'ZAR', 'BRL', 'RUB', 'KRW', 'HKD', 'MXN', 'SEK', 'NOK', 'TRY', 'SAR', 'AED', 'PLN', 'THB', 'IDR', 'MYR', 'PHP', 'VND', 'EGP', 'PKR', 'BDT', 'Other'],
    default: 'USD'
  },
  video: {
    type: String,
    default: null
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  reservePrice: {
    type: Number,
    default: null
  },
  minimumPrice: {
    type: Number,
    default: null
  },
  currentBid: {
    type: Number,
    default: function() {
      return this.startingPrice;
    }
  },
  bidIncrement: {
    type: Number,
    default: 10,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentHighestBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bids: [{
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'ended', 'cancelled', 'deleted'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
  },
  participationCode: {
    type: String,
    required: false,
    unique: true,
    trim: true,
    default: '-'
  }
}, {
  timestamps: true
});

// Virtual for time left
auctionSchema.virtual('timeLeft').get(function() {
  const now = new Date();
  const endTime = new Date(this.endDate);
  const diff = endTime - now;
  
  if (diff <= 0) return 'Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
});

// Update status based on time
auctionSchema.methods.updateStatus = function() {
  // Don't overwrite deleted status
  if (this.status === 'deleted') return Promise.resolve(this);
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now < this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'ended';
  }
  return this.save();
};

module.exports = mongoose.model('Auction', auctionSchema);
