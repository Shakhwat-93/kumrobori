// সব দাম ও প্যাকেজ এখানে — দাম বদলাতে শুধু এই ফাইল এডিট করুন।
export const DELIVERY_CHARGE = 100
const bn = (n) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[d])

export const boriPrices = [
  { id: 'bori-1', weight: '১ কেজি', price: 650, tag: 'সবচেয়ে জনপ্রিয়', featured: true, min: 1, max: 2 },
]

export const combos = [
  {
    id: 'combo-799',
    title: 'গ্রামীণ স্বাদের কম্বো',
    price: 799,
    items: ['৫০০ গ্রাম কুমড়ো বড়ি', '৫০০ গ্রাম মাসকলাইয়ের আটা', '৫০০ গ্রাম মাসকলাইয়ের ডাল'],
    image: '/img/combo-799.jpg',
    pos: 'center 35%',
  },
  {
    id: 'combo-990',
    title: 'স্পেশাল কম্বো অফার',
    price: 990,
    items: [
      '৫০০ গ্রাম কুমড়ো বড়ি',
      '৫০০ গ্রাম পোলাও চাউল',
      '১ কেজি মাসকলাই ডাল',
      '🎁 ১ কেজি গমের লাল আটা সম্পূর্ণ ফ্রি!'
    ],
    image: '/img/combo.webp',
    featured: true,
  },
]

export const products = [
  { id: 'bori-1', name: 'কুমড়ো বড়ি (১ কেজি)', price: 650, unit: 'কেজি', min: 1, max: 2, image: '/img/kumro-bori.webp' },
]

// অর্ডার ফর্মে ঠিক ৩টি নির্ধারিত পণ্য (যেকোনো ১টি নির্বাচনযোগ্য)
export const orderOptions = [
  ...combos.map((c) => ({
    id: c.id,
    label: `${c.title}`,
    sub: 'ফ্রি ডেলিভারি',
    price: c.price,
    freeDelivery: true,
    min: 1,
    max: 1,
    unit: 'প্যাকেজ',
    isCombo: true
  })),
  ...boriPrices.map((b) => ({
    id: b.id,
    label: `কুমড়ো বড়ি — ${b.weight}`,
    sub: '+ ডেলিভারি ১০০৳',
    price: b.price,
    freeDelivery: false,
    min: 1,
    max: 2,
    unit: 'কেজি',
    isCombo: false
  })),
]
