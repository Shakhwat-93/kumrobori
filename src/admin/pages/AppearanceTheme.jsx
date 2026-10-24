import React, { useState } from 'react';
import { Palette, Check, RotateCcw } from 'lucide-react';
import { useCms, DEFAULT_THEME_SETTINGS } from '../../context/CmsContext';

export default function AppearanceTheme() {
  const { themeSettings, updateThemeSettings } = useCms();

  const [theme, setTheme] = useState({
    primary_color: themeSettings?.primary_color || '#0a8d49',
    secondary_color: themeSettings?.secondary_color || '#055e31',
    accent_color: themeSettings?.accent_color || '#f59e0b',
    bg_color: themeSettings?.bg_color || '#f8fafc',
    text_color: themeSettings?.text_color || '#111827',
    heading_font: themeSettings?.heading_font || 'Noto Serif Bengali',
    body_font: themeSettings?.body_font || 'Anek Bangla',
    border_radius: themeSettings?.border_radius || '12px',
    button_style: themeSettings?.button_style || 'rounded'
  });

  const [saving, setSaving] = useState(false);

  const colorPresets = [
    { label: 'ভেষজ সবুজ', primary: '#0a8d49', secondary: '#055e31' },
    { label: 'রয়েল ব্লু', primary: '#1d4ed8', secondary: '#1e3a8a' },
    { label: 'মেরুন লাল', primary: '#991b1b', secondary: '#7f1d1d' },
    { label: 'অভিজাত ডার্ক', primary: '#0f172a', secondary: '#020617' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTheme((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyPreset = (p) => {
    setTheme((prev) => ({
      ...prev,
      primary_color: p.primary,
      secondary_color: p.secondary
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await updateThemeSettings(theme);
    setSaving(false);
  };

  const handleReset = async () => {
    setTheme(DEFAULT_THEME_SETTINGS);
    await updateThemeSettings(DEFAULT_THEME_SETTINGS);
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            থিম ও রূপসজ্জা সেটিংস (Theme & Appearance)
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)', margin: '2px 0 0 0' }}>
            ব্র্যান্ডের কালার প্যালেট, ফন্ট ও স্টাইলিং কাস্টমাইজ করুন
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="adm-btn adm-btn-sm" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>ডিফল্ট</span>
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-sm adm-btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            <Check size={15} />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সেভ করুন'}</span>
          </button>
        </div>
      </div>

      <div className="adm-two-col-2-1">
        {/* Left Settings Column */}
        <div>
          {/* Quick Color Presets */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">১. রেডিমেড ব্র্যান্ড কালার প্রিসেট</h3>
            </div>
            <div className="adm-card-body">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {colorPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="adm-btn adm-btn-sm"
                    onClick={() => handleApplyPreset(preset)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 10px'
                    }}
                  >
                    <span
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: preset.primary,
                        display: 'inline-block'
                      }}
                    />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Color Pickers */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">২. কাস্টম কালার প্যালেট</h3>
            </div>
            <div className="adm-card-body">
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-label">প্রাইমারি কালার (Primary Brand Color)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="primary_color"
                      value={theme.primary_color}
                      onChange={handleChange}
                      style={{ width: '40px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      name="primary_color"
                      className="adm-input"
                      value={theme.primary_color}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">সেকেন্ডারি কালার (Secondary Dark)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="secondary_color"
                      value={theme.secondary_color}
                      onChange={handleChange}
                      style={{ width: '40px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      name="secondary_color"
                      className="adm-input"
                      value={theme.secondary_color}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">অ্যাকসেন্ট গোল্ড কালার (Accent)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="accent_color"
                      value={theme.accent_color}
                      onChange={handleChange}
                      style={{ width: '40px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      name="accent_color"
                      className="adm-input"
                      value={theme.accent_color}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">পেজের ব্যাকগ্রাউন্ড (Page Background)</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="bg_color"
                      value={theme.bg_color}
                      onChange={handleChange}
                      style={{ width: '40px', height: '36px', padding: 0, border: 'none', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      name="bg_color"
                      className="adm-input"
                      value={theme.bg_color}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Settings */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">৩. টাইপোগ্রাফি ও ফন্ট (Typography)</h3>
            </div>
            <div className="adm-card-body">
              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-label">হেডিং ফন্ট (Heading Font)</label>
                  <select
                    name="heading_font"
                    className="adm-select"
                    value={theme.heading_font}
                    onChange={handleChange}
                  >
                    <option value="Noto Serif Bengali">Noto Serif Bengali (অভিজাত ও ন্যাচারাল)</option>
                    <option value="Hind Siliguri">Hind Siliguri (ক্লিন ও পরিষ্কার)</option>
                    <option value="Anek Bangla">Anek Bangla (আধুনিক ও বোল্ড)</option>
                  </select>
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">বডি টেক্সট ফন্ট (Body Text Font)</label>
                  <select
                    name="body_font"
                    className="adm-select"
                    value={theme.body_font}
                    onChange={handleChange}
                  >
                    <option value="Anek Bangla">Anek Bangla (সহজপাঠ্য)</option>
                    <option value="Hind Siliguri">Hind Siliguri (প্রমিত বাংলা)</option>
                    <option value="Noto Serif Bengali">Noto Serif Bengali</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Column */}
        <div>
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">লাইভ প্রিভিউ (Live Preview)</h3>
            </div>
            <div
              className="adm-card-body"
              style={{
                background: theme.bg_color,
                borderRadius: '0 0 var(--adm-radius) var(--adm-radius)',
                padding: '18px 14px'
              }}
            >
              <div
                style={{
                  fontFamily: `"${theme.heading_font}", serif`,
                  fontSize: '17px',
                  fontWeight: 700,
                  color: theme.primary_color,
                  marginBottom: '8px'
                }}
              >
                এলার্জি থেকে স্থায়ী মুক্তির ভেষজ সমাধান
              </div>

              <p
                style={{
                  fontFamily: `"${theme.body_font}", sans-serif`,
                  fontSize: '12.5px',
                  color: '#4b5563',
                  marginBottom: '14px',
                  lineHeight: 1.55
                }}
              >
                ১০০% প্রাকৃতিক উপাদানে তৈরি জিরো এলার্জি রক্ত পরিশোধন করে এলার্জির স্থায়ী উপশম এনে দেয়।
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    background: '#fef3c7',
                    color: theme.accent_color,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600
                  }}
                >
                  🎁 অফার মূল্য
                </span>
                <span
                  style={{
                    background: '#dcfce7',
                    color: theme.primary_color,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600
                  }}
                >
                  🚚 ফ্রি ডেলিভারি
                </span>
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  background: `linear-gradient(135deg, ${theme.primary_color} 0%, ${theme.secondary_color} 100%)`,
                  color: '#fff',
                  border: 'none',
                  padding: '9px 14px',
                  borderRadius: theme.border_radius,
                  fontWeight: 600,
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                }}
              >
                ✓ এখনই অর্ডার করুন (ক্যাশ অন ডেলিভারি)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
