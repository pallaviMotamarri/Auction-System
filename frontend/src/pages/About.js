import React from 'react';
import { Shield, Users, Award, Zap, CheckCircle, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <h1 className="about-title">About Auction Hub</h1>
          <p className="about-subtitle">
            Your trusted platform for secure, transparent, and exciting online auctions
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Our Mission</h2>
              <p>
                At Auction Hub, we're revolutionizing the way people buy and sell unique items. 
                Our mission is to create a secure, transparent, and exciting marketplace where 
                everyone can discover amazing deals and connect with fellow enthusiasts.
              </p>
              <p>
                We believe that every item has a story, and every auction is an opportunity 
                to find something special. Whether you're a collector, a bargain hunter, or 
                someone looking to sell treasured items, we're here to make your experience 
                exceptional.
              </p>
            </div>
            <div className="mission-image">
              <div className="image-placeholder">
                <img style={{ width: '100%',height:"100%", borderRadius: '12px' }} src="https://res.cloudinary.com/dhjbphutc/image/upload/v1755540732/auction__about_us_u8ujcg.jpg" alt="Our Mission" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Auction Hub?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3>Secure Transactions</h3>
              <p>
                Advanced security measures and verified user accounts ensure 
                safe and secure transactions for all users.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3>Trusted Community</h3>
              <p>
                Join thousands of verified buyers and sellers in our 
                trustworthy and supportive auction community.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Award />
              </div>
              <h3>Quality Assurance</h3>
              <p>
                All items are carefully reviewed and verified to ensure 
                authenticity and quality standards.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Globe />
              </div>
              <h3>Global Reach</h3>
              <p>
                Connect with buyers and sellers from around the world, 
                expanding your auction opportunities.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Zap />
              </div>
              <h3>Real-time Bidding</h3>
              <p>
                Experience the thrill of live auctions with real-time 
                bidding and instant notifications.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <CheckCircle />
              </div>
              <h3>Easy to Use</h3>
              <p>
                User-friendly interface makes it simple to browse, bid, 
                and manage your auction activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Register & Verify</h3>
                <p>
                  Create your account and verify your email and phone number 
                  for secure access to all auction features.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Browse & Discover</h3>
                <p>
                  Explore thousands of auctions across various categories 
                  and find items that interest you.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Bid & Win</h3>
                <p>
                  Place your bids on items you want and track your progress 
                  in real-time until the auction ends.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Pay & Receive</h3>
                <p>
                  Complete secure payment for won items and receive them 
                  through our trusted delivery network.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Our Story</h2>
          <div className="story-content">
            <p>
              Founded in 2025, Auction Hub was born from a simple idea on fixing the end to end project title : make online 
              auctions more accessible, secure, and enjoyable for everyone. Our team — Pallavi, Nivas, Venky, and Arun 
             a group of passionate developers and auction enthusiasts, worked to 
              create a platform that combines cutting-edge technology with the timeless 
              excitement of auctions.
            </p>
            <p>
              Today, We're constantly innovating and improving 
              our platform to serve our community better.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Auction Journey?</h2>
            <p>
              Join Hundreds of satisfied users and discover amazing deals today!
            </p>
            <div className="cta-buttons">
              <a href="/register" className="cta-btn primary">
                Get Started
              </a>
              <a href="/contact" className="cta-btn secondary">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
