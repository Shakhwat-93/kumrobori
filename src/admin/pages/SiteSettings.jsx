import React, { useState } from 'react';
import { Settings, Check, Phone, MessageSquare, Shield, Bell, Clock } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export default function SiteSettings() {
  const { siteSettings, updateSiteSettings } = useCms();

  const [formData, setFormData] = useState({
    store_name: siteSettings?.store_name || 'Herbheez BD',
    tagline: siteSettings?.tagline || '',
    logo_url: siteSettings?.logo_url || '/images/herbheez-logo.webp',
    favicon_url: siteSettings?.favicon_url || '/images/herbheez-logo.webp',
    phone_1: siteSettings?.phone_1 || '01604-939479',
    phone_2: siteSettings?.phone_2 || '01859-020608',
    whatsapp_number: siteSettings?.whatsapp_number || '8801604939479',
    email: siteSettings?.email || 'support@herbheezbd.net',
    address: siteSettings?.address || 'ঢাকা, বাংলাদেশ',
    announcement_text: siteSettings?.announcement_text || '',
    announcement_enabled: siteSettings?.announcement_enabled ?? true,
    free_shipping_text: siteSettings?.free_shipping_text || 'সারা দেশে ফ্রি ডেলিভারি',
    cod_notice: siteSettings?.cod_notice || '',
    timer_enabled: siteSettings?.timer_enabled ?? true,
    timer_duration_hours: siteSettings?.timer_duration_hours || 2
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateSiteSettings(formData);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
            ওয়েবসাইট ও স্টোর সেটিংস (General Settings)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--adm-text-subdued)', margin: '2px 0 0 0' }}>
            ব্র্যান্ডিং, লোগো, ফোন নম্বর, হোয়াটসঅ্যাপ, নোটিশ ও পলিসি নিয়ন্ত্রণ করুন
          </p>
        </div>

        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
          <Check size={16} />
          <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সেভ করুন'}</span>
        </button>
      </div>

      <div className="adm-grid-2">
        {/* 1. Brand & Identity */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">১. ব্র্যান্ড আইডেন্টিটি ও লোগো</h3>
          </div>
          <div className="adm-card-body">
            <div className="adm-form-group">
              <label className="adm-label">স্টোরের নাম (Store Name) *</label>
              <input
                type="text"
                name="store_name"
                className="adm-input"
                value={formData.store_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">ট্যাগলাইন / স্লোগান (Tagline)</label>
              <input
                type="text"
                name="tagline"
                className="adm-input"
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">লোগো ইমেজ URL (Logo URL)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <img
                  src={formData.logo_url}
                  alt="Logo"
                  style={{ width: 36, height: 36, objectFit: 'contain', background: '#fff', border: '1px solid var(--adm-border)', borderRadius: 6, padding: 2 }}
                />
                <input
                  type="text"
                  name="logo_url"
                  className="adm-input"
                  value={formData.logo_url}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">ফ্যাভিকন URL (Favicon URL)</label>
              <input
                type="text"
                name="favicon_url"
                className="adm-input"
                value={formData.favicon_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* 2. Contact & Helpline */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">২. হেল্পলাইন ও যোগাযোগ</h3>
          </div>
          <div className="adm-card-body">
            <div className="adm-form-group">
              <label className="adm-label">হেল্পলাইন ফোন ১ (Primary Phone)</label>
              <input
                type="text"
                name="phone_1"
                className="adm-input"
                placeholder="যেমন: 01604-939479"
                value={formData.phone_1}
                onChange={handleChange}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">হেল্পলাইন ফোন ২ (Secondary Phone)</label>
              <input
                type="text"
                name="phone_2"
                className="adm-input"
                placeholder="যেমন: 01859-020608"
                value={formData.phone_2}
                onChange={handleChange}
              />
            </div>

            <div className="adm-form-group">
              <label className="adm-label">হোয়াটসঅ্যাপ নম্বর (WhatsApp Country Code সহ)</label>
              <input
                type="text"
                name="whatsapp_number"
                className="adm-input"
                placeholder="যেমন: 8801604939479"
                value={formData.whatsapp_number}
                onChange={handleChange}
              />
              <div className="adm-hint">গ্রাহক ফ্লোটিং বাটনে ক্লিক করলে সরাসরি চ্যাট শুরু হবে</div>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">ইমেইল ও অফিস ঠিকানা</label>
              <input
                type="text"
                name="email"
                className="adm-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* 3. Announcement Marquee */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">৩. টপ নোটিফিকেশন বার (Announcement Bar)</h3>
          </div>
          <div className="adm-card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <input
                type="checkbox"
                id="announcement_enabled"
                name="announcement_enabled"
                checked={formData.announcement_enabled}
                onChange={handleChange}
              />
              <label htmlFor="announcement_enabled" style={{ fontSize: '13.5px', cursor: 'pointer', fontWeight: 500 }}>
                সাইটের শীর্ষে এনাউন্সমেন্ট বার চালু রাখুন
              </label>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">স্ক্রোলিং টেক্সট মেসেজ</label>
              <textarea
                name="announcement_text"
                className="adm-textarea"
                rows={3}
                value={formData.announcement_text}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* 4. COD & Countdown Notice */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">৪. ক্যাশ অন ডেলিভারি ও কাউন্টডাউন</h3>
          </div>
          <div className="adm-card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <input
                type="checkbox"
                id="timer_enabled"
                name="timer_enabled"
                checked={formData.timer_enabled}
                onChange={handleChange}
              />
              <label htmlFor="timer_enabled" style={{ fontSize: '13.5px', cursor: 'pointer', fontWeight: 500 }}>
                অর্ডার ফর্মে অফার কাউন্টডাউন টাইমার দেখান
              </label>
            </div>

            <div className="adm-form-group">
              <label className="adm-label">ক্যাশ অন ডেলিভারি ইসলামিক সতর্কতা টেক্সট</label>
              <textarea
                name="cod_notice"
                className="adm-textarea"
                rows={4}
                value={formData.cod_notice}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
