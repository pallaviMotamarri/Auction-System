# Online Auction System - MERN Stack

A comprehensive online auction platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring advanced authentication, real-time bidding, file uploads, and responsive design.

## 🚀 Features

### User Authentication
- **Registration** with email and phone OTP verification
- **Secure Login** with JWT authentication
- **Password Reset** via email/phone OTP
- **Profile Image Upload** using Multer
- **Password Security** with bcrypt hashing and validation

### Auction Management
- **Create Auctions** with detailed information
- **Browse Auctions** with search and filtering
- **Real-time Bidding** system
- **Auction Categories** for better organization
- **Time-based Auction** status management

### User Experience
- **Responsive Design** for all devices
- **Interactive UI** with React components
- **Real-time Notifications** via React Toastify
- **Form Validation** with React Hook Form
- **Professional Styling** with custom CSS

### Communication
- **Contact Form** with admin management
- **Email Notifications** via Nodemailer
- **SMS Notifications** via Twilio
- **Admin Dashboard** capabilities

## 🛠 Technology Stack

### Frontend
- **React** 18.2.0 - UI library
- **React Router DOM** 6.15.0 - Client-side routing
- **React Hook Form** 7.45.4 - Form management
- **Axios** 1.5.0 - HTTP client
- **React Toastify** 9.1.3 - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service
- **Twilio** - SMS service

## 📁 Project Structure

```
KKEK/
├── backend/
│   ├── models/
│   │   ├── User.js          # User schema with authentication
│   │   ├── Auction.js       # Auction schema with bidding
│   │   └── Contact.js       # Contact form schema
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   ├── auction.js       # Auction management
│   │   └── contact.js       # Contact form handling
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   └── upload.js        # File upload configuration
│   ├── utils/
│   │   ├── jwt.js           # JWT utilities
│   │   ├── email.js         # Email service functions
│   │   ├── sms.js           # SMS service functions
│   │   └── helpers.js       # Validation helpers
│   ├── uploads/             # File storage directory
│   ├── package.json         # Backend dependencies
│   └── server.js            # Express server configuration
├── frontend/
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js    # Navigation component
│   │   │   ├── Footer.js    # Footer component
│   │   │   └── AuctionCard.js # Auction display card
│   │   ├── pages/
│   │   │   ├── Home.js      # Landing page
│   │   │   ├── About.js     # About page
│   │   │   ├── Contact.js   # Contact form page
│   │   │   ├── Login.js     # Login page
│   │   │   ├── Register.js  # Registration page
│   │   │   ├── ForgotPassword.js # Password reset
│   │   │   └── AuctionDetails.js # Auction details
│   │   ├── utils/
│   │   │   ├── AuthContext.js # Authentication context
│   │   │   └── api.js       # API configuration
│   │   ├── styles/
│   │   │   ├── index.css    # Global styles
│   │   │   └── App.css      # Component styles
│   │   └── App.js           # Main application component
│   └── package.json         # Frontend dependencies
└── README.md                # Project documentation
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Create .env file with the following variables:
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/auction-system
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=your-twilio-phone-number
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

### Database Setup

1. **Ensure MongoDB is running** (local installation or MongoDB Atlas)
2. **The application will automatically create collections** when first used
3. **Database will be created** as specified in MONGODB_URI

## 🌐 API Endpoints

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/verify-phone` - Phone verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Auction Routes
- `GET /api/auctions` - Get all auctions
- `POST /api/auctions` - Create new auction
- `GET /api/auctions/:id` - Get auction details
- `PUT /api/auctions/:id` - Update auction
- `DELETE /api/auctions/:id` - Delete auction
- `POST /api/auctions/:id/bid` - Place bid

### Contact Routes
- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all messages (admin)
- `PUT /api/contact/:id` - Update message status

## 📱 Usage

### For Users
1. **Register** with email and phone verification
2. **Browse auctions** on the home page
3. **Search and filter** auctions by category
4. **View auction details** and bidding history
5. **Place bids** on active auctions
6. **Manage profile** and uploaded images

### For Auction Creators
1. **Create new auctions** with detailed information
2. **Upload images** for auction items
3. **Set starting prices** and auction duration
4. **Monitor bidding** activity
5. **Manage auction** status

### For Administrators
1. **Review contact** form submissions
2. **Manage user** accounts and auctions
3. **Monitor system** activity
4. **Handle disputes** and issues

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcrypt
- **Input Validation** on all forms and API endpoints
- **File Upload Security** with type and size restrictions
- **OTP Verification** for email and phone
- **CORS Configuration** for secure cross-origin requests
- **Environment Variables** for sensitive data

## 🎨 Design Features

- **Responsive Design** for mobile, tablet, and desktop
- **Modern UI** with clean and professional styling
- **Interactive Elements** with hover effects and transitions
- **Consistent Branding** throughout the application
- **Accessible Components** with proper semantic HTML
- **Loading States** and error handling

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables in your hosting platform
2. Configure MongoDB Atlas for production database
3. Update CORS settings for your frontend domain
4. Deploy with your chosen platform

### Frontend Deployment (Netlify/Vercel)
1. Build the React application: `npm run build`
2. Deploy the build folder to your hosting platform
3. Configure environment variables for API endpoints
4. Set up proper redirects for React Router

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team via the contact form
- Check the documentation for common solutions

## 🔄 Future Enhancements

- Real-time chat between buyers and sellers
- Advanced search with filters and sorting
- Payment gateway integration
- Mobile application development
- Analytics dashboard for auction insights
- Social media integration
- Email newsletter subscription
- Multi-language support

---

**Built with ❤️ using the MERN Stack**
