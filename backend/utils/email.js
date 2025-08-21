const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, token, fullName) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email service not configured. Verification email would be sent to:', email, 'with OTP:', token);
    return { success: true, messageId: 'development-mode' };
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification - Auction System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Auction System!</h2>
        <p>Hello ${fullName},</p>
        <p>Thank you for registering with us. Please verify your email address by entering the following OTP:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h3 style="color: #007bff; font-size: 24px; margin: 0;">${token}</h3>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Auction System Team</p>
      </div>
    `
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, fullName) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email service not configured. Password reset email would be sent to:', email, 'with OTP:', token);
    return { success: true, messageId: 'development-mode' };
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset - Auction System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${fullName},</p>
        <p>You requested to reset your password. Please use the following OTP to reset your password:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h3 style="color: #dc3545; font-size: 24px; margin: 0;">${token}</h3>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Auction System Team</p>
      </div>
    `
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send contact form notification to admin
const sendContactNotification = async (contactData) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email service not configured. Contact notification would be sent with data:', contactData);
    return { success: true, messageId: 'development-mode' };
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `New Contact Form Submission: ${contactData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Phone:</strong> ${contactData.phone}</p>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
        <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p>${contactData.message}</p>
        </div>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
      </div>
    `
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactNotification
};
