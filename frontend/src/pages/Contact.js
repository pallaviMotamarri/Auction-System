import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import api from '../utils/api';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/contact/submit', data);
      toast.success('Message sent successfully! We will get back to you soon.');
      reset();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">
            Have questions or need support? We're here to help!
          </p>
        </div>
      </section>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2 className="info-title">
                <MessageCircle className="title-icon" />
                Contact Information
              </h2>
              <p className="info-description">
                Reach out to us through any of the following channels. 
                We're available 24/7 to assist you with your auction needs.
              </p>

              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon">
                    <Mail />
                  </div>
                  <div className="method-content">
                    <h3>Email</h3>
                    <p>support@auctionhub.com</p>
                    <span className="method-note">Response within 24 hours</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <Phone />
                  </div>
                  <div className="method-content">
                    <h3>Phone</h3>
                    <p>+1 (555) 123-4567</p>
                    <span className="method-note">Mon-Fri 9 AM - 6 PM EST</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="method-icon">
                    <MapPin />
                  </div>
                  <div className="method-content">
                    <h3>Address</h3>
                    <p>123 Auction Street<br />New York, NY 10001</p>
                    <span className="method-note">Visit us during business hours</span>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-list">
                  <div className="faq-item">
                    <strong>How do I place a bid?</strong>
                    <p>Simply register, verify your account, and click on any auction to place your bid.</p>
                  </div>
                  <div className="faq-item">
                    <strong>Is my personal information secure?</strong>
                    <p>Yes, we use advanced encryption and security measures to protect all user data.</p>
                  </div>
                  <div className="faq-item">
                    <strong>What payment methods do you accept?</strong>
                    <p>We accept all major credit cards, PayPal, and bank transfers.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <h2 className="form-title">
                <Send className="title-icon" />
                Send us a Message
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder="Enter your full name"
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        },
                        maxLength: {
                          value: 100,
                          message: 'Name must be less than 100 characters'
                        }
                      })}
                    />
                    {errors.name && (
                      <span className="error-message">{errors.name.message}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your email address"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address'
                        }
                      })}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email.message}</span>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      className={`form-input ${errors.phone ? 'error' : ''}`}
                      placeholder="Enter your phone number"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[\+]?[\d\s\-\(\)]{10,}$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                    />
                    {errors.phone && (
                      <span className="error-message">{errors.phone.message}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className={`form-input ${errors.subject ? 'error' : ''}`}
                      placeholder="Enter message subject"
                      {...register('subject', {
                        required: 'Subject is required',
                        minLength: {
                          value: 5,
                          message: 'Subject must be at least 5 characters'
                        },
                        maxLength: {
                          value: 200,
                          message: 'Subject must be less than 200 characters'
                        }
                      })}
                    />
                    {errors.subject && (
                      <span className="error-message">{errors.subject.message}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows="6"
                    className={`form-textarea ${errors.message ? 'error' : ''}`}
                    placeholder="Enter your message here..."
                    {...register('message', {
                      required: 'Message is required',
                      minLength: {
                        value: 10,
                        message: 'Message must be at least 10 characters'
                      },
                      maxLength: {
                        value: 1000,
                        message: 'Message must be less than 1000 characters'
                      }
                    })}
                  ></textarea>
                  {errors.message && (
                    <span className="error-message">{errors.message.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="btn-spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="btn-icon" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
