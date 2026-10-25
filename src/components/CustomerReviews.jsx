import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, ShieldCheck, ZoomIn, X, ThumbsUp } from 'lucide-react';

const reviews = [
  {
    id: 1,
    image: '/img/review-2.jpg',
    customer: 'ফেসবুক ভেরিফাইড ক্রেতা',
    comment: 'অসংখ্য ধন্যবাদ বড়িগুলো ভাঙেনি সুন্দরভাবে পার্সেল পাঠানোর জন্য ❤️',
    highlight: '🛡️ অক্ষত ও সর্বোচ্চ সেফটি প্যাকেজিং',
    tag: 'ভাঙেনি পার্সেল',
    stars: 5
  },
  {
    id: 2,
    image: '/img/review-1.jpg',
    customer: 'ফেসবুক ভেরিফাইড ক্রেতা',
    comment: 'ধন্যবাদ দাদা আজকে হাতে পেলাম কোনো সমস্যা নেই 👍',
    highlight: '🌿 আসল ঘ্রাণ ও খাঁটি ঘরোয়া বড়ির স্বাদ',
    tag: 'নিখুঁত ডেলিভারি',
    stars: 5
  },
  {
    id: 3,
    image: '/img/review-3.jpg',
    customer: 'ফেসবুক ভেরিফাইড ক্রেতা',
    comment: 'পার্সেল হাতে পেয়েছি, কুমড়ো বড়ি ও ডাল দুটির মানই চমৎকার!',
    highlight: '📦 সময়মতো ক্যাশ অন ডেলিভারি',
    tag: 'ঘরোয়া খাঁটি বড়ি ও ডাল',
    stars: 5
  }
];

const bnDigits = '০১২৩৪৫৬৭৮৯';
const toBn = (n) => String(n).replace(/\d/g, (d) => bnDigits[d]);

export default function CustomerReviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [zoomImg, setZoomImg] = useState(null);

  // Auto-slide every 4.5s (pauses on hover or modal zoom)
  useEffect(() => {
    if (isHovered || zoomImg) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, zoomImg]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % reviews.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const scrollToOrder = () => {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="section reviews-section" id="reviews">
      <div className="sec-head">
        <span className="eyebrow">💬 আসল কাস্টমার রিভিউ</span>
        <h2>সম্মানিত গ্রাহকদের বাস্তব অভিজ্ঞতা</h2>
        <p>হাতে পাওয়া পার্সেল ও ইনবক্সে পাঠানো গ্রাহকদের সন্তুষ্টির বাস্তব চিত্র</p>
      </div>

      {/* Trust Highlights Badges */}
      <div className="reviews-trust-bar">
        <div className="trust-pill">
          <ShieldCheck size={16} className="trust-icon" />
          <span>১০০% বাস্তব স্ক্রিনশট</span>
        </div>
        <div className="trust-pill">
          <Star size={16} className="trust-icon star-filled" />
          <span>৫/৫ কাস্টমার সন্তুষ্টি</span>
        </div>
        <div className="trust-pill">
          <ThumbsUp size={16} className="trust-icon" />
          <span>ভাঙার ভয়হীন সেফটি প্যাক</span>
        </div>
      </div>

      {/* Main Slider Carousel */}
      <div
        className="reviews-carousel-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        <button
          type="button"
          className="slider-nav-btn prev-btn"
          onClick={prevSlide}
          aria-label="পূর্ববর্তী রিভিউ"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          type="button"
          className="slider-nav-btn next-btn"
          onClick={nextSlide}
          aria-label="পরবর্তী রিভিউ"
        >
          <ChevronRight size={22} />
        </button>

        {/* Sliding Track */}
        <div className="reviews-carousel-window">
          <div
            className="reviews-carousel-track"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {reviews.map((r, index) => (
              <div className="review-slide" key={r.id}>
                <div className="review-card">
                  {/* Screenshot Container with Click-to-Zoom */}
                  <div
                    className="review-img-box"
                    onClick={() => setZoomImg(r.image)}
                    title="ক্লিক করে বড় করে দেখুন"
                  >
                    <img
                      src={r.image}
                      alt={`কাস্টমার রিভিউ ${index + 1}`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      className="review-screenshot-img"
                    />
                    <div className="review-zoom-badge">
                      <ZoomIn size={14} />
                      <span>বড় করে দেখুন</span>
                    </div>
                  </div>

                  {/* Customer Quote Box */}
                  <div className="review-details">
                    <div className="review-stars-row">
                      <div className="review-stars">
                        {[...Array(r.stars)].map((_, i) => (
                          <Star key={i} size={15} className="star-icon-gold" />
                        ))}
                      </div>
                      <span className="review-verified-pill">✓ ভেরিফাইড রিভিউ</span>
                    </div>

                    <p className="review-quote">“{r.comment}”</p>

                    <div className="review-meta">
                      <span className="review-tag-badge">{r.highlight}</span>
                      <small className="review-customer-name">{r.customer}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counter and Dots Controls */}
        <div className="slider-controls-footer">
          <div className="slider-dots">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`slider-dot ${currentIndex === i ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
                aria-label={`স্লাইড ${i + 1}`}
              />
            ))}
          </div>
          <span className="slider-counter-pill">
            {toBn(currentIndex + 1)} / {toBn(reviews.length)}
          </span>
        </div>
      </div>

      {/* Quick Order CTA under reviews */}
      <div className="reviews-bottom-cta">
        <button
          type="button"
          className="btn btn-soft"
          onClick={scrollToOrder}
        >
          <span>অর্ডার করতে নিচের ফর্মটি পূরণ করুন ↓</span>
        </button>
      </div>

      {/* Lightbox Modal (Click to View Full Resolution) */}
      {zoomImg && (
        <div
          className="review-lightbox-modal"
          onClick={() => setZoomImg(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="review-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setZoomImg(null)}
              aria-label="বন্ধ করুন"
            >
              <X size={24} />
            </button>
            <img
              src={zoomImg}
              alt="কাস্টমার রিভিউ বড় স্ক্রিনশট"
              className="lightbox-img"
            />
          </div>
        </div>
      )}
    </section>
  );
}
