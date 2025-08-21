const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');
const { sendSMSOTP, sendPasswordResetSMS } = require('../utils/sms');
const { generateOTP, validatePassword, validateEmail, validatePhoneNumber, formatPhoneNumber } = require('../utils/helpers');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');

const router = express.Router();


// Test email and SMS sending
router.post('/test-send', async (req, res) => {
  const { email, phone, name } = req.body;
  const testEmailOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const testPhoneOTP = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const emailResult = await require('../utils/email').sendVerificationEmail(email, testEmailOTP, name || 'Test User');
    const smsResult = await require('../utils/sms').sendSMSOTP(phone, testPhoneOTP);
    res.json({
      message: 'Test email and SMS sent',
      emailResult,
      smsResult,
      testEmailOTP,
      testPhoneOTP
    });
  } catch (error) {
    res.status(500).json({ message: 'Test send failed', error: error.message });
  }
});

// Register user
router.post('/register', upload.single('profileImg'), [
  body('fullName').trim().isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phoneNumber').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('password').custom((value) => {
    const validation = validatePassword(value);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    return true;
  })
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or phone number'
      });
    }

    // Generate unique UID
    const uid = User.generateUID();

    // Generate OTP for email and phone verification
    const emailOTP = generateOTP();
    const phoneOTP = generateOTP();

    // Create user
      let profileImgUrl = null;
      if (req.file) {
        const { uploadToCloudinary } = require('../utils/cloudinary');
        try {
          profileImgUrl = await uploadToCloudinary(req.file.path, 'profiles');
        } catch (err) {
          console.error('Cloudinary upload error:', err);
        }
      }
      const user = new User({
        uid,
        fullName,
        email,
        phoneNumber: formatPhoneNumber(phoneNumber),
        password,
        profileImg: profileImgUrl,
        emailVerificationToken: emailOTP,
        phoneVerificationToken: phoneOTP,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        phoneVerificationExpires: new Date(Date.now() + 10 * 60 * 1000)
      });

      await user.save();

    // Send verification email and SMS
    try {
      await sendVerificationEmail(email, emailOTP, fullName);
      await sendSMSOTP(formatPhoneNumber(phoneNumber), phoneOTP);
    } catch (error) {
      console.error('Error sending verification:', error);
      // Continue registration even if verification fails
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully. Please verify your email and phone number.',
      token,
      user: {
        id: user._id,
        uid: user.uid,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImg: user.profileImg,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        crownScore: user.crownScore
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Verify email
router.post('/verify-email', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  // Allow re-verification even if already verified

    if (user.emailVerificationToken !== otp || new Date() > user.emailVerificationExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// Verify phone
router.post('/verify-phone', auth, async (req, res) => {
  try {
    const { otp } = req.body;
    
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({ message: 'Phone is already verified' });
    }

    if (user.phoneVerificationToken !== otp || new Date() > user.phoneVerificationExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationToken = null;
    user.phoneVerificationExpires = null;
    await user.save();

    res.json({ message: 'Phone verified successfully' });

  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ message: 'Server error during phone verification' });
  }
});

// Resend verification email
router.post('/resend-email-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  // Always allow sending OTP for re-verification

    const emailOTP = generateOTP();
    user.emailVerificationToken = emailOTP;
    user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, emailOTP, user.fullName);

    res.json({ message: 'Verification email sent successfully' });

  } catch (error) {
    console.error('Resend email verification error:', error);
    res.status(500).json({ message: 'Server error sending verification email' });
  }
});

// Resend verification SMS
router.post('/resend-phone-verification', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  // Always allow sending OTP for re-verification

    const phoneOTP = generateOTP();
    user.phoneVerificationToken = phoneOTP;
    user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendSMSOTP(user.phoneNumber, phoneOTP);

    res.json({ message: 'Verification SMS sent successfully' });

  } catch (error) {
    console.error('Resend phone verification error:', error);
    res.status(500).json({ message: 'Server error sending verification SMS' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        uid: user.uid,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profileImg: user.profileImg,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        role: user.role,
        crownScore: user.crownScore
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Forgot password - request reset
router.post('/forgot-password', [
  body('identifier').notEmpty().withMessage('Email or phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier } = req.body;

    // Check if identifier is email or phone
    let user;
    if (validateEmail(identifier)) {
      user = await User.findOne({ email: identifier });
    } else if (validatePhoneNumber(identifier)) {
      user = await User.findOne({ phoneNumber: formatPhoneNumber(identifier) });
    } else {
      return res.status(400).json({ message: 'Please provide a valid email or phone number' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = generateOTP();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send reset token via email or SMS
    try {
      if (validateEmail(identifier)) {
        await sendPasswordResetEmail(user.email, resetToken, user.fullName);
      } else {
        await sendPasswordResetSMS(user.phoneNumber, resetToken);
      }
    } catch (error) {
      console.error('Error sending reset token:', error);
      return res.status(500).json({ message: 'Error sending reset token' });
    }

    res.json({ 
      message: 'Password reset token sent successfully',
      method: validateEmail(identifier) ? 'email' : 'sms'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
});

// Reset password
router.post('/reset-password', [
  body('identifier').notEmpty().withMessage('Email or phone number is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword').custom((value) => {
    const validation = validatePassword(value);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier, otp, newPassword } = req.body;

    // Find user by email or phone
    let user;
    if (validateEmail(identifier)) {
      user = await User.findOne({ email: identifier });
    } else if (validatePhoneNumber(identifier)) {
      user = await User.findOne({ phoneNumber: formatPhoneNumber(identifier) });
    } else {
      return res.status(400).json({ message: 'Please provide a valid email or phone number' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify reset token
    if (user.passwordResetToken !== otp || new Date() > user.passwordResetExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, upload.single('profileImg'), async (req, res) => {
  try {
    const { fullName, email, phoneNumber, bio, location } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
      user.isEmailVerified = false; // Require re-verification if email changes
    }

    // Check if phone number is being changed and is already taken
    if (phoneNumber && phoneNumber !== user.phoneNumber) {
      const existingUser = await User.findOne({ phoneNumber });
      if (existingUser) {
        return res.status(400).json({ message: 'Phone number is already in use' });
      }
      user.phoneNumber = phoneNumber;
      user.isPhoneVerified = false; // Require re-verification if phone changes
    }

    // Update other fields
    if (fullName) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;

    // Handle profile image upload
    if (req.file) {
      const { uploadToCloudinary } = require('../utils/cloudinary');
      try {
        user.profileImg = await uploadToCloudinary(req.file.path, 'profiles');
      } catch (err) {
        console.error('Cloudinary upload error:', err);
      }
    }

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        message: 'New password must be at least 8 characters long and contain uppercase, lowercase, number and special character' 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

module.exports = router;
