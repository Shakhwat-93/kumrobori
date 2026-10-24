import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Check,
  AlertTriangle,
  ExternalLink,
  Star
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';

export default function ProductsList({ onNewProduct, onEditProduct }) {
  const { products, deleteProduct, saveProduct } = useCms();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleToggleFeatured = async (product) => {
    await saveProduct({ ...product, is_featured: !product.is_featured });
  };

  const handleDelete = async (id) => {
    await deleteProduct(id);
    setDeleteConfirmId(null);
  };

  return (
    <div>
      {/* Top Action Bar */}
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
          <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>সকল প্রোডাক্ট ({products.length})</h2>
          <p style={{ fontSize: '13px', color: 'var(--adm-text-subdued)', margin: '2px 0 0 0' }}>
            আপনার অনলাইন স্টোরের সমস্ত পণ্য ও প্যাকেজ পরিচালনা করুন
          </p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={onNewProduct}>
          <Plus size={16} />
          <span>নতুন প্রোডাক্ট যোগ করুন</span>
        </button>
      </div>

      {/* Filter and Search Card */}
      <div className="adm-card" style={{ marginBottom: '16px' }}>
        <div className="adm-card-body" style={{ padding: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--adm-text-subdued)'
                }}
              />
              <input
                type="text"
                placeholder="প্রোডাক্ট নাম বা SKU দিয়ে খুঁজুন..."
                className="adm-input"
                style={{ paddingLeft: '36px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className={`adm-btn adm-btn-sm ${statusFilter === 'all' ? 'adm-btn-primary' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                সব ({products.length})
              </button>
              <button
                className={`adm-btn adm-btn-sm ${statusFilter === 'active' ? 'adm-btn-primary' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                সক্রিয় ({products.filter((p) => p.status === 'active').length})
              </button>
              <button
                className={`adm-btn adm-btn-sm ${statusFilter === 'draft' ? 'adm-btn-primary' : ''}`}
                onClick={() => setStatusFilter('draft')}
              >
                ড্রাফট ({products.filter((p) => p.status === 'draft').length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="adm-card">
        {filteredProducts.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <p style={{ color: 'var(--adm-text-subdued)', marginBottom: '16px' }}>
              কোনো প্রোডাক্ট খুঁজে পাওয়া যায়নি
            </p>
            <button className="adm-btn adm-btn-primary" onClick={onNewProduct}>
              <Plus size={16} />
              <span>প্রথম প্রোডাক্ট যুক্ত করুন</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table adm-table-responsive">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>প্রোডাক্ট</th>
                  <th>স্ট্যাটাস</th>
                  <th>ইনভেন্টরি</th>
                  <th>মূল্য</th>
                  <th>ক্যাটাগরি</th>
                  <th style={{ textAlign: 'right' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td data-label="প্রোডাক্ট">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.images?.[0] || '/images/IMG_7091.webp'}
                          alt={p.title}
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            background: '#f0f0f0'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--adm-text)' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--adm-text-subdued)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span>SKU: {p.sku || 'N/A'}</span>
                            {p.badge_text && (
                              <span style={{ background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>
                                {p.badge_text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td data-label="স্ট্যাটাস">
                      <span
                        className={`adm-badge ${
                          p.status === 'active' ? 'adm-badge-success' : 'adm-badge-warning'
                        }`}
                      >
                        {p.status === 'active' ? 'Active' : 'Draft'}
                      </span>
                    </td>

                    <td data-label="ইনভেন্টরি">
                      <span
                        style={{
                          fontWeight: 500,
                          color: p.stock_qty <= 10 ? '#d72c0d' : '#202223'
                        }}
                      >
                        {p.stock_qty} টি ইন-স্টক
                      </span>
                    </td>

                    <td data-label="মূল্য">
                      <div style={{ fontWeight: 600 }}>৳ {p.price}</div>
                      {p.compare_at_price > p.price && (
                        <div style={{ fontSize: '11.5px', textDecoration: 'line-through', color: 'var(--adm-text-subdued)' }}>
                          ৳ {p.compare_at_price}
                        </div>
                      )}
                    </td>

                    <td data-label="ক্যাটাগরি">
                      <span style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)' }}>
                        {p.category || 'সাধারণ'}
                      </span>
                    </td>

                    <td data-label="অ্যাকশন" style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="adm-btn adm-btn-sm"
                          onClick={() => handleToggleFeatured(p)}
                          title={p.is_featured ? 'ফিচার্ড থেকে সরান' : 'ফিচার্ড করুন'}
                          style={{
                            color: p.is_featured ? '#f59e0b' : 'var(--adm-text-subdued)',
                            borderColor: p.is_featured ? '#fde68a' : 'var(--adm-border)'
                          }}
                        >
                          <Star size={13} fill={p.is_featured ? '#f59e0b' : 'none'} />
                        </button>
                        <button
                          className="adm-btn adm-btn-sm"
                          onClick={() => onEditProduct(p)}
                          title="এডিট করুন"
                        >
                          <Edit size={13} />
                          <span>এডিট</span>
                        </button>
                        <button
                          className="adm-btn adm-btn-sm adm-btn-danger"
                          onClick={() => setDeleteConfirmId(p.id)}
                          title="মুছে ফেলুন"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="adm-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            className="adm-card"
            style={{ width: '90%', maxWidth: '420px', margin: 0, padding: '24px' }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#d72c0d', marginBottom: '14px' }}>
              <AlertTriangle size={24} />
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>প্রোডাক্ট মুছে ফেলা নিশ্চিত করুন</h3>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--adm-text)', lineHeight: 1.5, marginBottom: '20px' }}>
              আপনি কি নিশ্চিত যে এই প্রোডাক্টটি স্থায়ীভাবে মুছে ফেলতে চান? এটি মুছে ফেললে ওয়েবসাইট থেকে অপসারিত হবে।
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="adm-btn" onClick={() => setDeleteConfirmId(null)}>
                বাতিল
              </button>
              <button
                className="adm-btn adm-btn-danger"
                style={{ background: '#d72c0d', color: '#fff' }}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
