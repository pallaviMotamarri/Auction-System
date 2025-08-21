import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { KeyRound, Mail, Phone, Lock, Send, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [identifier, setIdentifier] = useState('');
  const [method, setMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const newPassword = watch('newPassword');

  const validatePassword = (value) => {
    const minLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    if (!minLength) return 'Password must be at least 8 characters long';
    if (!hasUppercase) return 'Password must contain at least one uppercase letter';
    if (!hasLowercase) return 'Password must contain at least one lowercase letter';
    if (!hasNumber) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    
    return true;
  };

  const onRequestOTP = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: data.identifier
      });
      
      setIdentifier(data.identifier);
      setMethod(response.data.method);
      setStep(2);
      toast.success(`OTP sent successfully via ${response.data.method}!`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetPassword = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        identifier,
        otp: data.otp,
        newPassword: data.newPassword
      });
      
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setStep(1);
    setIdentifier('');
    setMethod('');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <KeyRound className="auth-icon" />
            <h1 className="auth-title">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="auth-subtitle">
              {step === 1 
                ? 'Enter your email or phone number to receive a reset code'
                : `Enter the OTP sent to your ${method === 'email' ? 'email' : 'phone'}`
              }
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit(onRequestOTP)} className="auth-form">
              <div className="form-group">
                <label htmlFor="identifier" className="form-label">
                  <Mail className="label-icon" />
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  id="identifier"
                  className={`form-input ${errors.identifier ? 'error' : ''}`}
                  placeholder="Enter your email or phone number"
                  {...register('identifier', {
                    required: 'Email or phone number is required'
                  })}
                />
                {errors.identifier && (
                  <span className="error-message">{errors.identifier.message}</span>
                )}
                <p className="form-hint">
                  We'll send you a verification code to reset your password
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Send className="btn-icon" />
                    Send Reset Code
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onResetPassword)} className="auth-form">
              <div className="reset-info">
                <div className="reset-method">
                  {method === 'email' ? <Mail className="method-icon" /> : <Phone className="method-icon" />}
                  <span>Code sent to {method === 'email' ? 'email' : 'phone'}: {identifier}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="otp" className="form-label">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  className={`form-input ${errors.otp ? 'error' : ''}`}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  {...register('otp', {
                    required: 'Verification code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Please enter a valid 6-digit code'
                    }
                  })}
                />
                {errors.otp && (
                  <span className="error-message">{errors.otp.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  <Lock className="label-icon" />
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className={`form-input ${errors.newPassword ? 'error' : ''}`}
                  placeholder="Enter new password"
                  {...register('newPassword', {
                    required: 'New password is required',
                    validate: validatePassword
                  })}
                />
                {errors.newPassword && (
                  <span className="error-message">{errors.newPassword.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  <Lock className="label-icon" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm new password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: value => value === newPassword || 'Passwords do not match'
                  })}
                />
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword.message}</span>
                )}
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li className={newPassword.length >= 8 ? 'valid' : ''}>
                      At least 8 characters long
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>
                      One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>
                      One lowercase letter
                    </li>
                    <li className={/\d/.test(newPassword) ? 'valid' : ''}>
                      One number
                    </li>
                    <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'valid' : ''}>
                      One special character
                    </li>
                  </ul>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleBack}
                  className="back-btn"
                >
                  <ArrowLeft className="btn-icon" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <KeyRound className="btn-icon" />
                      Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="auth-link">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-features">
          <h3>Account Security</h3>
          <ul className="features-list">
            <li>Secure password reset process</li>
            <li>OTP verification via email or SMS</li>
            <li>Strong password requirements</li>
            <li>Account protection measures</li>
            <li>24/7 security monitoring</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
