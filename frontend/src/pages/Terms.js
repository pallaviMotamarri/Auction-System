import React from 'react';

const Terms = () => (
  <div className="terms-page" style={{maxWidth:700,margin:'2rem auto',background:'#fff',borderRadius:12,padding:'2rem 2.5rem',boxShadow:'0 2px 12px rgba(45,127,249,0.08)'}}>
    <h2 style={{color:'#2d7ff9',fontWeight:700,marginBottom:'1.5rem'}}>Terms of Use</h2>
    <ol style={{color:'#222',fontSize:'1.1rem',lineHeight:1.7}}>
      <li>Register with valid email and phone number to participate in auctions.</li>
      <li>Verify your account via OTP before bidding or creating auctions.</li>
      <li>Browse auctions by category, status, or search keywords.</li>
      <li>Place bids on active auctions and track your bid history.</li>
      <li>Only the highest bidder at auction end will be notified as winner.</li>
      <li>Contact sellers or support for any queries regarding items or transactions.</li>
      <li>Respect all users and avoid fraudulent activities.</li>
      <li>All payments and communications must be made through the platform.</li>
      <li>Read and accept privacy policy and terms before using Auction Hub.</li>
    </ol>
  </div>
);

export default Terms;
