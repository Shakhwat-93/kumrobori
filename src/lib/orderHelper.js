/**
 * Order Quantity & Courier Formatting Utilities
 * Standardizes calculation of package items, quantities, and courier clipboards.
 * 
 * Specifically:
 * - 1 bottle course (750 taka) = 1 packet
 * - 2 bottles course (1200 taka) = 2 packets ("2 packet = 1200 taka")
 */

export function getEffectiveOrderQty(ord) {
  if (!ord) return 1;
  const rawQty = Number(ord.quantity);
  const price = Math.round(Number(ord.total_price || ord.total || 0));
  const pkg = String(ord.package_name || '').toLowerCase();

  // If already explicitly set to 2 or more
  if (rawQty > 1) {
    return rawQty;
  }

  // Multiple of 1200 (1200 taka = 2 packets, 2400 taka = 4 packets, etc.)
  if (price > 0 && price % 1200 === 0 && price !== 750) {
    return (price / 1200) * 2;
  }

  // 1200 taka / 2 bottles course is specifically 2 packets
  if (
    price === 1200 ||
    pkg.includes('২ বোতল') ||
    pkg.includes('2 বোতল') ||
    pkg.includes('2 bottle') ||
    pkg.includes('২ মাসের')
  ) {
    return 2;
  }

  return rawQty > 0 ? rawQty : 1;
}

export function formatOrderCourierText(ord) {
  if (!ord) return '';

  const name = String(ord.name || '').trim();
  const address = String(ord.address || '').trim();
  const phone = String(ord.phone || '').trim();
  const qty = getEffectiveOrderQty(ord);
  const price = Math.round(Number(ord.total_price || ord.total || 0));

  return `${name}\n${address}\n${phone}\n${qty} packet = ${price} taka`;
}

export default {
  getEffectiveOrderQty,
  formatOrderCourierText
};
