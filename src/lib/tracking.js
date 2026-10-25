/**
 * Enterprise Tracking Engine for Mango Garden Kumro Bori
 * Supports:
 * 1. Facebook Meta Browser Pixel
 * 2. Facebook Conversions API (CAPI) with Server-Side Deduplication & Test Event Code
 * 3. TikTok Pixel & Events
 * 4. Google Analytics 4 (GA4) & Google Tag Manager (GTM) with Standard window.dataLayer
 */

import { getEffectiveOrderQty } from './orderHelper';

// Helper to hash string to SHA-256 (required by Meta CAPI)
async function hashSha256(value) {
  if (!value) return null;
  const clean = value.toString().trim().toLowerCase();
  if (!clean) return null;

  try {
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(clean);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) {
    console.warn('Crypto SHA-256 fallback notice:', e);
  }
  return clean;
}

// Format Bangladeshi phone to E.164 (e.g. 01712345678 -> 8801712345678)
function formatPhoneE164(phone) {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return '88' + digits;
  return digits;
}

// 1. INITIALIZE TRACKERS ON PAGE LOAD
export function initTracking(siteSettings) {
  if (typeof window === 'undefined' || !siteSettings) return;

  const fbPixelId = siteSettings.fb_pixel_id?.trim();
  const tiktokPixelId = siteSettings.tiktok_pixel_id?.trim();
  const gtmId = siteSettings.gtm_id?.trim();
  const ga4Id = (siteSettings.ga4_id || siteSettings.ga4_measurement_id)?.trim();
  const isEnabled = siteSettings.pixel_enabled !== false;

  // Always initialize window.dataLayer for Google Analytics / GTM
  window.dataLayer = window.dataLayer || [];

  if (!isEnabled) {
    console.log('[Tracking] Tracking is disabled in settings.');
    return;
  }

  // --- A. Facebook Pixel Initialization ---
  if (fbPixelId && !window.__fb_pixel_loaded) {
    /* eslint-disable */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */

    window.fbq('init', fbPixelId);
    window.fbq('track', 'PageView');
    window.__fb_pixel_loaded = true;
    console.log(`[Tracking] Meta Pixel initialized: ${fbPixelId}`);
  }

  // --- B. TikTok Pixel Initialization ---
  if (tiktokPixelId && window.__tiktok_pixel_loaded !== tiktokPixelId) {
    /* eslint-disable */
    (function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = (w[t] = w[t] || []);
      (ttq.methods = [
        'page',
        'track',
        'identify',
        'instances',
        'debug',
        'on',
        'off',
        'once',
        'ready',
        'alias',
        'group',
        'enableCookie',
        'disableCookie'
      ]),
        (ttq.setAndDefer = function (t, e) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        });
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      (ttq.instance = function (t) {
        for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
          ttq.setAndDefer(e, ttq.methods[n]);
        return e;
      }),
        (ttq.load = function (e, n) {
          var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
          (ttq._i = ttq._i || {}),
            (ttq._i[e] = []),
            (ttq._i[e]._u = i),
            (ttq._t = ttq._t || {}),
            (ttq._t[e] = +new Date()),
            (ttq._o = ttq._o || {}),
            (ttq._o[e] = n || {});
          var o = document.createElement('script');
          (o.type = 'text/javascript'), (o.async = !0), (o.src = i + '?sdkid=' + e + '&lib=' + t);
          var a = document.getElementsByTagName('script')[0] || document.head;
          if (a.parentNode && a.tagName === 'SCRIPT') {
            a.parentNode.insertBefore(o, a);
          } else {
            document.head.appendChild(o);
          }
        });
      ttq.load(tiktokPixelId);
      ttq.page();
    })(window, document, 'ttq');
    /* eslint-enable */

    window.__tiktok_pixel_loaded = tiktokPixelId;
    console.log(`[Tracking] TikTok Pixel initialized: ${tiktokPixelId}`);
  }

  // --- C. Google Tag Manager Initialization ---
  if (gtmId && !window.__gtm_loaded) {
    /* eslint-disable */
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', gtmId);
    /* eslint-enable */

    window.__gtm_loaded = true;
    console.log(`[Tracking] GTM initialized: ${gtmId}`);
  }

  // --- D. Google Analytics 4 (gtag) Initialization ---
  if (ga4Id && !window.__ga4_loaded) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(script);

    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', ga4Id);
    window.__ga4_loaded = true;
    console.log(`[Tracking] GA4 initialized: ${ga4Id}`);
  }

  // Push standard initial PageView to dataLayer
  window.dataLayer.push({
    event: 'page_view',
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
}

// Track route/page view transition across SPAs
export function trackPageView(pageTitle) {
  if (typeof window === 'undefined') return;
  if (window.ttq) {
    window.ttq.page();
  }
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_title: pageTitle || document.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.hash
    });
  }
}

// 2. VIEW CONTENT / ITEM EVENT
export function trackViewContent({ product, siteSettings }) {
  if (typeof window === 'undefined' || !product) return;
  const eventId = `vc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 650;
  const title = product.title || product.package_name || 'ঘরোয়া খাঁটি কুমড়ো বড়ি';
  const prodId = String(product.id || 'kb-pack');

  // 1. Meta Pixel
  if (window.fbq) {
    window.fbq(
      'track',
      'ViewContent',
      {
        content_name: title,
        content_ids: [prodId],
        content_type: 'product',
        value: price,
        currency: 'BDT'
      },
      { eventID: eventId }
    );
  }

  // 2. TikTok Pixel
  if (window.ttq) {
    window.ttq.track('ViewContent', {
      content_type: 'product',
      contents: [
        {
          content_id: prodId,
          content_type: 'product',
          content_name: title,
          quantity: 1,
          price: price
        }
      ],
      value: price,
      currency: 'BDT'
    });
    console.log('[Tracking] TikTok ViewContent tracked:', { prodId, title, price });
  }

  // 3. Google dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'BDT',
        value: price,
        items: [
          {
            item_id: prodId,
            item_name: title,
            price: price,
            quantity: 1
          }
        ]
      }
    });
  }
}

// 2.5 ADD TO CART EVENT
export function trackAddToCart({ product, quantity = 1, total, siteSettings }) {
  if (typeof window === 'undefined' || !product) return;
  const eventId = `atc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const val = Number(total || (product.price || 0) * quantity);
  const title = product.title || product.package_name || 'ঘরোয়া খাঁটি কুমড়ো বড়ি';
  const prodId = String(product.id || 'kb-pack');
  const unitPrice = Number(product.price || (quantity > 0 ? val / quantity : val));

  // 1. Meta Pixel
  if (window.fbq) {
    window.fbq(
      'track',
      'AddToCart',
      {
        content_name: title,
        content_ids: [prodId],
        content_type: 'product',
        value: val,
        currency: 'BDT',
        num_items: quantity
      },
      { eventID: eventId }
    );
  }

  // 2. TikTok Pixel
  if (window.ttq) {
    window.ttq.track('AddToCart', {
      content_type: 'product',
      contents: [
        {
          content_id: prodId,
          content_type: 'product',
          content_name: title,
          quantity: quantity,
          price: unitPrice
        }
      ],
      value: val,
      currency: 'BDT'
    });
    console.log('[Tracking] TikTok AddToCart tracked:', { prodId, title, val, quantity });
  }

  // 3. Google dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'BDT',
        value: val,
        items: [
          {
            item_id: prodId,
            item_name: title,
            price: unitPrice,
            quantity: quantity
          }
        ]
      }
    });
  }
}

// 3. INITIATE CHECKOUT EVENT
export function trackInitiateCheckout({ product, quantity = 1, total, siteSettings }) {
  if (typeof window === 'undefined' || !product) return;
  const eventId = `ic_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const val = Number(total || (product.price || 0) * quantity);
  const title = product.title || product.package_name || 'ঘরোয়া খাঁটি কুমড়ো বড়ি';
  const prodId = String(product.id || 'kb-pack');
  const unitPrice = Number(product.price || (quantity > 0 ? val / quantity : val));

  // 1. Meta Pixel
  if (window.fbq) {
    window.fbq(
      'track',
      'InitiateCheckout',
      {
        content_name: title,
        content_ids: [prodId],
        content_type: 'product',
        value: val,
        currency: 'BDT',
        num_items: quantity
      },
      { eventID: eventId }
    );
  }

  // 2. TikTok Pixel
  if (window.ttq) {
    window.ttq.track('InitiateCheckout', {
      content_type: 'product',
      contents: [
        {
          content_id: prodId,
          content_type: 'product',
          content_name: title,
          quantity: quantity,
          price: unitPrice
        }
      ],
      value: val,
      currency: 'BDT'
    });
    console.log('[Tracking] TikTok InitiateCheckout tracked:', { prodId, title, val, quantity });
  }

  // 3. Google dataLayer
  if (window.dataLayer) {
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'BDT',
        value: val,
        items: [
          {
            item_id: prodId,
            item_name: title,
            price: unitPrice,
            quantity: quantity
          }
        ]
      }
    });
  }
}

// 4. PURCHASE EVENT (Browser Pixel + CAPI Server-Side Deduplication + Google dataLayer + TikTok)
// Helper to safely fetch client IP address
export async function fetchClientIp() {
  if (typeof window === 'undefined') return 'unknown';
  try {
    const cached = sessionStorage.getItem('mg_client_ip');
    if (cached) return cached;
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2500) });
    const json = await res.json();
    if (json?.ip) {
      sessionStorage.setItem('mg_client_ip', json.ip);
      return json.ip;
    }
  } catch (e) {
    // fallback
  }
  return 'unknown';
}

export async function trackPurchase({ order, siteSettings }) {
  if (typeof window === 'undefined' || !order) return;

  // Crucial: Use exact same order_id as eventID for Meta browser & CAPI deduplication!
  const eventId = order.order_id || `ORD-${Date.now()}`;
  const totalVal = parseFloat(order.total_price || order.total || 0);
  const pkgName = order.package_name || 'ঘরোয়া খাঁটি কুমড়ো বড়ি';
  const qty = getEffectiveOrderQty(order);
  const prodId = 'kb-pack';
  const unitPrice = Number(order.unit_price || (qty > 0 ? totalVal / qty : totalVal));

  console.log(`[Tracking] Triggering Purchase tracking for ${eventId}...`, order);

  // If pixels not yet initialized, trigger init
  if (siteSettings && (!window.ttq || !window.fbq)) {
    try {
      initTracking(siteSettings);
    } catch (e) {
      console.warn('[Tracking] Pre-init tracking notice:', e);
    }
  }

  // --- 1. Browser Meta Pixel ---
  if (window.fbq) {
    window.fbq(
      'track',
      'Purchase',
      {
        content_name: pkgName,
        content_type: 'product',
        content_ids: [prodId],
        value: totalVal,
        currency: 'BDT',
        num_items: qty,
        order_id: eventId
      },
      { eventID: eventId }
    );
    console.log('[Tracking] Meta Browser Pixel Purchase tracked.');
  }

  // --- 2. TikTok Pixel (Advanced Matching + PlaceAnOrder + CompletePayment) ---
  if (window.ttq) {
    // 2a. Advanced Matching: identify user
    try {
      const e164Phone = formatPhoneE164(order.phone);
      if (e164Phone || order.name) {
        window.ttq.identify({
          phone_number: e164Phone ? `+${e164Phone}` : undefined,
          name: order.name || undefined
        });
      }
    } catch (e) {
      console.warn('[Tracking] TikTok identify notice:', e);
    }

    const ttPayload = {
      content_type: 'product',
      contents: [
        {
          content_id: prodId,
          content_type: 'product',
          content_name: pkgName,
          quantity: qty,
          price: unitPrice
        }
      ],
      value: totalVal,
      currency: 'BDT'
    };

    // Track both PlaceAnOrder and CompletePayment to support all campaign types
    window.ttq.track('PlaceAnOrder', ttPayload, { event_id: eventId });
    window.ttq.track('CompletePayment', ttPayload, { event_id: eventId });
    console.log(`[Tracking] TikTok PlaceAnOrder & CompletePayment tracked for ${eventId}.`);
  }

  // --- 3. Google dataLayer (Enhanced Ecommerce & Client IP) ---
  const clientIp = order.ip_address || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('mg_client_ip') : null) || 'unknown';

  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: eventId,
        value: totalVal,
        tax: 0,
        shipping: Number(order.delivery_fee || order.delivery_charge || 0),
        currency: 'BDT',
        items: Array.isArray(order.items) && order.items.length > 0
          ? order.items.map((it) => ({
              item_id: String(it.id || 'kb-pack'),
              item_name: String(it.name || it.label || pkgName),
              price: Number(it.price || it.unit_price || 0),
              quantity: Number(it.quantity || it.qty || 1),
              item_category: 'Food & Grocery'
            }))
          : [
              {
                item_id: order.package_id || 'kb-pack',
                item_name: pkgName,
                price: unitPrice,
                quantity: qty,
                item_category: 'Food & Grocery'
              }
            ]
      },
      customer_name: order.name,
      customer_phone: order.phone,
      customer_address: order.address,
      ip_address: clientIp,
      customer_ip: clientIp,
      client_ip: clientIp,
      user_data: {
        phone: order.phone,
        address: {
          street: order.address,
          country: 'BD'
        }
      }
    });
    console.log('[Tracking] Google dataLayer Purchase pushed with IP:', clientIp, eventId);
  }

  // --- 4. Facebook Conversions API (CAPI) Server-Side Transmission ---
  const fbPixelId = siteSettings?.fb_pixel_id?.trim();
  const fbAccessToken = siteSettings?.fb_capi_access_token?.trim();
  const testEventCode = siteSettings?.fb_test_event_code?.trim();

  if (fbPixelId && fbAccessToken) {
    try {
      const hashedPhone = await hashSha256(formatPhoneE164(order.phone));
      const hashedName = await hashSha256(order.name?.split(' ')[0] || '');

      const capiPayload = {
        data: [
          {
            event_name: 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId, // MATCHING eventID for deduplication!
            event_source_url: window.location.href,
            action_source: 'website',
            user_data: {
              ph: hashedPhone ? [hashedPhone] : undefined,
              fn: hashedName ? [hashedName] : undefined,
              client_user_agent: navigator.userAgent
            },
            custom_data: {
              currency: 'BDT',
              value: totalVal,
              order_id: eventId,
              content_name: pkgName,
              num_items: qty
            }
          }
        ],
        test_event_code: testEventCode || undefined
      };

      // Try local/vercel API route first; fallback to direct Facebook Graph API
      sendCapiEvent({
        pixelId: fbPixelId,
        accessToken: fbAccessToken,
        payload: capiPayload
      });
    } catch (err) {
      console.warn('[Tracking] Facebook CAPI dispatch error:', err);
    }
  }
}

// Internal function to dispatch CAPI event
async function sendCapiEvent({ pixelId, accessToken, payload }) {
  // Method 1: Try serverless endpoint (/api/fb-capi)
  try {
    const apiRes = await fetch('/api/fb-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pixelId, accessToken, payload })
    });
    if (apiRes.ok) {
      const resData = await apiRes.json();
      console.log('[Tracking] Meta CAPI via /api/fb-capi success:', resData);
      return;
    }
  } catch (e) {
    // API endpoint unavailable, fall back to direct Graph API call
  }

  // Method 2: Direct call to Facebook Graph API
  try {
    const graphUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;
    const fbRes = await fetch(graphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const fbData = await fbRes.json();
    console.log('[Tracking] Meta CAPI direct call result:', fbData);
  } catch (e) {
    console.warn('[Tracking] Meta CAPI direct call failed:', e);
  }
}
