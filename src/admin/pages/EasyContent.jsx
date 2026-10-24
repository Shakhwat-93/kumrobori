import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Smartphone, Type, MessageSquare, Tag } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export default function EasyContent() {
  const { siteSettings, updateSiteSettings, homepageSections, updateHomepageSection, products, saveProduct, showToast } = useCms();
  const [saving, setSaving] = useState(false);

  const heroSec = homepageSections.find((s) => s.id === 'hero');
  const heroCfg = heroSec?.config || {};

  // Local state for all content
  const [formData, setFormData] = useState({
    store_name: '',
    tagline: '',
    announcement_text: '',
    phone_1: '',
    phone_2: '',
    whatsapp_number: '',
    hero_headline: '',
    hero_subheadline: ''
  });

  const [package1Price, setPackage1Price] = useState({ price: 750, compare: 1150 });
  const [package2Price, setPackage2Price] = useState({ price: 1200, compare: 1500 });

  useEffect(() => {
    if (siteSettings) {
      setFormData({
        store_name: siteSettings.store_name || 'ম্যাঙ্গো গার্ডেন',
        tagline: siteSettings.tagline || '',
        announcement_text: siteSettings.announcement_text || '',
        phone_1: siteSettings.phone_1 || '',
        phone_2: siteSettings.phone_2 || '',
        whatsapp_number: siteSettings.whatsapp_number || '',
        hero_headline:
          heroCfg.headline ||
          'সকল ধরনের চুলকানি ও এলা-র্জি ভেতর থেকে দূর করে, আপনাকে দিবে দীর্ঘস্থায়ী সমাধান',
        hero_subheadline: heroCfg.subheadline || '১ম দিন থেকেই পরিবর্তন বুঝতে পারবেন'
      });
    }

    if (products && products.length >= 2) {
      setPackage1Price({
        price: products[0].price || 750,
        compare: products[0].compare_at_price || 1150
      });
      setPackage2Price({
        price: products[1].price || 1200,
        compare: products[1].compare_at_price || 1500
      });
    }
  }, [siteSettings, heroCfg.headline, heroCfg.subheadline, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Save Site Settings
      await updateSiteSettings({
        store_name: formData.store_name,
        tagline: formData.tagline,
        announcement_text: formData.announcement_text,
        phone_1: formData.phone_1,
        phone_2: formData.phone_2,
        whatsapp_number: formData.whatsapp_number
      });

      // 2. Save Hero Headline in Homepage Sections
      if (heroSec) {
        await updateHomepageSection('hero', {
          config: {
            ...heroCfg,
            headline: formData.hero_headline,
            subheadline: formData.hero_subheadline
          }
        });
      }

      // 3. Save Products Prices
      if (products && products[0]) {
        await saveProduct({
          ...products[0],
          price: parseFloat(package1Price.price) || products[0].price,
          compare_at_price: parseFloat(package1Price.compare) || products[0].compare_at_price
        });
      }
      if (products && products[1]) {
        await saveProduct({
          ...products[1],
          price: parseFloat(package2Price.price) || products[1].price,
          compare_at_price: parseFloat(package2Price.compare) || products[1].compare_at_price
        });
      }

      showToast('Content & pricing updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to save content settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="easy-page-wrap">
      <div className="easy-card-header">
        <h2 className="easy-page-title">Content & Offers Setup</h2>
        <p className="easy-page-desc">
          Update your store headline, top announcement ticker, package prices, and support contact numbers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="easy-form-stack">
        {/* Section 1: Hero Banner & Headline */}
        <div className="easy-subcard">
          <div className="easy-section-head">
            <Type size={18} className="text-orange" />
            <h3>Hero Banner & Headlines</h3>
          </div>

          <div className="easy-field-group">
            <label>Hero Headline (Primary Offer Text)</label>
            <textarea
              rows={2}
              className="easy-input"
              value={formData.hero_headline}
              onChange={(e) => setFormData({ ...formData, hero_headline: e.target.value })}
              placeholder="সকল ধরনের চুলকানি ও এলা-র্জি ভেতর থেকে দূর করে..."
              required
            />
          </div>

          <div className="easy-field-group">
            <label>Subtitle / Guarantee Text</label>
            <input
              type="text"
              className="easy-input"
              value={formData.hero_subheadline}
              onChange={(e) => setFormData({ ...formData, hero_subheadline: e.target.value })}
              placeholder="১ম দিন থেকেই পরিবর্তন বুঝতে পারবেন"
            />
          </div>

          <div className="easy-field-group">
            <label>Top Announcement Ticker Notice</label>
            <input
              type="text"
              className="easy-input"
              value={formData.announcement_text}
              onChange={(e) => setFormData({ ...formData, announcement_text: e.target.value })}
              placeholder="🌿 ১০০% ভেষজ ফর্মুলা ★ সারা দেশে ফ্রি হোম ডেলিভারি!"
            />
          </div>
        </div>

        {/* Section 2: Contact & Helpline */}
        <div className="easy-subcard">
          <div className="easy-section-head">
            <Smartphone size={18} className="text-orange" />
            <h3>Customer Support & Helpline</h3>
          </div>

          <div className="easy-two-col">
            <div className="easy-field-group">
              <label>Helpline Phone 1</label>
              <input
                type="text"
                className="easy-input"
                value={formData.phone_1}
                onChange={(e) => setFormData({ ...formData, phone_1: e.target.value })}
                placeholder="01604-939479"
              />
            </div>
            <div className="easy-field-group">
              <label>Helpline Phone 2 (Alternative)</label>
              <input
                type="text"
                className="easy-input"
                value={formData.phone_2}
                onChange={(e) => setFormData({ ...formData, phone_2: e.target.value })}
                placeholder="01859-020608"
              />
            </div>
          </div>

          <div className="easy-field-group">
            <label>WhatsApp Number (With country code)</label>
            <input
              type="text"
              className="easy-input"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              placeholder="8801604939479"
            />
            <span className="easy-field-hint">Customers can tap to chat directly on WhatsApp.</span>
          </div>
        </div>

        {/* Section 3: Package Pricing */}
        <div className="easy-subcard">
          <div className="easy-section-head">
            <Tag size={18} className="text-orange" />
            <h3>Package Pricing & Offers</h3>
          </div>

          <div className="easy-package-box">
            <div className="easy-pkg-title">Package 1: 1 Bottle (1 Month Course)</div>
            <div className="easy-two-col">
              <div className="easy-field-group">
                <label>Sale Price (৳)</label>
                <input
                  type="number"
                  className="easy-input"
                  value={package1Price.price}
                  onChange={(e) => setPackage1Price({ ...package1Price, price: e.target.value })}
                />
              </div>
              <div className="easy-field-group">
                <label>Regular / Strikethrough Price (৳)</label>
                <input
                  type="number"
                  className="easy-input"
                  value={package1Price.compare}
                  onChange={(e) => setPackage1Price({ ...package1Price, compare: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="easy-package-box" style={{ marginTop: '16px' }}>
            <div className="easy-pkg-title">Package 2: 2 Bottles (2 Months Full Course)</div>
            <div className="easy-two-col">
              <div className="easy-field-group">
                <label>Sale Price (৳)</label>
                <input
                  type="number"
                  className="easy-input"
                  value={package2Price.price}
                  onChange={(e) => setPackage2Price({ ...package2Price, price: e.target.value })}
                />
              </div>
              <div className="easy-field-group">
                <label>Regular / Strikethrough Price (৳)</label>
                <input
                  type="number"
                  className="easy-input"
                  value={package2Price.compare}
                  onChange={(e) => setPackage2Price({ ...package2Price, compare: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="easy-submit-wrap">
          <button type="submit" className="easy-save-btn" disabled={saving}>
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Content Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
