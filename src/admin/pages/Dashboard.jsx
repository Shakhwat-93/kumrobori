import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Package,
  Plus,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useCms } from '../../context/CmsContext';
import { getEffectiveOrderQty } from '../../lib/orderHelper';

export default function Dashboard({ setActiveTab, onEditProduct }) {
  const { orders, products, siteSettings, updateOrderStatus } = useCms();

  const totalSales = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');
  const lowStockProducts = products.filter((p) => p.stock_qty <= 10);

  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#ffffff',
          padding: '18px 16px',
          borderRadius: 'var(--adm-radius)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px 0' }}>
            স্বাগতম, {siteSettings?.store_name || 'Herbheez'}!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
            আপনার ই-কমার্স স্টোরের সমস্ত পণ্য, অর্ডার এবং কন্টেন্ট এখান থেকে পরিচালনা করুন।
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '320px' }}>
          <button
            className="adm-btn adm-btn-sm adm-btn-primary"
            style={{ flex: 1 }}
            onClick={() => setActiveTab('product-new')}
          >
            <Plus size={14} />
            <span>নতুন প্রোডাক্ট</span>
          </button>
          <button
            className="adm-btn adm-btn-sm"
            style={{ background: '#334155', color: '#fff', borderColor: '#475569', flex: 1 }}
            onClick={() => setActiveTab('builder')}
          >
            <span>হোমপেজ সাজান</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (1 column on mobile, 4 on desktop) */}
      <div className="adm-grid-4" style={{ marginBottom: '20px' }}>
        {/* Total Sales */}
        <div className="adm-card" style={{ marginBottom: 0 }}>
          <div className="adm-card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)', fontWeight: 500 }}>
                মোট বিক্রয় (Total Sales)
              </span>
              <span style={{ background: '#def7ec', color: '#03543f', padding: '4px', borderRadius: '6px' }}>
                <TrendingUp size={15} />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '6px', color: '#111827' }}>
              ৳ {totalSales.toLocaleString()}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--adm-text-subdued)', marginTop: '2px' }}>
              {totalOrders} টি অর্ডার থেকে
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="adm-card" style={{ marginBottom: 0 }}>
          <div className="adm-card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)', fontWeight: 500 }}>
                মোট অর্ডার (Orders)
              </span>
              <span style={{ background: '#e1effe', color: '#1e429f', padding: '4px', borderRadius: '6px' }}>
                <ShoppingBag size={15} />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '6px', color: '#111827' }}>
              {totalOrders}
            </div>
            <div style={{ fontSize: '11.5px', color: '#008060', marginTop: '2px', fontWeight: 500 }}>
              ✓ {deliveredOrders.length} টি ডেলিভার্ড
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="adm-card" style={{ marginBottom: 0 }}>
          <div className="adm-card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)', fontWeight: 500 }}>
                অপেক্ষমাণ (Pending)
              </span>
              <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px', borderRadius: '6px' }}>
                <Clock size={15} />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '6px', color: pendingOrders.length > 0 ? '#d72c0d' : '#111827' }}>
              {pendingOrders.length}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--adm-text-subdued)', marginTop: '2px' }}>
              দ্রুত নিশ্চিত করুন
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="adm-card" style={{ marginBottom: 0 }}>
          <div className="adm-card-body" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--adm-text-subdued)', fontWeight: 500 }}>
                সক্রিয় প্রোডাক্ট
              </span>
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px', borderRadius: '6px' }}>
                <Package size={15} />
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '6px', color: '#111827' }}>
              {products.length}
            </div>
            <div style={{ fontSize: '11.5px', color: lowStockProducts.length > 0 ? '#d72c0d' : 'var(--adm-text-subdued)', marginTop: '2px' }}>
              {lowStockProducts.length > 0 ? `⚠️ ${lowStockProducts.length} টি কম স্টক` : 'সব ইন-স্টক'}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <h3 className="adm-card-title">সাম্প্রতিক অর্ডারসমূহ (Recent Orders)</h3>
            <p className="adm-card-desc">সরাসরি এখান থেকে স্ট্যাটাস পরিবর্তন করুন</p>
          </div>
          <button className="adm-btn adm-btn-sm" onClick={() => setActiveTab('orders')}>
            <span>সব দেখুন</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--adm-text-subdued)' }}>
            কোনো অর্ডার পাওয়া যায়নি
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table adm-table-responsive">
              <thead>
                <tr>
                  <th>অর্ডার আইডি</th>
                  <th>গ্রাহক</th>
                  <th>প্যাকেজ / পণ্য</th>
                  <th>মোট টাকা</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.order_id}>
                    <td data-label="অর্ডার আইডি" style={{ fontWeight: 600, color: '#008060' }}>
                      {ord.order_id}
                    </td>
                    <td data-label="গ্রাহক">
                      <div style={{ fontWeight: 500 }}>{ord.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--adm-text-subdued)' }}>
                        {ord.phone} • {ord.area}
                      </div>
                    </td>
                    <td data-label="পণ্য">
                      <span style={{ fontSize: '13px' }}>{ord.package_name || 'প্যাকেজ'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--adm-text-subdued)', marginLeft: '4px' }}>
                        (×{getEffectiveOrderQty(ord)})
                      </span>
                    </td>
                    <td data-label="মোট টাকা" style={{ fontWeight: 600 }}>
                      ৳ {ord.total_price}
                    </td>
                    <td data-label="স্ট্যাটাস">
                      <select
                        className="adm-select"
                        style={{
                          fontSize: '12px',
                          padding: '3px 8px',
                          width: 'auto',
                          maxWidth: '100%',
                          background:
                            ord.status === 'pending'
                              ? '#fef2f2'
                              : ord.status === 'delivered'
                              ? '#ecfdf5'
                              : '#eff6ff',
                          borderColor:
                            ord.status === 'pending'
                              ? '#f87171'
                              : ord.status === 'delivered'
                              ? '#34d399'
                              : '#60a5fa'
                        }}
                        value={ord.status || 'pending'}
                        onChange={(e) => updateOrderStatus(ord.order_id, e.target.value)}
                      >
                        <option value="pending">অপেক্ষমাণ (Pending)</option>
                        <option value="confirmed">কনফার্মড (Confirmed)</option>
                        <option value="processing">প্রক্রিয়াধীন (Processing)</option>
                        <option value="shipped">কুরিয়ারে পাঠানো (Shipped)</option>
                        <option value="delivered">ডেলিভার্ড (Delivered)</option>
                        <option value="cancelled">বাতিল (Cancelled)</option>
                      </select>
                    </td>
                    <td data-label="অ্যাকশন">
                      <button
                        className="adm-btn adm-btn-sm"
                        onClick={() => setActiveTab('orders')}
                        title="বিস্তারিত দেখুন"
                      >
                        <Eye size={13} />
                        <span>বিস্তারিত</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Featured Products Quick View */}
      <div className="adm-card">
        <div className="adm-card-header">
          <div>
            <h3 className="adm-card-title">লাইভ প্রোডাক্ট ক্যাটালগ ({products.length})</h3>
            <p className="adm-card-desc">স্টোরে প্রদর্শিত সক্রিয় পণ্যসমূহ</p>
          </div>
          <button className="adm-btn adm-btn-sm" onClick={() => setActiveTab('products')}>
            <span>ম্যানেজ</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="adm-card-body" style={{ padding: '14px' }}>
          <div className="adm-grid-2">
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  border: '1px solid var(--adm-border)',
                  borderRadius: 'var(--adm-radius)',
                  background: '#fafbfb'
                }}
              >
                <img
                  src={p.images?.[0] || '/images/IMG_7091.webp'}
                  alt={p.title}
                  style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--adm-text-subdued)' }}>
                    মূল্য: ৳{p.price} • স্টক: {p.stock_qty} টি
                  </div>
                </div>
                <button
                  className="adm-btn adm-btn-sm"
                  onClick={() => onEditProduct(p)}
                >
                  এডিট
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
