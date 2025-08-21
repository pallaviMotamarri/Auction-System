const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const { sendContactNotification } = require('../utils/email');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Submit contact form
router.post('/submit', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters')
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

    const { name, email, phone, subject, message } = req.body;

    // Create contact entry
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    await contact.save();

    // Send notification email to admin
    try {
      await sendContactNotification({
        name,
        email,
        phone,
        subject,
        message
      });
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      message: 'Your message has been sent successfully. We will get back to you soon.',
      contactId: contact._id
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({ message: 'Server error submitting contact form' });
  }
});

// Get all contact messages (Admin only)
router.get('/messages', auth, adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get contact messages with pagination
    const messages = await Contact.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Contact.countDocuments(filter);

    // Get statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      new: 0,
      read: 0,
      replied: 0
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      messages,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      },
      stats: statusStats
    });

  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ message: 'Server error fetching contact messages' });
  }
});

// Get single contact message (Admin only)
router.get('/messages/:id', auth, adminAuth, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Mark as read if it's new
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }

    res.json(message);

  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({ message: 'Server error fetching contact message' });
  }
});

// Update contact message status (Admin only)
router.patch('/messages/:id', auth, adminAuth, [
  body('status').isIn(['new', 'read', 'replied']).withMessage('Invalid status'),
  body('adminNotes').optional().trim().isLength({ max: 500 }).withMessage('Admin notes must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, adminNotes } = req.body;
    
    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    if (status) message.status = status;
    if (adminNotes !== undefined) message.adminNotes = adminNotes;

    await message.save();

    res.json({
      message: 'Contact message updated successfully',
      contact: message
    });

  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({ message: 'Server error updating contact message' });
  }
});

// Delete contact message (Admin only)
router.delete('/messages/:id', auth, adminAuth, async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({ message: 'Contact message deleted successfully' });

  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ message: 'Server error deleting contact message' });
  }
});

// Get contact form statistics (Admin only)
router.get('/stats/overview', auth, adminAuth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get total messages in period
    const totalMessages = await Contact.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Get messages by status
    const statusBreakdown = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get messages by day
    const dailyMessages = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Calculate response rate
    const respondedMessages = await Contact.countDocuments({
      createdAt: { $gte: startDate },
      status: 'replied'
    });

    const responseRate = totalMessages > 0 ? ((respondedMessages / totalMessages) * 100).toFixed(1) : 0;

    res.json({
      period: `${period} days`,
      totalMessages,
      responseRate: `${responseRate}%`,
      statusBreakdown,
      dailyMessages
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ message: 'Server error fetching contact statistics' });
  }
});

module.exports = router;
