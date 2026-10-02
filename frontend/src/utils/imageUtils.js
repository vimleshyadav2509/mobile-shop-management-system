// Central Image URL Resolver and Image Utilities for Amit Mobile Shop
// Authoritative source of truth: Product database record image_url

export const PLACEHOLDER_PHONE_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'><rect width='14' height='20' x='5' y='2' rx='2' ry='2'/><circle cx='12' cy='18' r='1'/></svg>";

/**
 * Extract the backend origin URL (e.g. 'https://mobile-shop-management-system-production.up.railway.app')
 * from environment variables VITE_BACKEND_URL or VITE_API_URL.
 */
export function getBackendOrigin() {
  const envUrl = (
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    ''
  ).trim();

  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    // Strip trailing slashes and trailing /api suffix
    return envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
  }
  return '';
}

/**
 * Resolve product image URL against the backend origin.
 *
 * Rules:
 * 1. If imageUrl is empty/null/undefined -> safe neutral placeholder.
 * 2. If imageUrl is absolute (http://, https://, data:, blob:) -> return as is.
 * 3. If imageUrl is a relative path (e.g. /static/uploads/products/...) ->
 *    resolve against backend API origin.
 *
 * CRITICAL RULE: A valid uploaded image_url is NEVER replaced by a mock or placeholder.
 */
export function resolveProductImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.trim()) {
    return PLACEHOLDER_PHONE_SVG;
  }
  const clean = imageUrl.trim();

  // If already absolute URL, data URI, or blob URL, return unchanged
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  // Relative path resolution
  const backendOrigin = getBackendOrigin();
  const normalizedPath = clean.startsWith('/') ? clean : `/${clean}`;

  if (backendOrigin) {
    return `${backendOrigin}${normalizedPath}`;
  }

  // When no remote origin is configured (e.g. local dev Vite proxy), return relative path
  return normalizedPath;
}

/**
 * Safe image load error handler.
 * Only replaces the broken image with a neutral placeholder when loading actually fails.
 * Never causes infinite error loops.
 */
export function handleImageError(e, fallback = PLACEHOLDER_PHONE_SVG) {
  if (e && e.target) {
    e.target.onerror = null; // Prevent infinite error loops
    e.target.src = fallback;
  }
}
