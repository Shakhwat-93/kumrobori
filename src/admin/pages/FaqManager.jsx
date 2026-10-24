import React, { useState } from 'react';
import { Plus, Trash2, Edit, Check, HelpCircle } from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export default function FaqManager() {
  const { faqs, saveFaq, deleteFaq } = useCms();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: ''
  });

  const handleEdit = (faq) => {
    setEditingId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;

    await saveFaq({
      id: editingId,
      question: formData.question.trim(),
      answer: formData.answer.trim()
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
            সাধারণ জিজ্ঞাসা ও প্রশ্নোত্তর (FAQs)
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)', margin: '2px 0 0 0' }}>
            ওয়েবসাইটে গ্রাহকদের সাধারণ প্রশ্নের উত্তর পরিচালনা করুন
          </p>
        </div>
      </div>

      <div className="adm-two-col">
        {/* Form */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">{editingId ? 'FAQ এডিট করুন' : 'নতুন FAQ যোগ করুন'}</h3>
          </div>
          <div className="adm-card-body">
            <form onSubmit={handleSubmit}>
              <div className="adm-form-group">
                <label className="adm-label">প্রশ্ন (Question) *</label>
                <input
                  type="text"
                  className="adm-input"
                  placeholder="যেমন: জিরো এলার্জি কি আসলেই স্থায়ী সমাধান দেয়?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="adm-form-group">
                <label className="adm-label">উত্তর (Answer) *</label>
                <textarea
                  className="adm-textarea"
                  rows={4}
                  placeholder="বিস্তারিত ও স্পষ্ট উত্তর দিন..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {editingId && (
                  <button type="button" className="adm-btn" onClick={handleCancel}>
                    বাতিল
                  </button>
                )}
                <button type="submit" className="adm-btn adm-btn-primary">
                  <Check size={16} />
                  <span>{editingId ? 'আপডেট করুন' : 'FAQ যোগ করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Existing List */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3 className="adm-card-title">প্রশ্নোত্তর তালিকা ({faqs.length})</h3>
          </div>
          <div className="adm-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq) => (
              <div
                key={faq.id}
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
                    marginBottom: '6px'
                  }}
                >
                  <strong style={{ fontSize: '13.5px', color: '#111827', minWidth: 0, flex: 1, wordBreak: 'break-word' }}>
                    ❓ {faq.question}
                  </strong>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      className="adm-btn adm-btn-sm"
                      onClick={() => handleEdit(faq)}
                      title="এডিট"
                      style={{ padding: '4px 8px' }}
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      className="adm-btn adm-btn-sm adm-btn-danger"
                      onClick={() => deleteFaq(faq.id)}
                      title="মুছুন"
                      style={{ padding: '4px 8px' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
