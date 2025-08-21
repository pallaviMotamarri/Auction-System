const mongoose = require('mongoose');
const Auction = require('./models/Auction');
const User = require('./models/User');
require('dotenv').config();

async function seedAuctions() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Find a seller (first user)
  const seller = await User.findOne();
  if (!seller) {
    console.error('No user found to assign as seller. Please register a user first.');
    process.exit(1);
  }

  // Remove existing auctions
  await Auction.deleteMany({});

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Collectibles', 'Art', 'Books', 'Music', 'Toys', 'Automotive', 'Other'];
  const auctionTypes = ['english', 'dutch', 'sealed', 'reserve'];

  const auctions = Array.from({ length: 30 }).map((_, i) => ({
    auctionId: `AUCT${1000 + i}`,
    title: `Sample Auction ${i + 1}`,
    description: `This is a description for Sample Auction ${i + 1}.`,
    category: categories[i % categories.length],
    auctionType: auctionTypes[i % auctionTypes.length],
    images: ["/uploads/auctions/sample.jpg"],
    startingPrice: 100 + i * 10,
    reservePrice: i % 4 === 3 ? 200 + i * 10 : null,
    minimumPrice: i % 4 === 2 ? 120 + i * 10 : null,
    bidIncrement: 10,
    startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i % 5)),
    endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * ((i % 5) + 1)),
    seller: seller._id,
    status: 'active',
    featured: i % 5 === 0,
  }));

  await Auction.insertMany(auctions);
  console.log('Seeded 30 auctions successfully!');
  process.exit(0);
}

seedAuctions();
