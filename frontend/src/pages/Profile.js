import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Save, 
  X, 
  Upload, 
  Camera,
  Calendar,
  MapPin,
  Shield,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { BadgeCheck, MailCheck, ShieldCheck } from "lucide-react"
import { useAuth } from '../utils/AuthContext';
import api from '../utils/api';

const Profile = () => {
  // Send email OTP
  const handleSendEmailOtp = async () => {
    setVerifying(true);
    try {
      await api.post('/auth/resend-email-verification');
      setEmailOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      toast.error('Failed to send email OTP');
    }
    setVerifying(false);
  };
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // OTP verification states
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [showPhoneOtpInput, setShowPhoneOtpInput] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtpVerified, setPhoneOtpVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // Verify email OTP
  const handleVerifyEmailOtp = async () => {
    setVerifying(true);
    try {
      const res = await api.post('/auth/verify-email', { otp: emailOtp });
      if (res.data.message && res.data.message.toLowerCase().includes('success')) {
        setEmailOtpVerified(true);
        toast.success('Email verified successfully');
        setShowEmailOtpInput(false);
        // Refetch user profile to update verification status
        const profileRes = await api.get('/auth/profile');
        updateUser(profileRes.data);
      } else {
        toast.error(res.data.message || 'Failed to verify email');
      }
    } catch (err) {
      toast.error('Failed to verify email');
    }
    setVerifying(false);
  };

  // Send phone OTP
  const handleSendPhoneOtp = async () => {
    setVerifying(true);
    try {
      await api.post('/auth/resend-phone-verification');
      setPhoneOtpSent(true);
      toast.success('OTP sent to your phone number');
    } catch (err) {
      toast.error('Failed to send phone OTP');
    }
    setVerifying(false);
  };

  // Verify phone OTP
  const handleVerifyPhoneOtp = async () => {
    setVerifying(true);
    try {
      const res = await api.post('/auth/verify-phone', { otp: phoneOtp });
      if (res.data.message && res.data.message.toLowerCase().includes('success')) {
        setPhoneOtpVerified(true);
        toast.success('Phone verified successfully!');
        updateUser({ ...user, phoneVerified: true });
        setShowPhoneOtpInput(false);
      } else {
        toast.error('Invalid OTP');
      }
    } catch (err) {
      toast.error('Failed to verify phone OTP');
    }
    setVerifying(false);
  };

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      bio: user?.bio || '',
      location: user?.location || ''
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
        location: user.location || ''
      });
      
          if (user.profileImg) {
            // If profileImg is a Cloudinary URL, use it directly
            if (user.profileImg.startsWith('http')) {
              setImagePreview(user.profileImg);
            } else {
              setImagePreview(`http://localhost:5001/${user.profileImg.startsWith('uploads/') ? user.profileImg : 'uploads/' + user.profileImg}`);
            }
          }
    }
  }, [user, reset]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmitProfile = async (data) => {
    try {
      const formData = new FormData();
      
      // Add form data
      Object.keys(data).forEach(key => {
        if (data[key] !== user[key]) {
          formData.append(key, data[key]);
        }
      });

      // Add profile image if changed
      if (profileImage) {
        formData.append('profileImg', profileImage);
      }

      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setProfileImage(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      toast.success('Password changed successfully!');
      resetPassword();
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileImage(null);
    if (user?.profileImg) {
      if (user.profileImg.startsWith('http')) {
        setImagePreview(user.profileImg);
      } else {
        setImagePreview(`http://localhost:5001/${user.profileImg.startsWith('uploads/') ? user.profileImg : 'uploads/' + user.profileImg}`);
      }
    } else {
      setImagePreview(null);
    }
    reset({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1 className="page-title">
            <User className="page-icon" />
            My Profile
          </h1>
          <p className="page-subtitle">
            Manage your account settings and personal information
          </p>
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="profile-image"
                    />
                  ) : (
                    <img 
                      src="https://ui-avatars.com/api/?name=User&background=cccccc&color=555555&size=128" 
                      alt="Default Profile" 
                      className="profile-image"
                    />
                  )}
                  
                  {isEditing && (
                    <div className="image-upload-overlay">
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="file-input"
                      />
                      <label htmlFor="profileImage" className="image-upload-btn">
                        <Camera className="upload-icon" />
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="profile-info">
                  <h2 className="profile-name">{user?.fullName}</h2>
                  <p className="profile-email">{user?.email}</p>
                  <div className="profile-meta">
                    <span className="meta-item">
                      <Calendar className="meta-icon" />
                      Joined {new Date(user?.createdAt).toLocaleDateString()}
                    </span>
                    {user?.location && (
                      <span className="meta-item">
                        <MapPin className="meta-icon" />
                        {user.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-btn"
                  >
                    <Edit className="btn-icon" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button
                      onClick={cancelEdit}
                      className="cancel-btn"
                    >
                      <X className="btn-icon" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit(onSubmitProfile)} className="profile-form">
              <div className="form-sections">
                <div className="form-section">
                  <h3 className="section-title">Personal Information</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <User className="label-icon" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        disabled={!isEditing}
                        {...register('fullName', {
                          required: 'Full name is required',
                          minLength: { value: 2, message: 'Name must be at least 2 characters' }
                        })}
                      />
                      {errors.fullName && <span className="error-message">{errors.fullName.message}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <Mail className="label-icon" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        disabled={!isEditing}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.email && <span className="error-message">{errors.email.message}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <Phone className="label-icon" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        disabled={!isEditing}
                        {...register('phoneNumber', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[+]?[1-9][\d\s\-\(\)]{8,}$/,
                            message: 'Invalid phone number'
                          }
                        })}
                      />
                      {errors.phoneNumber && <span className="error-message">{errors.phoneNumber.message}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <MapPin className="label-icon" />
                        Location
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="City, Country"
                        disabled={!isEditing}
                        {...register('location')}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <User className="label-icon" />
                      Bio
                    </label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      placeholder="Tell us about yourself..."
                      disabled={!isEditing}
                      {...register('bio', {
                        maxLength: { value: 500, message: 'Bio must be less than 500 characters' }
                      })}
                    />
                    {errors.bio && <span className="error-message">{errors.bio.message}</span>}
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Account Verification</h3>
                  <div className="verification-status">
                    <div className="verification-item">
                      <div className="verification-info">
                        <Mail className="verification-icon" />
                        <span>Email Verification</span>
                      </div>
                      <div className={`verification-badge ${user?.isEmailVerified ? 'verified' : 'pending'}`}>
                        {user?.isEmailVerified ? 'Verified' : 'Pending'}
                      </div>
                    </div>

                    <div className="verification-item">
                      <div className="verification-info">
                        <Phone className="verification-icon" />
                        <span>Phone Verification</span>
                      </div>
                      <div className={`verification-badge ${user?.isPhoneVerified ? 'verified' : 'pending'}`}>
                        {user?.isPhoneVerified ? 'Verified' : 'Pending'}
                      </div>
                    </div>
                  </div>
                  {/* Verify Profile Button and OTP UI */}
                  {(!user?.isEmailVerified || !user?.isPhoneVerified) && (
                    <div style={{ marginTop: '1rem' }}>
                      {/* Email Verification */}
                      {!user?.isEmailVerified && !showEmailOtpInput && (
                        <button className="verify-profile-btn" onClick={() => { setShowEmailOtpInput(true); handleSendEmailOtp(); }} disabled={verifying}>
                          <BadgeCheck className="badge-icon" />
                          Verify Profile
                        </button>
                      )}
                      {showEmailOtpInput && (
                        <div className="otp-verification-block">
                          <label htmlFor="email-otp-input">Enter Email OTP:</label>
                          <input
                            id="email-otp-input"
                            type="text"
                            value={emailOtp}
                            onChange={e => setEmailOtp(e.target.value)}
                            maxLength={6}
                            style={{ marginRight: '1rem' }}
                          />
                          <button className="verify-otp-btn" onClick={handleVerifyEmailOtp} disabled={verifying || emailOtp.length !== 6}>
                            Verify Email OTP
                          </button>
                          <button className="verify-otp-btn" style={{marginLeft: '0.5rem', background: '#f59e42'}} onClick={handleSendEmailOtp} disabled={verifying}>
                            Resend OTP
                          </button>
                        </div>
                      )}
                      {/* Phone Verification */}
                      {user?.isEmailVerified && !user?.isPhoneVerified && !showPhoneOtpInput && (
                        <button className="verify-profile-btn" onClick={() => { setShowPhoneOtpInput(true); handleSendPhoneOtp(); }} disabled={verifying}>
                          <BadgeCheck className="badge-icon" />
                          Verify Phone
                        </button>
                      )}
                      {showPhoneOtpInput && (
                        <div className="otp-verification-block">
                          <label htmlFor="phone-otp-input">Enter Phone OTP:</label>
                          <input
                            id="phone-otp-input"
                            type="text"
                            value={phoneOtp}
                            onChange={e => setPhoneOtp(e.target.value)}
                            maxLength={6}
                            style={{ marginRight: '1rem' }}
                          />
                          <button className="verify-otp-btn" onClick={handleVerifyPhoneOtp} disabled={verifying || phoneOtp.length !== 6}>
                            Verify Phone OTP
                          </button>
                          <button className="verify-otp-btn" style={{marginLeft: '0.5rem', background: '#f59e42'}} onClick={handleSendPhoneOtp} disabled={verifying}>
                            Resend OTP
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={isSubmitting}
                  >
                    <Save className="btn-icon" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security Settings */}
          <div className="security-card">
            <div className="card-header">
              <h3 className="card-title">
                <Shield className="card-icon" />
                Security Settings
              </h3>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="toggle-btn"
              >
                <Settings className="btn-icon" />
                Change Password
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit(onSubmitPassword)} className="password-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <div className="password-input-container">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="form-input"
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required'
                      })}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {passwordErrors.currentPassword && (
                    <span className="error-message">{passwordErrors.currentPassword.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className="form-input"
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                          message: 'Password must contain uppercase, lowercase, number and special character'
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <span className="error-message">{passwordErrors.newPassword.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="password-input-container">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: value => value === newPassword || 'Passwords do not match'
                      })}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <span className="error-message">{passwordErrors.confirmPassword.message}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      resetPassword();
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={isPasswordSubmitting}
                  >
                    {isPasswordSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
