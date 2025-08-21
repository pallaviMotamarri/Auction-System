import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Clock, DollarSign, Hash, Gavel } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../utils/AuthContext';
import ImageCarousel from './ImageCarousel';

const AuctionCard = ({ auction }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Map currency code to locale and symbol
  const currencyLocaleMap = {
    USD: { locale: 'en-US', symbol: '$' },
    EUR: { locale: 'de-DE', symbol: '€' },
    INR: { locale: 'en-IN', symbol: '₹' },
    GBP: { locale: 'en-GB', symbol: '£' },
    JPY: { locale: 'ja-JP', symbol: '¥' },
    CNY: { locale: 'zh-CN', symbol: '¥' },
    CAD: { locale: 'en-CA', symbol: '$' },
    AUD: { locale: 'en-AU', symbol: '$' },
    CHF: { locale: 'de-CH', symbol: 'CHF' },
    SGD: { locale: 'en-SG', symbol: '$' },
    NZD: { locale: 'en-NZ', symbol: '$' },
    ZAR: { locale: 'en-ZA', symbol: 'R' },
    BRL: { locale: 'pt-BR', symbol: 'R$' },
    RUB: { locale: 'ru-RU', symbol: '₽' },
    KRW: { locale: 'ko-KR', symbol: '₩' },
    HKD: { locale: 'zh-HK', symbol: 'HK$' },
    MXN: { locale: 'es-MX', symbol: '$' },
    SEK: { locale: 'sv-SE', symbol: 'kr' },
    NOK: { locale: 'nb-NO', symbol: 'kr' },
    TRY: { locale: 'tr-TR', symbol: '₺' },
    SAR: { locale: 'ar-SA', symbol: '﷼' },
    AED: { locale: 'ar-AE', symbol: 'د.إ' },
    PLN: { locale: 'pl-PL', symbol: 'zł' },
    THB: { locale: 'th-TH', symbol: '฿' },
    IDR: { locale: 'id-ID', symbol: 'Rp' },
    MYR: { locale: 'ms-MY', symbol: 'RM' },
    PHP: { locale: 'en-PH', symbol: '₱' },
    VND: { locale: 'vi-VN', symbol: '₫' },
    EGP: { locale: 'ar-EG', symbol: 'ج.م' },
    PKR: { locale: 'en-PK', symbol: '₨' },
    BDT: { locale: 'bn-BD', symbol: '৳' },
    Other: { locale: 'en-US', symbol: '' }
  };
const getCurrencyInfo = (currency) => currencyLocaleMap[currency] || { locale: 'en-US', symbol: '' };

  const formatPrice = (price) => {
    const { locale, symbol } = getCurrencyInfo(auction.currency);
    if (!auction.currency || auction.currency === 'Other') {
      return `${symbol}${price}`;
    }
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: auction.currency
    }).format(price);
  };

  const formatTimeLeft = (auction) => {
    const now = new Date();
    let target;
    let label = '';
    if (auction.status === 'upcoming') {
      target = new Date(auction.startTime || auction.startDate);
      label = 'Starts in';
    } else {
      target = new Date(auction.endTime || auction.endDate);
      label = 'Ends in';
    }
    if (!target || isNaN(target.getTime())) return 'Unknown';
    const diff = target - now;
    if (diff <= 0) return auction.status === 'upcoming' ? 'Started' : 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${label} ${days}d ${hours}h`;
    if (hours > 0) return `${label} ${hours}h ${minutes}m`;
    return `${label} ${minutes}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'upcoming': return 'status-upcoming';
      case 'ended': return 'status-ended';
      default: return 'status-default';
    }
  };

  return (
    <div className="auction-card">
      <div className="auction-image-container">
        {/* Combine images and video for carousel */}
        <ImageCarousel
          images={[...(auction.images || (auction.image ? [auction.image] : [])), ...(auction.video ? [auction.video] : [])]}
          alt={auction.title}
        />
        <div className={`auction-status ${getStatusColor(auction.status)}`}>
          {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
        </div>
        {auction.featured && (
          <div className="featured-badge">
            Featured
          </div>
        )}
      </div>

      <div className="auction-content">
        <h3 className="auction-title">{auction.title}</h3>
        {/* <div className='auction-meta'>
         <p className="auction-category">{auction.category}</p>
        <span className="bid-count">{auction.bids?.length || 0} bids</span>
        </div> */}

        <div className="auction-stats">
          <div className="stat-item">
            <span className="stat-label">
              {/* <DollarSign className="stat-icon" size={14} /> */}
              Current Bid
            </span>
            <span className="stat-value price">{formatPrice(auction.currentBid)}</span>
          </div>

          <div className="stat-item">
            <span className="stat-label">
              <Clock className="stat-icon" size={14} />
              Time Left
            </span>
            <span className="stat-value">{formatTimeLeft(auction)}</span>
          </div>

          <div className="stat-item full-width">
            <span className="stat-label">
              <Hash className="stat-icon" size={14} />
              Participation Code
            </span>
            <span className="stat-value">{auction.participationCode || '-'}</span>
          </div>

          {/* <div className="stat-item full-width">
            <span className="stat-label">
              <Gavel className="stat-icon" size={14} />
              Auction Type
            </span>
            <span className="stat-value">
              {auction.auctionType ? 
                auction.auctionType.charAt(0).toUpperCase() + auction.auctionType.slice(1) : 
                '-'}
            </span>
          </div> */}
        </div>

        <div className="auction-footer">
          <div className="bid-info">
            
            <span className="seller-info">by {auction.seller?.fullName}</span>
          </div>
          
          <button
            className="view-btn"
            onClick={() => {
              if (!user) {
                toast.info('Please login to view auction details');
                navigate('/login', { state: { redirectTo: `/auction/${auction._id}` } });
              } else {
                navigate(`/auction/${auction._id}`);
              }
            }}
          >
            {/* <Eye className="btn-icon" size={16} /> */}
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;