// সব দাম ও প্যাকেজ এখানে — দাম বদলাতে শুধু এই ফাইল এডিট করুন।
export const DELIVERY_CHARGE = 100
const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])

export const boriPrices = [
  { id: 'bori-500', weight: '৫০০ গ্রাম', price: 399, tag: 'ট্রায়াল প্যাক' },
  { id: 'bori-1', weight: '১ কেজি', price: 650, tag: 'সবচেয়ে জনপ্রিয়', featured: true },
  { id: 'bori-2', weight: '২ কেজি', price: 1299, tag: 'ফ্যামিলি প্যাক' },
]

export const combos = [
  {
    id: 'combo-799',
    title: 'গ্রামীণ স্বাদের কম্বো',
    price: 799,
    items: ['৫০০ গ্রাম কুমড়ো বড়ি', '৫০০ গ্রাম মাসকলাইয়ের আটা', '৫০০ গ্রাম মাসকলাইয়ের ডাল'],
    image: '/img/combo.webp',
  },
  {
    id: 'combo-950',
    title: 'স্পেশাল কম্বো অফার',
    price: 950,
    items: ['৫০০ গ্রাম কুমড়ো বড়ি', '১ কেজি মাসকলাইয়ের ডাল', '১ কেজি লাল গমের আটা'],
    image: '/img/combo.webp',
    featured: true,
  },
]

export const products = [
  { id: 'p-bori', name: 'কুমড়ো বড়ি', price: 650, unit: 'কেজি', min: 1, image: '/img/kumro-bori.webp' },
  { id: 'p-dal', name: 'মাসকলাইয়ের ডাল', price: 300, unit: 'কেজি', min: 2, image: '/img/maskalai-dal.webp', pos: 'center bottom' },
  { id: 'p-ata', name: 'মাসকলাইয়ের আটা', price: 250, unit: 'কেজি', min: 2, image: '/img/maskalai-ata.webp' },
  { id: 'p-gom', name: 'লাল গমের আটা', price: 130, unit: 'কেজি', min: 5, image: '/img/lal-gom-ata.webp' },
]

// অর্ডার ফর্মে যেসব অপশন দেখাবে
export const orderOptions = [
  ...combos.map((c) => ({ id: c.id, label: `${c.title}`, sub: 'ফ্রি ডেলিভারি', price: c.price, freeDelivery: true, min: 1, unit: 'প্যাকেজ' })),
  ...boriPrices.map((b) => ({ id: b.id, label: `কুমড়ো বড়ি — ${b.weight}`, sub: '+ ডেলিভারি ১০০৳', price: b.price, freeDelivery: false, min: 1, unit: 'প্যাক' })),
  ...products.slice(1).map((p) => ({ id: p.id, label: p.name, sub: `সর্বনিম্ন ${bn(p.min)} ${p.unit}`, price: p.price, freeDelivery: false, min: p.min, unit: p.unit })),
]
