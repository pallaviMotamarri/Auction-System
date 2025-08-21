// Initialize Twilio client only if credentials are provided
let client = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  const twilio = require('twilio');
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Send SMS OTP
const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    if (!client) {
      console.log('SMS service not configured. SMS would be sent to:', phoneNumber, 'with OTP:', otp);
      return { success: true, messageId: 'development-mode' };
    }
    // Format phone number to E.164
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith('+')) {
      // Default to India country code if not present, change as needed
      formattedNumber = '+91' + formattedNumber.replace(/^0+/, '');
    }
    const message = await client.messages.create({
      body: `Your Auction System verification code is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset SMS
const sendPasswordResetSMS = async (phoneNumber, otp) => {
  try {
    if (!client) {
      console.log('SMS service not configured. Password reset SMS would be sent to:', phoneNumber, 'with OTP:', otp);
      return { success: true, messageId: 'development-mode' };
    }
    // Format phone number to E.164
    let formattedNumber = phoneNumber;
    if (!formattedNumber.startsWith('+')) {
      // Default to India country code if not present, change as needed
      formattedNumber = '+91' + formattedNumber.replace(/^0+/, '');
    }
    const message = await client.messages.create({
      body: `Your Auction System password reset code is: ${otp}. This code will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber
    });
    return { success: true, messageId: message.sid };
  } catch (error) {
    console.error('SMS sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMSOTP,
  sendPasswordResetSMS
};
