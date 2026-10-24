import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Eye,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export default function ProductEditor({ product, onBack }) {
  const { saveProduct, categories } = useCms();

  const isEditing = Boolean(product?.id);

  const [formData, setFormData] = useState({
    id: product?.id || null,
    title: product?.title || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    category: product?.category || 'হারবাল ও ন্যাচারাল কেয়ার',
    price: product?.price || 750,
    compare_at_price: product?.compare_at_price || 1150,
    cost_per_item: product?.cost_per_item || 350,
    stock_qty: product?.stock_qty ?? 100,
    track_quantity: product?.track_quantity ?? true,
    status: product?.status || 'active',
    is_featured: product?.is_featured ?? false,
    short_description: product?.short_description || '',
    description_html: product?.description_html || '',
    images: product?.images?.length ? [...product.images] : ['/images/IMG_7091.webp'],
    features: product?.features?.length ? [...product.features] : [
      'চিংড়ি, ইলিশ, গরুর মাংস, বেগুন নিশ্চিন্তে খাওয়ার স্বাধীনতা',
      'রক্ত পরিশোধনের মাধ্যমে টক্সিন ও জীবাণু দূরীকরণ'
    ],
    badge_text: product?.badge_text || '',
    sort_order: product?.sort_order || 1
  });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [saving, setSaving] = useState(false);

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `product-${Date.now()}`
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSetPrimaryImage = (index) => {
    setFormData((prev) => {
      const imgs = [...prev.images];
      const [selected] = imgs.splice(index, 1);
      return { ...prev, images: [selected, ...imgs] };
    });
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()]
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const price = Number(formData.price) || 0;
  const cost = Number(formData.cost_per_item) || 0;
  const profit = price - cost;
  const margin = price > 0 ? Math.round((profit / price) * 100) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('অনুগ্রহ করে প্রোডাক্টের শিরোনাম লিখুন');
      return;
    }
    setSaving(true);
    const success = await saveProduct({
      ...formData,
      price: Number(formData.price),
      compare_at_price: Number(formData.compare_at_price),
      cost_per_item: Number(formData.cost_per_item),
      stock_qty: Number(formData.stock_qty),
      slug: formData.slug || `product-${Date.now()}`
    });
    setSaving(false);
    if (success) onBack();
  };

  return (
    <form onSubmit={handleSubmit} style={{ paddingBottom: '40px' }}>
      {/* Top Bar Navigation & Actions */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" className="adm-btn adm-btn-sm" onClick={onBack}>
            <ArrowLeft size={15} />
            <span>সকল প্রোডাক্ট</span>
          </button>
          <h2 style={{ fontSize: '17px', fontWeight: 600, margin: 0 }}>
            {isEditing ? `এডিট: ${formData.title}` : 'নতুন প্রোডাক্ট'}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="adm-btn adm-btn-sm" onClick={onBack}>
            বাতিল
          </button>
          <button type="submit" className="adm-btn adm-btn-sm adm-btn-primary" disabled={saving}>
            <Check size={15} />
            <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </div>

      <div className="adm-two-col-2-1">
        {/* Left Column (Primary Details) */}
        <div>
          {/* 1. Basic Info */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">১. সাধারণ তথ্য (Title & Info)</h3>
            </div>
            <div className="adm-card-body">
              <div className="adm-form-group">
                <label className="adm-label">প্রোডাক্টের নাম / শিরোনাম *</label>
                <input
                  type="text"
                  name="title"
                  className="adm-input"
                  placeholder="যেমন: জিরো এলার্জি - ১ বোতল"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">সংক্ষিপ্ত বিবরণ (Short Description)</label>
                <textarea
                  name="short_description"
                  className="adm-textarea"
                  rows={2}
                  placeholder="কার্ডে ও অফার তালিকায় প্রদর্শিত হবে..."
                  value={formData.short_description}
                  onChange={handleChange}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">অফার ব্যাজ / রিবন টেক্সট</label>
                <input
                  type="text"
                  name="badge_text"
                  className="adm-input"
                  placeholder="যেমন: স্টার্টার প্যাক — ৪০০৳ ছাড়"
                  value={formData.badge_text}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* 2. Media Manager */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">২. প্রোডাক্ট ছবি (Media)</h3>
            </div>
            <div className="adm-card-body">
              {/* Image Grid */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      width: '84px',
                      height: '84px',
                      borderRadius: '8px',
                      border: idx === 0 ? '2px solid #008060' : '1px solid var(--adm-border)',
                      overflow: 'hidden',
                      background: '#fff',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={img}
                      alt="Product"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {idx === 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: 2,
                          left: 2,
                          background: '#008060',
                          color: '#fff',
                          fontSize: '9px',
                          padding: '1px 4px',
                          borderRadius: '3px',
                          fontWeight: 600
                        }}
                      >
                        প্রধান
                      </span>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.65)',
                        display: 'flex',
                        justifyContent: 'space-around',
                        padding: '2px'
                      }}
                    >
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          title="প্রধান ছবি বানান"
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '10px' }}
                        >
                          Star
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="মুছুন"
                        style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Image URL */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="ছবির লিংক দিন (যেমন: /images/IMG_7091.webp)"
                  className="adm-input"
                  style={{ flex: 1, minWidth: '180px' }}
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <button type="button" className="adm-btn adm-btn-sm" onClick={handleAddImage}>
                  <Plus size={14} />
                  <span>ছবি যোগ</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Pricing */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">৩. মূল্য নির্ধারণ (Pricing)</h3>
            </div>
            <div className="adm-card-body">
              <div className="adm-grid-3">
                <div className="adm-form-group">
                  <label className="adm-label">বিক্রয় মূল্য (Price ৳) *</label>
                  <input
                    type="number"
                    name="price"
                    className="adm-input"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">পূর্বের মূল্য (Compare Price ৳)</label>
                  <input
                    type="number"
                    name="compare_at_price"
                    className="adm-input"
                    value={formData.compare_at_price}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">কেনা খরচ (Cost per item ৳)</label>
                  <input
                    type="number"
                    name="cost_per_item"
                    className="adm-input"
                    value={formData.cost_per_item}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Margin & Profit display */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--adm-border)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  display: 'flex',
                  gap: '16px',
                  fontSize: '13px',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <span style={{ color: 'var(--adm-text-subdued)' }}>আনুমানিক লাভ: </span>
                  <strong style={{ color: profit >= 0 ? '#008060' : '#d72c0d' }}>৳ {profit}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--adm-text-subdued)' }}>প্রফিট মার্জিন: </span>
                  <strong style={{ color: '#2c6ecb' }}>{margin}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Structured Description Editor */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">৪. বিস্তারিত বিবরণ (Structured Description)</h3>
            </div>
            <div className="adm-card-body">
              <textarea
                name="description_html"
                className="adm-textarea"
                rows={4}
                placeholder="প্রোডাক্টের বিস্তারিত বিবরণ লিখুন..."
                value={formData.description_html}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* 5. Key Bullet Features */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">৫. মূল আকর্ষণ / ফিচার পয়েন্টসমূহ (Bullet Features)</h3>
            </div>
            <div className="adm-card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {formData.features.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: '#fafbfb',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--adm-border)',
                      wordBreak: 'break-word'
                    }}
                  >
                    <span style={{ color: '#008060', fontWeight: 'bold' }}>✓</span>
                    <span style={{ flex: 1, fontSize: '13px', minWidth: 0 }}>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="যেমন: ৫-১০ বছরের পুরাতন অ্যালার্জি স্থায়ী উপশম..."
                  className="adm-input"
                  style={{ flex: 1, minWidth: '180px' }}
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                />
                <button type="button" className="adm-btn adm-btn-sm" onClick={handleAddFeature}>
                  <Plus size={14} />
                  <span>পয়েন্ট যোগ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Inventory, Status, SEO) */}
        <div>
          {/* Status & Visibility */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">স্ট্যাটাস ও পাবলিশিং</h3>
            </div>
            <div className="adm-card-body">
              <div className="adm-form-group">
                <label className="adm-label">প্রোডাক্ট স্ট্যাটাস</label>
                <select
                  name="status"
                  className="adm-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">সক্রিয় (Active - ওয়েবসাইটে দেখাবে)</option>
                  <option value="draft">ড্রাফট (Draft - লুকানো থাকবে)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                />
                <label htmlFor="is_featured" style={{ fontSize: '13px', cursor: 'pointer' }}>
                  হোমপেজে স্পেশাল অফার হিসেবে দেখান
                </label>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">ইনভেন্টরি (Inventory)</h3>
            </div>
            <div className="adm-card-body">
              <div className="adm-form-group">
                <label className="adm-label">SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  name="sku"
                  className="adm-input"
                  placeholder="যেমন: ZA-01"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">স্টক পরিমাণ (Stock Quantity)</label>
                <input
                  type="number"
                  name="stock_qty"
                  className="adm-input"
                  value={formData.stock_qty}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">সংগঠন ও ক্যাটাগরি</h3>
            </div>
            <div className="adm-card-body">
              <div className="adm-form-group">
                <label className="adm-label">ক্যাটাগরি</label>
                <input
                  type="text"
                  name="category"
                  className="adm-input"
                  placeholder="যেমন: হারবাল ও ন্যাচারাল কেয়ার"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">ডিসপ্লে ক্রম (Sort Order)</label>
                <input
                  type="number"
                  name="sort_order"
                  className="adm-input"
                  value={formData.sort_order}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* SEO & URL */}
          <div className="adm-card">
            <div className="adm-card-header">
              <h3 className="adm-card-title">SEO ও URL স্লাগ</h3>
            </div>
            <div className="adm-card-body">
              <div className="adm-form-group">
                <label className="adm-label">URL Slug</label>
                <input
                  type="text"
                  name="slug"
                  className="adm-input"
                  value={formData.slug}
                  onChange={handleChange}
                />
                <div className="adm-hint">
                  ওয়েবসাইটে লিংক হবে: /products/{formData.slug || 'slug'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
