import React, { useState, useEffect, useCallback } from 'react';
import './ImageCarousel.css';

const ImageCarousel = ({ images = [], alt = '', autoPlay = true, interval = 4000, showThumbnails = false }) => {
  const [current, setCurrent] = useState(0);
  // Track if current slide is a video
  const isCurrentVideo = /\.(mp4|webm|ogg|mov)$/i.test(images[current] || '');

  // Navigation functions
  const goPrev = useCallback(() => {
    if (!images.length) return;
    setCurrent((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    if (!images.length) return;
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // Auto-play (pause when video is selected)
  useEffect(() => {
    if (!autoPlay || !images.length || isCurrentVideo) return;
    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [goNext, autoPlay, interval, images.length, isCurrentVideo]);

  // Keyboard navigation
  useEffect(() => {
    if (!images.length) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, images.length]);

  // ✅ Now we conditionally render AFTER hooks
  if (!images.length) {
    return (
      <img 
        src="https://res.cloudinary.com/dhjbphutc/image/upload/v1755457818/no-image-found_kgenoc.png" 
        alt="No image" 
        className="auction-image" 
      />
    );
  }

  return (
    <div className="carousel-container">
      {/* Hide arrows if current is video */}
      {images.length > 1 && !isCurrentVideo && (
        <button className="carousel-btn prev" onClick={goPrev}>&lt;</button>
      )}

      <div className="carousel-slide">
        {isCurrentVideo ? (
          <video
            src={images[current].startsWith('http') ? images[current] : `http://localhost:5001/${images[current]}`}
            controls
            autoPlay
            className="auction-image fade-in"
            style={{ background: '#000', borderRadius: '12px' }}
          />
        ) : (
          <img
            src={images[current].startsWith('http') ? images[current] : `http://localhost:5001/${images[current]}`}
            alt={alt || `Slide ${current + 1}`}
            className="auction-image fade-in"
            onError={e => { e.target.src = '/placeholder-image.jpg'; }}
          />
        )}
      </div>

      {images.length > 1 && !isCurrentVideo && (
        <button className="carousel-btn next" onClick={goNext}>&gt;</button>
      )}

      <div className="carousel-indicators">
        {images.map((img, idx) => (
          <span
            key={idx}
            className={idx === current ? 'active' : ''}
            onClick={() => setCurrent(idx)}
          ></span>
        ))}
      </div>

      {showThumbnails && (
        <div className="carousel-thumbnails">
          {images.map((img, idx) => (
            /\.(mp4|webm|ogg|mov)$/i.test(img) ? (
              <video
                key={idx}
                src={img.startsWith('http') ? img : `http://localhost:5001/${img}`}
                className={`thumbnail ${idx === current ? 'active' : ''}`}
                style={{ background: '#000', borderRadius: '8px', width: '48px', height: '48px', objectFit: 'cover' }}
                muted
                preload="metadata"
                onClick={() => setCurrent(idx)}
              />
            ) : (
              <img
                key={idx}
                src={img.startsWith('http') ? img : `http://localhost:5001/${img}`}
                alt={`Thumbnail ${idx + 1}`}
                className={`thumbnail ${idx === current ? 'active' : ''}`}
                onClick={() => setCurrent(idx)}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
