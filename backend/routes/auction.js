const express = require('express');
const Auction = require('../models/Auction');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const bidHistoryController = require('../controllers/bidHistoryController');
const winnerController = require('../controllers/winnerController');
const Winner = require('../models/Winner');
const router = express.Router();

// Utility to save winner when auction ends
async function saveWinnerIfEnded(auction) {
  if (auction.status === 'ended' && auction.currentHighestBidder) {
    // Check if winner already exists
    const existing = await Winner.findOne({ auction: auction._id });
    if (!existing) {
      // Get user details
      const user = await require('../models/User').findById(auction.currentHighestBidder);
      await Winner.create({
        auction: auction._id,
        user: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneNumber,
        amount: auction.currentBid
      });
    }
  }
}

// Update all fields for upcoming auction
router.put('/:id', auth, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (auction.status !== 'upcoming') {
      return res.status(400).json({ message: 'Only upcoming auctions can be updated' });
    }
    // Only seller can update
    if (auction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this auction' });
    }
    // Update fields
    const {
      title,
      category,
      description,
      startTime,
      endTime,
      startingPrice,
      currency,
      auctionType,
      reservePrice,
      minimumPrice
    } = req.body;
    if (title) auction.title = title;
    if (category) auction.category = category;
    if (description) auction.description = description;
    if (startTime) auction.startDate = new Date(startTime);
    if (endTime) auction.endDate = new Date(endTime);
    if (startingPrice) auction.startingPrice = parseFloat(startingPrice);
    if (currency) auction.currency = currency;
    if (auctionType) auction.auctionType = auctionType;
    if (reservePrice) auction.reservePrice = parseFloat(reservePrice);
    if (minimumPrice) auction.minimumPrice = parseFloat(minimumPrice);
    // Handle images
    if (req.files && req.files.images) {
      const { uploadToCloudinary } = require('../utils/cloudinary');
      let images = [];
      for (const file of req.files.images) {
        try {
          const url = await uploadToCloudinary(file.path, 'auctions/images');
          images.push(url);
        } catch (err) {
          console.error('Cloudinary image upload error:', err);
        }
      }
      auction.images = images;
    }
    // Handle video
    if (req.files && req.files.video && req.files.video[0]) {
      const { uploadToCloudinary } = require('../utils/cloudinary');
      try {
        auction.video = await uploadToCloudinary(req.files.video[0].path, 'auctions/videos', 'video');
      } catch (err) {
        console.error('Cloudinary video upload error:', err);
      }
    }
    await auction.save();
    res.json({ message: 'Auction updated successfully', auction });
  } catch (error) {
    console.error('Update auction error:', error);
    res.status(500).json({ message: 'Server error updating auction' });
  }
});

// Update end time for active auction
router.put('/:id/endtime', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Only active auctions can be updated' });
    }
    // Only seller can update
    if (auction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this auction' });
    }
  auction.endDate = req.body.endTime;
  await auction.save();
  // Update status and save winner if ended
  await auction.updateStatus();
  await saveWinnerIfEnded(auction);
  res.json({ message: 'End time updated successfully', endTime: auction.endDate });
  } catch (error) {
    console.error('Update end time error:', error);
    res.status(500).json({ message: 'Server error updating end time' });
  }
});


// Get winner notifications (auctions won by user)
router.get('/user/winner-notifications', auth, winnerController.getWinnerNotifications);

// Get user's participated bid history
router.get('/user/participated-bids', auth, bidHistoryController.getParticipatedBidHistory);

// Soft delete auction (set status to deleted)
router.delete('/:id', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    // Only seller can delete
    if (auction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this auction' });
    }
    auction.status = 'deleted';
    await auction.save();
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    console.error('Delete auction error:', error);
    res.status(500).json({ message: 'Server error deleting auction' });
  }
});

// Get auctions created by the logged-in user
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const auctions = await Auction.find({ seller: userId })
      .populate('seller', 'fullName')
      .sort('-createdAt');
    res.json(auctions);
  } catch (error) {
    console.error('Get my auctions error:', error);
    res.status(500).json({ message: 'Server error fetching your auctions' });
  }
});

// Get all auctions with filters
router.get('/', async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    
    // Build filter object
    const filter = { status: { $ne: 'deleted' } };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get auctions with pagination
  const auctions = await Auction.find(filter)
      .populate('seller', 'fullName')
      .populate('currentHighestBidder', 'fullName')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Update auction statuses based on current time
    const updatedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        await auction.updateStatus();
        return auction;
      })
    );

    // Get total count for pagination
    const total = await Auction.countDocuments(filter);

    res.json({
      auctions: updatedAuctions,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('Get auctions error:', error);
    res.status(500).json({ message: 'Server error fetching auctions' });
  }
});

// Get featured auctions for home page
router.get('/featured', async (req, res) => {
  try {
    const auctions = await Auction.find({ 
      featured: true,
      status: { $in: ['active', 'upcoming'] }
    })
      .populate('seller', 'fullName')
      .populate('currentHighestBidder', 'fullName')
      .sort('-createdAt')
      .limit(15);

    // Update auction statuses
    const updatedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        await auction.updateStatus();
        return auction;
      })
    );

    res.json(updatedAuctions);

  } catch (error) {
    console.error('Get featured auctions error:', error);
    res.status(500).json({ message: 'Server error fetching featured auctions' });
  }
});

// Get auction categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'Electronics',
      'Art',
      'Collectibles',
      'Jewelry',
      'Vehicles',
      'Fashion',
      'Home & Garden',
      'Books',
      'Automotive',
      'Other'
    ];

    // Get count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Auction.countDocuments({ 
          category,
          status: { $in: ['active', 'upcoming'], $ne: 'deleted' }
        });
        return { name: category, count };
      })
    );

    res.json(categoriesWithCount);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// Get single auction by ID
router.get('/:id', async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'fullName email profileImg')
      .populate('currentHighestBidder', 'fullName')
      .populate('bids.bidder', 'fullName');

    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Update auction status
    await auction.updateStatus();

    res.json(auction);

  } catch (error) {
    console.error('Get auction error:', error);
    res.status(500).json({ message: 'Server error fetching auction' });
  }
});

// Search auctions
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { category, page = 1, limit = 20 } = req.query;

    // Build search filter
    const filter = {
      status: { $ne: 'deleted' },
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { participationCode: { $regex: query, $options: 'i' } }
      ]
    };
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Search auctions
    const auctions = await Auction.find(filter)
      .populate('seller', 'fullName')
      .populate('currentHighestBidder', 'fullName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    // Update auction statuses
    const updatedAuctions = await Promise.all(
      auctions.map(async (auction) => {
        await auction.updateStatus();
        return auction;
      })
    );

    // Get total count
    const total = await Auction.countDocuments(filter);

    res.json({
      auctions: updatedAuctions,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      },
      query
    });

  } catch (error) {
    console.error('Search auctions error:', error);
    res.status(500).json({ message: 'Server error searching auctions' });
  }
});

// Place bid (requires authentication)
router.post('/:id/bid', auth, async (req, res) => {
  if (req.user.suspended) {
    return res.status(403).json({ message: 'Your account is suspended. You cannot participate in auctions.' });
  }
  try {
  const { amount } = req.body;
  const auctionId = req.params.id;
  const userId = req.user._id;
  const userEmail = req.user.email;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid bid amount is required' });
    }

  const auction = await Auction.findById(auctionId);
    
    if (!auction) {
      return res.status(404).json({ message: 'Auction not found' });
    }

    // Update auction status
    await auction.updateStatus();

    if (auction.status !== 'active') {
      return res.status(400).json({ message: 'Auction is not active' });
    }

    if (auction.seller.toString() === userId.toString()) {
      return res.status(400).json({ message: 'You cannot bid on your own auction' });
    }

    if (amount <= auction.currentBid) {
      return res.status(400).json({ 
        message: `Bid must be higher than current bid of $${auction.currentBid}` 
      });
    }

    if (amount < auction.currentBid + auction.bidIncrement) {
      return res.status(400).json({ 
        message: `Minimum bid increment is $${auction.bidIncrement}` 
      });
    }

    // Add bid to auction
    auction.bids.push({
      bidder: userId,
      amount: amount,
      timestamp: new Date()
    });

    // Store bid in ParticipatedBidHistory and CreatedBidHistory
    try {
      const bidHistoryController = require('../controllers/bidHistoryController');
      await bidHistoryController.addParticipatedBid(
        userId,
        userEmail,
        auctionId,
        auction.title,
        amount
      );
      // Also store bid in CreatedBidHistory for seller
      await bidHistoryController.addCreatedBid(
        auctionId,
        auction.seller,
        userId,
        amount
      );
    } catch (err) {
      console.error('Error saving bid history:', err);
    }

    // Update current bid and highest bidder
    auction.currentBid = amount;
    auction.currentHighestBidder = userId;

    await auction.save();

    // Populate the updated auction
    const updatedAuction = await Auction.findById(auctionId)
      .populate('seller', 'fullName')
      .populate('currentHighestBidder', 'fullName')
      .populate('bids.bidder', 'fullName');

  // If auction ended, save winner
  await saveWinnerIfEnded(updatedAuction);

    res.json({
      message: 'Bid placed successfully',
      auction: updatedAuction
    });

  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ message: 'Server error placing bid' });
  }
});

// Get user's bidding history
router.get('/user/bids', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const auctions = await Auction.find({
      'bids.bidder': userId
    })
      .populate('seller', 'fullName')
      .populate('currentHighestBidder', 'fullName')
      .sort('-updatedAt');

    // Filter to get user's bids and add bid info
    const userBids = auctions.map(auction => {
      const userBidsForAuction = auction.bids.filter(
        bid => bid.bidder.toString() === userId.toString()
      );
      
      const highestUserBid = userBidsForAuction.reduce((max, bid) => 
        bid.amount > max.amount ? bid : max
      );

      return {
        auction: {
          _id: auction._id,
          title: auction.title,
          image: auction.image,
          currentBid: auction.currentBid,
          status: auction.status,
          endTime: auction.endTime,
          seller: auction.seller,
          currentHighestBidder: auction.currentHighestBidder
        },
        userHighestBid: highestUserBid.amount,
        bidTime: highestUserBid.timestamp,
        isWinning: auction.currentHighestBidder && 
                  auction.currentHighestBidder._id.toString() === userId.toString()
      };
    });

    res.json(userBids);

  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({ message: 'Server error fetching user bids' });
  }
});

// Create new auction
router.post('/', auth, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  if (req.user.suspended) {
    return res.status(403).json({ message: 'Your account is suspended. You cannot create auctions.' });
  }
  try {
    const {
      auctionId,
      title,
      description,
      category,
      auctionType,
      startingPrice,
      reservePrice,
      minimumPrice,
      startDate,
      endDate,
      currency,
      participationCode
    } = req.body;

    // Validate required fields
    if (!auctionId || !title || !description || !category || !auctionType || !startingPrice || !startDate || !endDate || !currency || !participationCode) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if auction ID already exists
    const existingAuction = await Auction.findOne({ auctionId });
    if (existingAuction) {
      return res.status(400).json({ message: 'Auction ID already exists' });
    }

    // Check if participation code already exists
    const existingCode = await Auction.findOne({ participationCode });
    if (existingCode) {
      return res.status(400).json({ message: 'Participation code already exists' });
    }

    // Validate images
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    // Validate date constraints
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start <= now) {
      return res.status(400).json({ message: 'Start date must be in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Process uploaded files with Cloudinary
    const { uploadToCloudinary } = require('../utils/cloudinary');
    let images = [];
    let video = null;
    if (req.files && req.files.images) {
      for (const file of req.files.images) {
        try {
          const url = await uploadToCloudinary(file.path, 'auctions/images');
          images.push(url);
        } catch (err) {
          console.error('Cloudinary image upload error:', err);
        }
      }
    }
    if (req.files && req.files.video && req.files.video[0]) {
      try {
        video = await uploadToCloudinary(req.files.video[0].path, 'auctions/videos', 'video');
      } catch (err) {
        console.error('Cloudinary video upload error:', err);
      }
    }

    // Create auction object
    const auctionData = {
      auctionId,
      title,
      description,
      category,
      auctionType,
      images,
      video,
      startingPrice: parseFloat(startingPrice),
      startDate: start,
      endDate: end,
      seller: req.user._id,
      currency,
      participationCode
    };

    // Add auction type specific fields
    if (auctionType === 'sealed' && reservePrice) {
      auctionData.reservePrice = parseFloat(reservePrice);
    }

    if (auctionType === 'reserve' && minimumPrice) {
      auctionData.minimumPrice = parseFloat(minimumPrice);
    }

    // Create the auction
    const auction = new Auction(auctionData);
    await auction.save();

    // Populate seller information
    await auction.populate('seller', 'fullName email');

    res.status(201).json({
      message: 'Auction created successfully',
      auction
    });

  } catch (error) {
    console.error('Create auction error:', error);
    res.status(500).json({ message: 'Server error creating auction' });
  }
});

module.exports = router;
