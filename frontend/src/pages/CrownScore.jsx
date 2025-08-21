import React from 'react';
import { useAuth } from '../utils/AuthContext';
import { Crown } from 'lucide-react';
import './CrownScore.css';


const restrictions = [
  { threshold: 95, message: 'Cannot join reserved auctions if score < 95' },
  { threshold: 90, message: 'Cannot join first placed sealed bid auctions if score < 90' },
  { threshold: 85, message: 'Cannot create auctions if score < 85' },
  { threshold: 80, message: 'Cannot join any auction if score < 80' },
];

function getRestrictionMessages(score) {
  return restrictions
    .filter(r => score < r.threshold)
    .map(r => r.message);
}

export default function CrownScore() {
  const { user } = useAuth();
  const score = user?.crownScore ?? 100;
  const messages = getRestrictionMessages(score);

  return (
    <div className="crown-score-container">
      <div className="crown-score-header">
        <Crown size={32} color="#f5b700" />
        <h2>Crown Score</h2>
      </div>
      <div className="crown-score-value">
        <span className="score">{score}</span>
        <span className="score-label">/ 100</span>
      </div>
      <div className="crown-score-info">
        <p>Your Crown Score determines your auction privileges:</p>
        <ul>
          <li>Score starts at <strong>100</strong></li>
          <li>If score <strong>&lt; 95</strong>: Cannot join reserved auctions</li>
          <li>If score <strong>&lt; 90</strong>: Cannot join first placed sealed bid auctions</li>
          <li>If score <strong>&lt; 85</strong>: Cannot create auctions</li>
          <li>If score <strong>&lt; 80</strong>: Cannot join any auction</li>
        </ul>
      </div>
      {messages.length > 0 && (
        <div className="crown-score-restrictions">
          <h3>Current Restrictions</h3>
          <ul>
            {messages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
