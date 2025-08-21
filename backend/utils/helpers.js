// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Validate password strength
const validatePassword = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!hasUppercase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!hasLowercase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  if (!hasSpecialChar) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }

  return { isValid: true, message: 'Password is valid' };
};

// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Format phone number to international format
const formatPhoneNumber = (phone) => {
  // Ensure phone is a string
  if (!phone) return '';
  let phoneStr = String(phone);
  // If multiple numbers separated by comma, use only the first
  if (phoneStr.includes(',')) {
    phoneStr = phoneStr.split(',')[0].trim();
  }
  // Remove all non-digit characters
  const cleaned = phoneStr.replace(/\D/g, '');
  // Add country code if not present
  // If you want to support India (+91) for 10-digit numbers, use +91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  return phoneStr; // Return as is if already formatted
};

module.exports = {
  generateOTP,
  validatePassword,
  validateEmail,
  validatePhoneNumber,
  formatPhoneNumber
};
