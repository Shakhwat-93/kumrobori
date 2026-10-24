import React, { useState } from 'react';
import {
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Edit,
  Save,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export default function HomepageBuilder() {
  const { homepageSections, updateHomepageSection, reorderHomepageSections } = useCms();
  const [expandedSectionId, setExpandedSectionId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleToggleEnable = async (sec) => {
    await updateHomepageSection(sec.id, { is_enabled: !sec.is_enabled });
  };

  const handleMove = async (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= homepageSections.length) return;

    const list = [...homepageSections];
    const [moved] = list.splice(index, 1);
    list.splice(newIdx, 0, moved);

    await reorderHomepageSections(list);
  };

  const handleExpand = (sec) => {
    if (expandedSectionId === sec.id) {
      setExpandedSectionId(null);
    } else {
      setExpandedSectionId(sec.id);
      setEditData({
        title: sec.title || '',
        subtitle: sec.subtitle || '',
        config: sec.config ? { ...sec.config } : {}
      });
    }
  };

  const handleSaveExpanded = async (secId) => {
    await updateHomepageSection(secId, {
      title: editData.title,
      subtitle: editData.subtitle,
      config: editData.config
    });
    setExpandedSectionId(null);
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
            হোমপেজ সেকশন বিল্ডার (Homepage Builder)
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)', margin: '2px 0 0 0' }}>
            যেকোনো সেকশন চালু/বন্ধ করুন, ক্রম পরিবর্তন করুন এবং কন্টেন্ট এডিট করুন
          </p>
        </div>
      </div>

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {homepageSections.map((sec, idx) => {
          const isExpanded = expandedSectionId === sec.id;

          return (
            <div
              key={sec.id}
              className="adm-card"
              style={{
                marginBottom: 0,
                opacity: sec.is_enabled ? 1 : 0.65,
                borderLeft: sec.is_enabled ? '4px solid #008060' : '4px solid #9aa1a6'
              }}
            >
              {/* Card Header Row */}
              <div
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap',
                  background: isExpanded ? '#fafbfb' : '#ffffff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  {/* Reorder Arrows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
                    <button
                      className="adm-btn adm-btn-sm"
                      style={{ padding: '2px 5px' }}
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, -1)}
                      title="উপরে নিন"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      className="adm-btn adm-btn-sm"
                      style={{ padding: '2px 5px' }}
                      disabled={idx === homepageSections.length - 1}
                      onClick={() => handleMove(idx, 1)}
                      title="নিচে নিন"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '13.5px' }}>{sec.title}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: '#f1f5f9',
                          color: '#475569'
                        }}
                      >
                        {sec.id}
                      </span>
                    </div>
                    {sec.subtitle && (
                      <div style={{ fontSize: '12px', color: 'var(--adm-text-subdued)', marginTop: '2px', wordBreak: 'break-word' }}>
                        {sec.subtitle}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions: Enable Toggle & Edit Accordion */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    className={`adm-btn adm-btn-sm ${sec.is_enabled ? 'adm-btn-primary' : ''}`}
                    onClick={() => handleToggleEnable(sec)}
                    title={sec.is_enabled ? 'সেকশন বন্ধ করুন' : 'সেকশন চালু করুন'}
                  >
                    {sec.is_enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{sec.is_enabled ? 'সক্রিয়' : 'লুকানো'}</span>
                  </button>

                  <button
                    className="adm-btn adm-btn-sm"
                    onClick={() => handleExpand(sec)}
                  >
                    <Edit size={12} />
                    <span>{isExpanded ? 'বন্ধ' : 'এডিট'}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
              </div>

              {/* Accordion Editor Body */}
              {isExpanded && (
                <div
                  style={{
                    padding: '14px',
                    borderTop: '1px solid var(--adm-border)',
                    background: '#fdfdfd'
                  }}
                >
                  <div className="adm-grid-2">
                    <div className="adm-form-group">
                      <label className="adm-label">সেকশন শিরোনাম (Title)</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    </div>

                    <div className="adm-form-group">
                      <label className="adm-label">উপশিরোনাম (Subtitle)</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={editData.subtitle}
                        onChange={(e) => setEditData({ ...editData, subtitle: e.target.value })}
                      />
                    </div>
                  </div>

                  {sec.id === 'hero' && (
                    <div className="adm-grid-2">
                      <div className="adm-form-group">
                        <label className="adm-label">হিরো ব্যানার ইমেজ URL</label>
                        <input
                          type="text"
                          className="adm-input"
                          value={editData.config?.image_url || ''}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              config: { ...editData.config, image_url: e.target.value }
                            })
                          }
                        />
                      </div>
                      <div className="adm-form-group">
                        <label className="adm-label">অফার ব্যাজ টেক্সট</label>
                        <input
                          type="text"
                          className="adm-input"
                          value={editData.config?.badge || ''}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              config: { ...editData.config, badge: e.target.value }
                            })
                          }
                        />
                      </div>
                    </div>
                  )}

                  {sec.id === 'lab_report' && (
                    <div className="adm-form-group">
                      <label className="adm-label">ল্যাব টেস্ট রিপোর্ট সার্টিফিকেট ইমেজ URL</label>
                      <input
                        type="text"
                        className="adm-input"
                        value={editData.config?.image_url || ''}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            config: { ...editData.config, image_url: e.target.value }
                          })
                        }
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                    <button
                      className="adm-btn adm-btn-primary adm-btn-sm"
                      onClick={() => handleSaveExpanded(sec.id)}
                    >
                      <Check size={14} />
                      <span>পরিবর্তন সংরক্ষণ করুন</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
