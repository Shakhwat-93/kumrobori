import React, { useState } from 'react';
import { Plus, Trash2, Edit, Star, Check } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export default function TestimonialsManager() {
  const { testimonials, saveTestimonial, deleteTestimonial } = useCms();
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    author_name: '',
    location: '',
    rating: 5,
    review_text: '',
    avatar_letter: 'গ'
  });

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setFormData({
      author_name: item.author_name,
      location: item.location || '',
      rating: item.rating || 5,
      review_text: item.review_text,
      avatar_letter: item.avatar_letter || item.author_name?.charAt(0) || 'গ'
    });
    // On mobile, scroll to the form at top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({
      author_name: '',
      location: '',
      rating: 5,
      review_text: '',
      avatar_letter: 'গ'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author_name.trim() || !formData.review_text.trim()) {
      alert('নাম ও রিভিউ লিখুন');
      return;
    }
    await saveTestimonial({
      id: editingItem,
      ...formData,
      avatar_letter: formData.avatar_letter || formData.author_name.charAt(0)
    });
    handleCancel();
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
          gap: '8px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            গ্রাহক মতামত ও টেস্টিমোনিয়াল ({testimonials.length})
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)', margin: '2px 0 0 0' }}>
            ওয়েবসাইটে প্রদর্শিত বাস্তব গ্রাহকদের অভিজ্ঞতা ও রিভিউ পরিচালনা করুন
          </p>
        </div>
      </div>

      <div className="adm-two-col">
        {/* Form to Add / Edit */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">
              {editingItem ? 'রিভিউ এডিট করুন' : 'নতুন রিভিউ যুক্ত করুন'}
            </h3>
          </div>
          <div className="adm-card-body">
            <form onSubmit={handleSubmit}>
              <div className="adm-form-group">
                <label className="adm-label">গ্রাহকের নাম *</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  required
                />
              </div>

              <div className="adm-grid-2">
                <div className="adm-form-group">
                  <label className="adm-label">লোকেশন / এলাকা</label>
                  <input
                    type="text"
                    className="adm-input"
                    placeholder="যেমন: মিরপুর, ঢাকা"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="adm-form-group">
                  <label className="adm-label">রেটিং (স্টার ১-৫)</label>
                  <select
                    className="adm-select"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                  >
                    <option value={5}>৫ স্টার (★★★★★)</option>
                    <option value={4}>৪ স্টার (★★★★☆)</option>
                  </select>
                </div>
              </div>

              <div className="adm-form-group">
                <label className="adm-label">গ্রাহকের অভিজ্ঞতা / মতামত *</label>
                <textarea
                  className="adm-textarea"
                  rows={4}
                  placeholder="গ্রাহকের বিস্তারিত প্রতিক্রিয়া..."
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {editingItem && (
                  <button type="button" className="adm-btn" onClick={handleCancel}>
                    বাতিল
                  </button>
                )}
                <button type="submit" className="adm-btn adm-btn-primary">
                  <Check size={16} />
                  <span>{editingItem ? 'আপডেট করুন' : 'রিভিউ যোগ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">বিদ্যমান রিভিউ তালিকা ({testimonials.length})</h3>
          </div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {testimonials.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--adm-border)',
                  borderRadius: '8px',
                  padding: '12px',
                  boxSizing: 'border-box',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '10px',
                    marginBottom: '8px'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--adm-text)' }}>
                      {item.author_name}
                      <span style={{ fontSize: '12px', color: 'var(--adm-text-subdued)', fontWeight: 400, marginLeft: '6px' }}>
                        ({item.location})
                      </span>
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '12px', marginTop: '2px' }}>
                      {'★'.repeat(item.rating || 5)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      className="adm-btn adm-btn-sm"
                      onClick={() => handleEdit(item)}
                      title="এডিট"
                      style={{ padding: '4px 8px' }}
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      className="adm-btn adm-btn-sm adm-btn-danger"
                      onClick={() => deleteTestimonial(item.id)}
                      title="মুছুন"
                      style={{ padding: '4px 8px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>
                  "{item.review_text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
