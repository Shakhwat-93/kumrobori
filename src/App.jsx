import { useEffect, useMemo, useRef, useState } from 'react'
import { DELIVERY_CHARGE, boriPrices, combos, products, orderOptions } from './data.js'
import { submitOrder } from './supabase.js'
import { CmsProvider } from './context/CmsContext.jsx'
import AdminApp from './admin/AdminApp.jsx'
import OrderSuccessPage from './pages/OrderSuccessPage.jsx'
import CustomerReviews from './components/CustomerReviews.jsx'
import { fetchClientIp, trackPurchase } from './lib/tracking.js'

/* ---------- helpers ---------- */
const bnDigits = '০১২৩৪৫৬৭৮৯'
const toBn = (n) => String(n).replace(/\d/g, (d) => bnDigits[d])
const taka = (n) => toBn(Number(n).toLocaleString('en-IN'))

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            e.target.setAttribute('data-revealed', 'true')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.15 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function CountUp({ to, duration = 1100 }) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (t) => {
        const p = Math.min((t - start) / duration, 1)
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])
  return <span ref={ref}>{taka(val)}</span>
}

const scrollToOrder = (id) => {
  if (id) window.dispatchEvent(new CustomEvent('pick-option', { detail: id }))
  document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' })
}

/* ---------- sections ---------- */
function Header() {
  return (
    <header className="header">
      <a href="#top" className="brand">
        <img src="/img/logo.jpg" alt="ম্যাঙ্গো গার্ডেন লোগো" className="brand-logo" />
        <div className="brand-info">
          <span className="brand-title">ম্যাঙ্গো গার্ডেন</span>
          <span className="brand-tag">খাঁটি কুমড়ো বড়ি</span>
        </div>
      </a>
      <div className="header-actions">
        <a
          href="https://www.facebook.com/mangogardenbd1"
          target="_blank"
          rel="noopener noreferrer"
          className="header-fb-btn"
          aria-label="ম্যাঙ্গো গার্ডেন ফেসবুক পেজ"
          title="আমাদের ফেসবুক পেজ"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
        <button className="btn btn-sm" onClick={() => scrollToOrder()}>অর্ডার করুন</button>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="hero-inner">
        <span className="pill reveal">🌿 ম্যাঙ্গো গার্ডেন · ১০০% ঘরে তৈরি · রোদে শুকানো</span>
        <h1 className="reveal">
          ঘরোয়া স্বাদের <span className="hl">খাঁটি</span> কুমড়ো বড়ি
        </h1>
        <p className="lead reveal">মাসকলাইয়ের ডাল আর কুমড়োয় তৈরি, গ্রামের রোদে শুকানো, ঠিক যেমন মায়ের হাতে হতো।</p>

        <div className="hero-media reveal">
          <img src="/img/kumro-bori.webp" alt="কুমড়ো বড়ি" className="float" />
          <div className="price-sticker">
            <small>মাত্র</small>
            <strong>৳<CountUp to={650} /></strong>
            <small>/ কেজি</small>
          </div>
          <div className="mini-badge">🚚 সারা দেশে ডেলিভারি</div>
        </div>

        <div className="hero-cta reveal">
          <button className="btn btn-lg shine" onClick={() => scrollToOrder('bori-1')}>
            এখনই অর্ডার করুন →
          </button>
          <a href="#combo" className="btn btn-ghost btn-lg">কম্বো অফার দেখুন</a>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const items = ['৭৯৯৳ কম্বোতে ফ্রি ডেলিভারি', '৯৯০৳ স্পেশাল কম্বো', 'ক্যাশ অন ডেলিভারি', 'সারা বাংলাদেশে হোম ডেলিভারি', '১০০% ঘরে তৈরি']
  const row = [...items, ...items]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i}>✦ {t}</span>
        ))}
      </div>
    </div>
  )
}

function Features() {
  const f = [
    { i: '🌞', t: 'রোদে শুকানো', d: 'প্রাকৃতিক রোদে শুকানো' },
    { i: '🏡', t: 'ঘরে তৈরি', d: 'হাতে বানানো ঘরোয়া বড়ি' },
    { i: '💵', t: 'ক্যাশ অন ডেলিভারি', d: 'পণ্য হাতে পেয়ে টাকা' },
    { i: '🚚', t: 'সারা দেশে', d: 'বাংলাদেশের যেকোনো জায়গায়' },
  ]
  return (
    <section className="section">
      <div className="features">
        {f.map((x, i) => (
          <div className="feature reveal" style={{ transitionDelay: `${i * 80}ms` }} key={x.t}>
            <span className="f-icon">{x.i}</span>
            <strong>{x.t}</strong>
            <small>{x.d}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

function BoriPricing() {
  return (
    <section className="section" id="pricing">
      <div className="sec-head reveal">
        <span className="eyebrow">💰 দাম</span>
        <h2>কুমড়ো বড়ির প্যাক বেছে নিন</h2>
        <p>হোম ডেলিভারি চার্জ সারা বাংলাদেশে মাত্র <b>৳{toBn(DELIVERY_CHARGE)}</b></p>
      </div>
      <div className="price-list">
        {boriPrices.map((b, i) => (
          <div className={`price-card reveal ${b.featured ? 'featured' : ''}`} style={{ transitionDelay: `${i * 90}ms` }} key={b.id}>
            {b.featured && <span className="ribbon">⭐ {b.tag}</span>}
            <div className="pc-left">
              <span className="pc-weight">{b.weight}</span>
              {!b.featured && <span className="pc-tag">{b.tag}</span>}
            </div>
            <div className="pc-right">
              <span className="pc-price">৳{taka(b.price)}</span>
              <button className={`btn btn-sm ${b.featured ? '' : 'btn-soft'}`} onClick={() => scrollToOrder(b.id)}>
                অর্ডার
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Combos() {
  return (
    <section className="section combo-sec" id="combo">
      <div className="sec-head reveal">
        <span className="eyebrow">🎁 কম্বো অফার</span>
        <h2>সেরা অফারে খাঁটি দেশি পণ্য</h2>
        <p>দুই কম্বোতেই <b>হোম ডেলিভারি সম্পূর্ণ ফ্রি!</b></p>
      </div>
      <div className="combo-list">
        {combos.map((c, i) => (
          <article className={`combo-card reveal ${c.featured ? 'featured' : ''}`} style={{ transitionDelay: `${i * 120}ms` }} key={c.id}>
            <div className="combo-img">
              <img src={c.image} alt={c.title} loading="lazy" />
              <span className="sale-badge">ফ্রি ডেলিভারি</span>
              {c.featured && <span className="hot-badge">❤️ স্পেশাল</span>}
            </div>
            <div className="combo-body">
              <h3>{c.title}</h3>
              <ul>
                {c.items.map((it) => (
                  <li key={it} className={it.includes('ফ্রি') ? 'highlight-free' : ''}>
                    <span className="tick">{it.includes('ফ্রি') ? '🎁' : '✓'}</span>
                    <span>{it.replace(/^🎁\s*/, '')}</span>
                  </li>
                ))}
              </ul>
              <div className="combo-foot">
                <div>
                  <small>প্যাকেজ মূল্য</small>
                  <div className="combo-price">৳<CountUp to={c.price} /></div>
                </div>
                <button className="btn shine" onClick={() => scrollToOrder(c.id)}>
                  কম্বো নিন
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Products() {
  return (
    <section className="section" id="products">
      <div className="sec-head reveal">
        <span className="eyebrow">🌿 মূল্য তালিকা</span>
        <h2>আমাদের সব পণ্য</h2>
      </div>
      <div className="prod-grid">
        {products.map((p, i) => (
          <div className="prod reveal" style={{ transitionDelay: `${(i % 2) * 90}ms` }} key={p.id}>
            <div className="prod-img">
              <img src={p.image} alt={p.name} loading="lazy" style={p.pos ? { objectPosition: p.pos } : undefined} />
            </div>
            <h4>{p.name}</h4>
            <div className="prod-price">
              ৳{taka(p.price)}
              <small>/{p.unit}</small>
            </div>
            {p.min > 1 ? <span className="min">সর্বনিম্ন {toBn(p.min)} {p.unit}</span> : <span className="min ok">যেকোনো পরিমাণ</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

function Story() {
  return (
    <section className="section">
      <div className="story reveal">
        <img src="/img/maker.webp" alt="রোদে শুকানো কুমড়ো বড়ি" loading="lazy" />
        <div className="story-text">
          <span className="eyebrow light">আমাদের গল্প</span>
          <h3>গ্রামের রোদে, ঘরের যত্নে</h3>
          <p>বাঁশের মাচায় রোদে শুকানো প্রতিটি বড়ি, যাতে রান্নায় আসে সেই পুরনো দিনের স্বাদ।</p>
        </div>
      </div>
    </section>
  )
}

function OrderForm({ onOrderSuccess }) {
  // Selected items: mapping of { [id]: quantity }
  const [selected, setSelected] = useState({ 'combo-799': 1 })
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [err, setErr] = useState({})
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderErr, setOrderErr] = useState('')

  useEffect(() => {
    const h = (e) => {
      const o = orderOptions.find((x) => x.id === e.detail)
      if (o) {
        setSelected({ [o.id]: o.min })
      }
    }
    window.addEventListener('pick-option', h)
    return () => window.removeEventListener('pick-option', h)
  }, [])

  const toggleOption = (o) => {
    const isSelected = Boolean(selected[o.id])
    const currentIds = Object.keys(selected)

    if (isSelected) {
      if (currentIds.length > 1) {
        const next = { ...selected }
        delete next[o.id]
        setSelected(next)
      }
    } else {
      if (currentIds.length < 2) {
        setSelected({ ...selected, [o.id]: o.min })
      } else {
        // If already 2 items selected: keep the first, replace the second
        const [firstId] = currentIds
        setSelected({ [firstId]: selected[firstId], [o.id]: o.min })
      }
    }
  }

  const updateQty = (id, newQty) => {
    setSelected((prev) => ({
      ...prev,
      [id]: Math.max(1, newQty)
    }))
  }

  const selectedList = Object.entries(selected).map(([id, qty]) => {
    const opt = orderOptions.find((x) => x.id === id) || orderOptions[0]
    return {
      ...opt,
      qty
    }
  })

  // Has any combo offer been selected?
  const hasCombo = selectedList.some((item) => item.id.startsWith('combo-'))
  const subtotal = selectedList.reduce((sum, item) => sum + item.price * item.qty, 0)
  const delivery = hasCombo ? 0 : DELIVERY_CHARGE
  const total = subtotal + delivery

  const submit = async (e) => {
    e.preventDefault()
    setOrderErr('')
    const er = {}
    if (form.name.trim().length < 2) er.name = 'আপনার নাম লিখুন'
    if (!/^01[3-9]\d{8}$/.test(form.phone.replace(/\s|-/g, ''))) er.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন'
    if (form.address.trim().length < 8) er.address = 'পূর্ণ ঠিকানা লিখুন'
    setErr(er)
    if (Object.keys(er).length) return

    setLoading(true)
    const orderId = 'KB-' + Date.now().toString(36).toUpperCase()
    const clientIp = await fetchClientIp()

    const itemsPayload = selectedList.map((item) => ({
      id: item.id,
      name: item.label,
      price: item.price,
      quantity: item.qty,
      unit: item.unit,
      total: item.price * item.qty
    }))

    const formattedProductName = selectedList.length === 1
      ? `${selectedList[0].label} (${toBn(selectedList[0].qty)} ${selectedList[0].unit})`
      : selectedList.map((item) => `${item.label} (${toBn(item.qty)} ${item.unit})`).join(' + ')

    const totalQty = selectedList.reduce((acc, item) => acc + item.qty, 0)

    const orderPayload = {
      order_id: orderId,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      package_id: selectedList.map((i) => i.id).join(', '),
      product_name: formattedProductName,
      package_name: formattedProductName,
      quantity: totalQty,
      unit: selectedList.length === 1 ? selectedList[0].unit : 'আইটেম',
      unit_price: selectedList[0].price,
      subtotal: subtotal,
      delivery_charge: delivery,
      delivery_fee: delivery,
      total_price: total,
      ip_address: clientIp,
      items: itemsPayload,
      status: 'pending'
    }

    const result = await submitOrder(orderPayload)
    setLoading(false)

    if (result.success) {
      setForm({ name: '', phone: '', address: '' })
      if (onOrderSuccess) {
        onOrderSuccess(orderPayload)
      } else {
        setDone(true)
      }
    } else {
      setOrderErr(result.error || 'অর্ডার করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।')
    }
  }

  return (
    <section className="section order-sec" id="order">
      <div className="sec-head reveal">
        <span className="eyebrow">🛒 অর্ডার</span>
        <h2>অর্ডার করতে ফর্মটি পূরণ করুন</h2>
        <p>ক্যাশ অন ডেলিভারি, পণ্য হাতে পেয়ে টাকা দিন</p>
      </div>

      <form className="order-card reveal" onSubmit={submit} noValidate>
        <div className="opt-header-row">
          <label className="lbl" style={{ margin: 0 }}>প্যাকেজ / পণ্য বেছে নিন</label>
          <span className="opt-limit-pill">সর্বোচ্চ ২টি আইটেম</span>
        </div>

        <div className="opt-helper-banner">
          <span>💡 একসাথে যেকোনো <b>২টি পণ্য</b> সিলেক্ট করতে পারবেন।</span>
          {hasCombo ? (
            <span className="combo-free-pill">🎉 কম্বো সিলেক্ট করায় ডেলিভারি সম্পূর্ণ ফ্রি!</span>
          ) : (
            <span className="combo-hint-pill">🚚 কম্বো অফার নিলে ডেলিভারি চার্জ সম্পূর্ণ ফ্রি পাবেন!</span>
          )}
        </div>

        <div className="opts">
          {orderOptions.map((o) => {
            const isSelected = Boolean(selected[o.id])
            const isCombo = o.id.startsWith('combo-')
            let deliverySub = o.sub
            let isFree = false
            if (isCombo) {
              deliverySub = 'ফ্রি ডেলিভারি'
              isFree = true
            } else if (hasCombo) {
              deliverySub = '🎉 ফ্রি ডেলিভারি (কম্বোর সাথে)'
              isFree = true
            }

            return (
              <button
                type="button"
                key={o.id}
                className={`opt ${isSelected ? 'active' : ''}`}
                onClick={() => toggleOption(o)}
                aria-pressed={isSelected}
              >
                <span className={`chk ${isSelected ? 'checked' : ''}`}>
                  {isSelected ? '✓' : ''}
                </span>
                <span className="opt-text">
                  <b>{o.label}</b>
                  <small className={isFree ? 'free' : ''}>{deliverySub}</small>
                </span>
                <span className="opt-price">
                  ৳{taka(o.price)}
                  {o.unit === 'কেজি' && <small>/কেজি</small>}
                </span>
              </button>
            )
          })}
        </div>

        <div className="qty-section">
          <label className="lbl">
            {selectedList.length > 1
              ? `নির্বাচিত পণ্যের পরিমাণ (${toBn(selectedList.length)}টি পণ্য)`
              : `পরিমাণ (${selectedList[0]?.unit || 'কেজি'})`}
          </label>

          {selectedList.length === 1 ? (
            <div className="stepper">
              <button
                type="button"
                onClick={() => updateQty(selectedList[0].id, Math.max(selectedList[0].min, selectedList[0].qty - 1))}
                disabled={selectedList[0].qty <= selectedList[0].min}
                aria-label="কমান"
              >
                −
              </button>
              <span key={selectedList[0].qty} className="pop">{toBn(selectedList[0].qty)}</span>
              <button
                type="button"
                onClick={() => updateQty(selectedList[0].id, selectedList[0].qty + 1)}
                aria-label="বাড়ান"
              >
                +
              </button>
            </div>
          ) : (
            <div className="multi-steppers">
              {selectedList.map((item) => (
                <div key={item.id} className="multi-stepper-row">
                  <div className="multi-stepper-info">
                    <b>{item.label}</b>
                    <small>
                      ৳{taka(item.price)} × {toBn(item.qty)} {item.unit} = ৳{taka(item.price * item.qty)}
                    </small>
                  </div>
                  <div className="stepper stepper-sm">
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, Math.max(item.min, item.qty - 1))}
                      disabled={item.qty <= item.min}
                      aria-label="কমান"
                    >
                      −
                    </button>
                    <span className="pop">{toBn(item.qty)} {item.unit}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      aria-label="বাড়ান"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label className="lbl" htmlFor="name">আপনার নাম</label>
          <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="যেমন: রহিম উদ্দিন" />
          {err.name && <span className="err">{err.name}</span>}
        </div>
        <div className="field">
          <label className="lbl" htmlFor="phone">মোবাইল নম্বর</label>
          <input id="phone" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
          {err.phone && <span className="err">{err.phone}</span>}
        </div>
        <div className="field">
          <label className="lbl" htmlFor="address">পূর্ণ ঠিকানা</label>
          <textarea id="address" rows="3" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="বাসা, রোড, থানা, জেলা" />
          {err.address && <span className="err">{err.address}</span>}
        </div>

        <div className="summary">
          {selectedList.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#4b5563' }}>
              <span>{item.label} ({toBn(item.qty)} {item.unit})</span>
              <span>৳{taka(item.price * item.qty)}</span>
            </div>
          ))}
          <div>
            <span>ডেলিভারি চার্জ</span>
            {delivery === 0 ? (
              <span className="free">ফ্রি 🎉 {hasCombo ? '(কম্বো অফার)' : ''}</span>
            ) : (
              <span>৳{taka(delivery)}</span>
            )}
          </div>
          <div className="total">
            <span>সর্বমোট</span>
            <span key={total} className="pop">৳{taka(total)}</span>
          </div>
        </div>

        {orderErr && <span className="err" style={{ marginBottom: '12px', textAlign: 'center' }}>{orderErr}</span>}
        <button type="submit" className="btn btn-lg btn-block shine" disabled={loading}>
          {loading ? 'অর্ডার জমা হচ্ছে...' : `অর্ডার কনফার্ম করুন · ৳${taka(total)}`}
        </button>
      </form>

      {done && (
        <div className="modal" onClick={() => { setDone(false); setForm({ name: '', phone: '', address: '' }); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="check">✓</div>
            <h3>ধন্যবাদ, {form.name}!</h3>
            <p>আপনার অর্ডারটি সফলভাবে জমা হয়েছে। খুব শীঘ্রই <b>{form.phone}</b> নম্বরে কল করে কনফার্ম করা হবে।</p>
            <button className="btn btn-block" onClick={() => { setDone(false); setForm({ name: '', phone: '', address: '' }); }}>ঠিক আছে</button>
          </div>
        </div>
      )}
    </section>
  )
}

function FAQ() {
  const qs = [
    ['ডেলিভারি কত দিনে পাব?', 'অর্ডার কনফার্ম হওয়ার পর কুরিয়ারে পাঠানো হয়। সময় এলাকাভেদে কিছুটা ভিন্ন হতে পারে।'],
    ['টাকা কীভাবে দেব?', 'ক্যাশ অন ডেলিভারি, পণ্য হাতে পেয়ে ডেলিভারি ম্যানকে টাকা দেবেন।'],
    ['কম্বোতে ডেলিভারি চার্জ লাগবে?', 'না, দুই কম্বো অফারেই সারা বাংলাদেশে হোম ডেলিভারি সম্পূর্ণ ফ্রি।'],
    ['ডাল ও আটার সর্বনিম্ন পরিমাণ কত?', 'মাসকলাইয়ের ডাল ও আটা সর্বনিম্ন ২ কেজি, লাল গমের আটা সর্বনিম্ন ৩ কেজি।'],
  ]
  const [open, setOpen] = useState(0)
  return (
    <section className="section" id="faq">
      <div className="sec-head reveal">
        <span className="eyebrow">❓ প্রশ্ন</span>
        <h2>সাধারণ জিজ্ঞাসা</h2>
      </div>
      <div className="faq reveal">
        {qs.map(([q, a], i) => (
          <div className={`faq-item ${open === i ? 'open' : ''}`} key={q}>
            <button type="button" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              <span>{q}</span>
              <span className="chev">+</span>
            </button>
            <div className="faq-a"><p>{a}</p></div>
          </div>
        ))}
      </div>
    </section>
  )
}

function StickyBar() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const order = document.getElementById('order')
      const r = order?.getBoundingClientRect()
      const inOrder = r && r.top < window.innerHeight && r.bottom > 0
      setShow(window.scrollY > 500 && !inOrder)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <div className={`sticky-bar ${show ? 'show' : ''}`}>
      <div>
        <small>কম্বো শুরু</small>
        <b>৳৭৯৯ · ফ্রি ডেলিভারি</b>
      </div>
      <button className="btn shine" onClick={() => scrollToOrder()}>অর্ডার করুন</button>
    </div>
  )
}

function FloatingFacebook() {
  return (
    <aside aria-label="সোশ্যাল চ্যাট">
      <a
        href="https://www.facebook.com/mangogardenbd1"
        target="_blank"
        rel="noopener noreferrer"
        className="floating-fb"
        aria-label="ফেসবুকে যোগাযোগ করুন"
        title="ম্যাঙ্গো গার্ডেন ফেসবুক পেজ"
      >
        <span className="floating-fb-pulse" />
        <div className="floating-fb-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span className="floating-fb-status" />
        </div>
        <span className="floating-fb-text">ফেসবুকে মেসেজ দিন</span>
      </a>
    </aside>
  )
}

function Storefront({ onOpenAdmin, onOrderSuccess }) {
  useReveal()
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <BoriPricing />
        <Combos />
        <Products />
        <Story />
        <OrderForm onOrderSuccess={onOrderSuccess} />
        <CustomerReviews />
        <FAQ />
      </main>
      <footer className="footer">
        <div className="footer-brand">
          <img src="/img/logo.jpg" alt="ম্যাঙ্গো গার্ডেন লোগো" className="footer-logo" />
          <b>ম্যাঙ্গো গার্ডেন</b>
        </div>
        <p>ঘরোয়া স্বাদের খাঁটি দেশি পণ্য ও কুমড়ো বড়ি · সারা বাংলাদেশে হোম ডেলিভারি</p>
        <div className="footer-links">
          <a
            href="https://www.facebook.com/mangogardenbd1"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-fb-pill"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>ফেসবুক পেজ ভিজিট করুন</span>
          </a>
        </div>
        <div style={{ margin: '14px 0 8px' }}>
          <button
            type="button"
            onClick={onOpenAdmin}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.45)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              transition: 'color .2s, background .2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.background = 'none' }}
            title="অ্যাডমিন প্যানেল (অথবা প্রেস করুন Ctrl+Shift+A)"
          >
            ⚙️ অ্যাডমিন প্যানেল
          </button>
        </div>
        <small>© {toBn(new Date().getFullYear())} ম্যাঙ্গো গার্ডেন · সর্বস্বত্ব সংরক্ষিত</small>
      </footer>
      <FloatingFacebook />
      <StickyBar />
    </>
  )
}

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        return 'admin';
      }
      if (window.location.hash === '#success' || window.location.pathname.startsWith('/order-success')) {
        return 'success';
      }
    }
    return 'store';
  });

  const [latestOrder, setLatestOrder] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = sessionStorage.getItem('mangogarden_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname.startsWith('/admin')) {
        setCurrentView('admin');
      } else if (window.location.hash === '#success' || window.location.pathname.startsWith('/order-success')) {
        setCurrentView('success');
      } else {
        setCurrentView('store');
      }
    };

    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateToAdmin();
      }
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('popstate', handleHash);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const navigateToAdmin = () => {
    window.location.hash = 'admin';
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToStore = () => {
    window.location.hash = '';
    setCurrentView('store');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderData) => {
    setLatestOrder(orderData);
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('mangogarden_last_order', JSON.stringify(orderData));
      }
    } catch (e) {
      console.warn('sessionStorage save error:', e);
    }
    window.location.hash = 'success';
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CmsProvider>
      {currentView === 'admin' ? (
        <AdminApp onNavigateStore={navigateToStore} />
      ) : currentView === 'success' ? (
        <OrderSuccessPage order={latestOrder} onReturnHome={navigateToStore} />
      ) : (
        <Storefront onOpenAdmin={navigateToAdmin} onOrderSuccess={handleOrderSuccess} />
      )}
    </CmsProvider>
  );
}
