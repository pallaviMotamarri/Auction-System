import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Envelope } from 'phosphor-react';
const Footer = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category) => {
    navigate(`/?category=${encodeURIComponent(category)}`);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <Gavel className="logo-icon" />
              <span>Auction Hub</span>
            </div>
            <p className="footer-description">
              Your trusted platform for online auctions. Discover amazing deals 
              and bid on unique items from verified sellers worldwide.
            </p>
            {/* <div className="social-links">
              <a href="#" className="social-link" aria-label="Facebook">
                <Facebook />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <Twitter />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <Instagram />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <Linkedin />
              </a>
            </div> */}

          <div className="dev-team">
            <p className="footer-description">Developed by</p>
            <div className="dev-links">
              <span></span>
                  <a href="https://www.linkedin.com/in/pallavi-motamarri-3350b226a/" target="_blank">👩‍💻 Pallavi</a>
                  <span>|</span>
                  <a href="https://www.linkedin.com/in/venkatesh-mamidala-17b38426a/" target="_blank">👨‍💻 Venky</a>
                  <br/>
                  <a href="https://www.linkedin.com/in/nivas-sharma-77441b362/" target="_blank">👨‍💻 Nivas</a>
                  <span>|</span>
                  <a href="https://github.com/Arun3001c" target="_blank">👨‍💻 Arun</a>
            </div>
          </div>

          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-title">Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/about">How It Works</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              {/* <li><a href="#">Privacy Policy</a></li> */}
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3 className="footer-title">Categories</h3>
            <ul className="footer-links">
              <li><button className="footer-link-btn" onClick={() => handleCategoryClick('Electronics')}>Electronics</button></li>
              <li><button className="footer-link-btn" onClick={() => handleCategoryClick('Art')}>Art & Collectibles</button></li>
              <li><button className="footer-link-btn" onClick={() => handleCategoryClick('Jewelry')}>Jewelry</button></li>
              <li><button className="footer-link-btn" onClick={() => handleCategoryClick('Vehicles')}>Vehicles</button></li>
              <li><button className="footer-link-btn" onClick={() => handleCategoryClick('Fashion')}>Fashion</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-title">Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                {/* <Mail className="contact-icon" /> */}
                 {/* <Envelope size={32} color="blue" weight="fill" /> */}
                <span>arunk330840@gmail.com</span>
              </div>
              {/* <div className="contact-item">
                <Phone className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </div> */}
              <div className="contact-item">
                <MapPin className="contact-icon" />
                <span>1-32 vvit college road, Namburu 522508</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        {/* <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; 2024 Auction Hub. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
