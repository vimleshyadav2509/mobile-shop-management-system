/**
 * Authoritative Shop Location Source of Truth for Amit Mobile Shop.
 * Address: Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312
 * Coordinates: 27.0161817, 82.5375051
 */

export const SHOP_LOCATION = {
  name: 'Amit Mobile Shop',
  tagline: 'Smartphones, Certified Pre-Owned & Expert Repairs',
  address: 'Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312',
  landmark: 'Near Khorare Chowraha',
  city: 'Khorare',
  state: 'Uttar Pradesh',
  pincode: '271312',
  latitude: 27.0161817,
  longitude: 82.5375051,
  phone1: '6306657432',
  phone2: '9721996477',
  whatsapp: '916306657432',
  timing: 'Open Daily: 9:00 AM - 8:30 PM',
  // Official Google Maps direct search URL with exact coordinates (never defaults or random)
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=27.0161817,82.5375051',
  // Google Maps navigation direction URL
  mapsNavUrl: 'https://www.google.com/maps/dir/?api=1&destination=27.0161817,82.5375051',
  // Verified short share link
  mapsShareUrl: 'https://maps.app.goo.gl/Cumott8vek7HA85K9',
  // Direct embed map URL pointing to Amit mobile shop coordinates
  embedUrl: 'https://maps.google.com/maps?q=Amit+mobile+shop,+27.0161817,82.5375051&t=&z=16&ie=UTF8&iwloc=&output=embed'
};

/**
 * Open Amit Mobile Shop exact coordinates directly in Google Maps or the device's native map application.
 * Does NOT request browser user geolocation.
 */
export function openShopLocationInMaps() {
  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    // Open in native map app intent or mobile browser
    window.open(`https://maps.google.com/?q=${SHOP_LOCATION.latitude},${SHOP_LOCATION.longitude}`, '_blank');
  } else {
    window.open(SHOP_LOCATION.mapsUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * Open turn-by-turn directions to Amit Mobile Shop.
 */
export function openShopDirections() {
  window.open(SHOP_LOCATION.mapsNavUrl, '_blank', 'noopener,noreferrer');
}
