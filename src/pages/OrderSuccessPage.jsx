import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Phone, Check, Package, ArrowLeft, Copy, MessageCircle } from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { formatOrderCourierText } from '../lib/orderHelper';
import { trackPurchase } from '../lib/tracking';

export default function OrderSuccessPage({ order, onReturnHome }) {
  const { siteSettings } = useCms();
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti & fire Purchase tracking on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (e) {
      console.warn('Confetti notice:', e);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ensure dataLayer & pixels fire purchase event
    if (order) {
      trackPurchase({ order, siteSettings });
    }
  }, [order, siteSettings]);

  // Clean date formatting
  const formattedDate = new Intl.DateTimeFormat('bn-BD', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  const displayOrderId = order?.order_id || 'KB-' + Date.now().toString(36).toUpperCase();
  const customerName = order?.name || 'সম্মানিত গ্রাহক';
  const customerPhone = order?.phone || '01XXXXXXXXX';
  const customerAddress = order?.address || 'বাংলাদেশ';
  const productName = order?.product_name || order?.package_name || 'ঘরোয়া খাঁটি কুমড়ো বড়ি';
  const quantity = order?.quantity || 1;
  const unit = order?.unit || 'কেজি';
  const totalPrice = order?.total_price || order?.total || '0';
  const formattedPrice = Number(totalPrice).toLocaleString('en-IN');
  const ipAddress = order?.ip_address || sessionStorage.getItem('mg_client_ip') || 'unknown';

  const handleCopyOrder = () => {
    const formattedText = formatOrderCourierText(order || {
      name: customerName,
      address: customerAddress,
      phone: customerPhone,
      product_name: productName,
      total_price: totalPrice,
      quantity
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(formattedText);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = formattedText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="success-page-shell">
      <div className="success-card-wrapper">
        <div className="success-receipt-card">
          {/* Top Warm Banner with Celebration Badge */}
          <div className="success-top-banner">
            <div className="success-check-badge">
              <Check size={34} strokeWidth={3.5} color="#ffffff" />
            </div>

            <h1 className="success-title">আপনার অর্ডারটি সফল হয়েছে!</h1>
            <p className="success-subtitle">
              ধন্যবাদ ম্যাঙ্গো গার্ডেনের সাথে থাকার জন্য। আপনার কুমড়ো বড়ির পার্সেলটি প্রস্তুত করা হচ্ছে।
            </p>
          </div>

          {/* Ticket Perforated Cut Line */}
          <div className="success-cut-line"></div>

          {/* White Invoice Section */}
          <div className="success-body">
            <div className="success-sec-heading">
              <span className="success-box-emoji">📦</span>
              <span>অর্ডারের বিস্তারিত ইনভয়েস</span>
            </div>

            <div className="success-divider"></div>

            {/* Receipt Table Rows */}
            <div className="success-rows-list">
              <div className="success-row">
                <span className="success-lbl">অর্ডার নম্বর (ID)</span>
                <span className="success-val" style={{ color: '#ea580c' }}>#{displayOrderId}</span>
              </div>

              <div className="success-row">
                <span className="success-lbl">তারিখ</span>
                <span className="success-val">{formattedDate}</span>
              </div>

              <div className="success-row">
                <span className="success-lbl">পণ্য ও প্যাকেজ</span>
                <span className="success-val">{productName} ({quantity} {unit})</span>
              </div>

              <div className="success-row">
                <span className="success-lbl">গ্রাহকের নাম</span>
                <span className="success-val">{customerName}</span>
              </div>

              <div className="success-row">
                <span className="success-lbl">মোবাইল নম্বর</span>
                <span className="success-val">{customerPhone}</span>
              </div>

              <div className="success-row">
                <span className="success-lbl">ডেলিভারি ঠিকানা</span>
                <span className="success-val" style={{ maxWidth: '65%', textAlign: 'right' }}>
                  {customerAddress}
                </span>
              </div>

              <div className="success-row">
                <span className="success-lbl">পেমেন্ট মেথড</span>
                <span className="success-val">ক্যাশ অন ডেলিভারি (হাতে পেয়ে টাকা)</span>
              </div>

              {ipAddress && ipAddress !== 'unknown' && (
                <div className="success-row" style={{ opacity: 0.7, fontSize: '12px' }}>
                  <span className="success-lbl">অর্ডার ট্র্যাকিং আইপি</span>
                  <span className="success-val" style={{ fontWeight: 500, fontFamily: 'monospace' }}>{ipAddress}</span>
                </div>
              )}
            </div>

            {/* Total Highlight Row */}
            <div className="success-total-row">
              <span className="success-total-lbl">সর্বমোট প্রদেয় টাকা</span>
              <span className="success-total-val">৳ {formattedPrice}</span>
            </div>

            {/* Important Notice Box */}
            <div className="success-notice-box">
              <div className="success-notice-icon">
                <Phone size={22} className="success-phone-icon" />
              </div>
              <div className="success-notice-text">
                <strong>জরুরি বিজ্ঞপ্তি:</strong> পার্সেল পাঠানোর পূর্বে আমাদের প্রতিনিধি আপনার নম্বরে <strong>কল করে ঠিকানা কনফার্ম করবেন।</strong>
              </div>
            </div>

            {/* One-click Copy Order Button */}
            <button
              type="button"
              className="success-copy-btn"
              onClick={handleCopyOrder}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? '✓ সম্পূর্ণ বিবরণ কপি হয়েছে!' : '📋 এক ক্লিকে অর্ডার কপি করুন'}</span>
            </button>

            {/* Return to Home CTA Button */}
            <button
              type="button"
              className="success-home-btn"
              onClick={onReturnHome}
            >
              <ArrowLeft size={18} style={{ marginRight: '6px' }} />
              <span>হোম পেজে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
