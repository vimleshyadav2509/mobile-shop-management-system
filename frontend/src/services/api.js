import { INITIAL_PRODUCTS, MOCK_REPAIRS, SHOP_INFO } from '../data/mockData';

// Determine API Base URL dynamically:
// - If VITE_API_URL is configured, sanitize trailing slashes and ensure /api endpoint path
// - Defaults to local relative '/api' for Vite dev proxy or same-domain deployment
function resolveApiBaseUrl() {
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (!envUrl) {
    return '/api';
  }
  const cleanUrl = envUrl.replace(/\/+$/, '');
  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }
  return `${cleanUrl}/api`;
}

const BASE_URL = resolveApiBaseUrl();

// Helper to resolve static image assets against remote backend if decoupled without reverse proxy
export function getStaticAssetUrl(path) {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const envUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (envUrl && !envUrl.startsWith('/')) {
    const cleanOrigin = envUrl.replace(/\/+$/, '').replace(/\/api$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanOrigin}${cleanPath}`;
  }
  return path;
}


export async function fetchProducts(condition = null, brand = null, includeOutOfStock = false, search = null, category = null) {
  try {
    let url = `${BASE_URL}/products`;
    const params = new URLSearchParams();
    if (condition) params.append('condition', condition);
    if (brand && brand.toLowerCase() !== 'all' && brand !== 'All Brands') params.append('brand', brand);
    if (category && category.toLowerCase() !== 'all') params.append('category', category);
    if (search && search.trim()) params.append('search', search.trim());
    if (includeOutOfStock) params.append('include_out_of_stock', 'true');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    console.warn('[API] Products response was not an array:', data);
    throw new Error('Non-array response from API');
  } catch (err) {
    console.warn('[API] Products fetch failed or timed out, using fallback:', err);
    let filtered = Array.isArray(INITIAL_PRODUCTS) ? [...INITIAL_PRODUCTS] : [];
    if (condition === 'new') {
      filtered = filtered.filter(p => p.condition === 'new');
    } else if (condition === 'refurbished' || condition === 'second_hand') {
      filtered = filtered.filter(p => p.condition !== 'new');
    }
    if (brand && brand !== 'All Brands' && brand.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => (p.brand || '').toLowerCase() === brand.toLowerCase());
    }
    if (!includeOutOfStock) {
      filtered = filtered.filter(p => p.in_stock);
    }
    return filtered;
  }
}

export async function fetchRepairStatus(jobSheetId) {
  const cleanId = (jobSheetId || '').trim().toUpperCase();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${BASE_URL}/repairs/${encodeURIComponent(cleanId)}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Job Sheet "${cleanId}" not found. Please check receipt.`);
      }
      throw new Error(`Tracking server error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    if (err.message && err.message.includes('not found')) {
      throw err;
    }
    console.warn('[API] Repair tracking fetch network failure, checking fallback:', err);
    if (!import.meta.env.PROD && MOCK_REPAIRS && MOCK_REPAIRS[cleanId]) {
      return MOCK_REPAIRS[cleanId];
    }
    throw err;
  }
}

export async function fetchRepairs(limit = 50) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${BASE_URL}/repairs?limit=${limit}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
    throw new Error('Non-array response from repairs API');
  } catch (err) {
    console.warn('[API] Repairs fetch failed, using fallback:', err);
    if (!import.meta.env.PROD && MOCK_REPAIRS) {
      return Object.values(MOCK_REPAIRS);
    }
    return [];
  }
}

export async function updateRepairStatus(repairId, status, technicianNotes = null) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to update repair status.');

  const cleanId = (repairId || '').trim();
  const res = await fetch(`${BASE_URL}/repairs/${encodeURIComponent(cleanId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status,
      technician_notes: technicianNotes
    })
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    let msg = errData.detail;
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || m.message).join(', ');
    } else if (typeof msg === 'object' && msg !== null) {
      msg = JSON.stringify(msg);
    }
    throw new Error(msg || `Failed to update repair status (${res.status})`);
  }

  return await res.json();
}

export async function createRepairTicket(ticketData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to create repair ticket.');

  const res = await fetch(`${BASE_URL}/repairs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(ticketData)
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    let msg = errData.detail;
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || m.message).join(', ');
    } else if (typeof msg === 'object' && msg !== null) {
      msg = JSON.stringify(msg);
    }
    throw new Error(msg || `Failed to create repair ticket (${res.status})`);
  }

  return await res.json();
}

export async function calculateEstimate(brand, model, issue, notes = '') {
  try {
    const res = await fetch(`${BASE_URL}/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brand, model, issue, notes })
    });
    if (!res.ok) throw new Error(`Estimate API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] AI Estimator server error, calculating local heuristic:', err);
    const issueLower = issue.toLowerCase();
    let minCost = 1400;
    let maxCost = 2200;
    let time = "1 - 2 Hours";
    let quality = "High Quality AAA+ Tested Folder with 3 Months Warranty";

    if (issueLower.includes('battery')) {
      minCost = 850;
      maxCost = 1400;
      time = "30 - 45 Minutes";
      quality = "Certified Grade A+ Battery with 6 Months Guarantee";
    } else if (issueLower.includes('charg') || issueLower.includes('port')) {
      minCost = 450;
      maxCost = 750;
      time = "30 Minutes";
      quality = "Original Type-C Sub-board with Fast Charge";
    } else if (issueLower.includes('water')) {
      minCost = 900;
      maxCost = 1800;
      time = "3 - 4 Hours";
      quality = "Ultrasonic Motherboard De-oxidation & Circuit Test";
    } else if (issueLower.includes('mic') || issueLower.includes('speaker')) {
      minCost = 350;
      maxCost = 650;
      time = "30 Minutes";
      quality = "Original Sound Chamber Component";
    }

    const waText = encodeURIComponent(
      `Hello Amit Mobile Shop, I need an estimate for my ${brand} ${model} (${issue}). Estimated cost: ₹${minCost} - ₹${maxCost}. Can I visit today?`
    );

    return {
      brand,
      model,
      issue,
      estimated_min_cost: minCost,
      estimated_max_cost: maxCost,
      turnaround_time: time,
      part_quality: quality,
      confidence: "Verified Store Benchmark",
      ai_generated: false,
      summary: `Estimated repair for ${brand} ${model} (${issue}) is ₹${minCost} – ₹${maxCost}.`,
      technician_tip: "Visit Amit Mobile Shop (Kuk Nagar Grint Rd, Khorare, Uttar Pradesh 271312) for counter diagnosis.",
      breakdown: {
        part_cost_min: minCost - 300,
        part_cost_max: maxCost - 300,
        service_charge: 300,
        estimated_min_total: minCost,
        estimated_max_total: maxCost,
        estimated_turnaround_time: time,
        warranty_provided: "Up to 6 Months Warranty + Instant Testing at Counter"
      },
      whatsapp_link: `https://wa.me/${SHOP_INFO.whatsapp}?text=${waText}`
    };
  }
}

// --- Admin Authentication & Dashboard API ---

export function getStoredToken() {
  return localStorage.getItem('ams_admin_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('ams_admin_token', token);
  } else {
    localStorage.removeItem('ams_admin_token');
  }
}

export function clearStoredToken() {
  localStorage.removeItem('ams_admin_token');
}

export async function adminLogin(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid username or password. Please try again.');
  }

  const data = await res.json();
  setStoredToken(data.access_token);
  return data;
}

export async function getCurrentAdmin() {
  const token = getStoredToken();
  if (!token) throw new Error('No authentication token found');

  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearStoredToken();
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Session expired. Please log in again.');
  }

  return await res.json();
}

export async function adminLogout() {
  const token = getStoredToken();
  try {
    if (token) {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  } catch (err) {
    console.warn('[API] Logout request error:', err);
  } finally {
    clearStoredToken();
  }
  return true;
}

export async function changeAdminPassword(currentPassword, newPassword) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to change password.');

  const res = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    })
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    let msg = errData.detail;
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || m.message).join(', ');
    } else if (typeof msg === 'object' && msg !== null) {
      msg = JSON.stringify(msg);
    }
    throw new Error(msg || `Failed to change password (${res.status})`);
  }

  return await res.json();
}


export async function fetchAdminStats() {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required');

  const res = await fetch(`${BASE_URL}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
    }
    throw new Error(`Failed to fetch admin stats: ${res.status}`);
  }

  return await res.json();
}

// --- Product Management CRUD Services ---

export async function fetchProductById(productId) {
  const res = await fetch(`${BASE_URL}/products/${productId}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Product not found.`);
    }
    throw new Error(`Server error (${res.status}) while fetching product.`);
  }
  return await res.json();
}

export async function createProduct(productData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to create product.');

  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    let msg = errData.detail;
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || m.message).join(', ');
    }
    throw new Error(msg || `Failed to create product (${res.status})`);
  }

  return await res.json();
}

export async function updateProduct(productId, productData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to update product.');

  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    let msg = errData.detail;
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || m.message).join(', ');
    }
    throw new Error(msg || `Failed to update product (${res.status})`);
  }

  return await res.json();
}

export async function patchProduct(productId, patchData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to update product.');

  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(patchData)
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    let msg = errData.detail;
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || m.message).join(', ');
    }
    throw new Error(msg || `Failed to update product (${res.status})`);
  }

  return await res.json();
}

export async function deleteProduct(productId) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to delete product.');

  const res = await fetch(`${BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to delete product (${res.status})`);
  }

  return await res.json();
}

export async function uploadProductImage(file) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to upload image.');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/products/upload-image`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired or unauthorized. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    let msg = errData.detail;
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || m.message).join(', ');
    } else if (typeof msg === 'object' && msg !== null) {
      msg = JSON.stringify(msg);
    }
    throw new Error(msg || `Image upload failed (${res.status})`);
  }

  return await res.json();
}

// ==========================================
// PHASE 4: EMI MANAGEMENT API
// ==========================================

export async function fetchEmiPlans(productId = null, allPlans = false) {
  try {
    let url = `${BASE_URL}/emi`;
    const params = new URLSearchParams();
    if (productId) params.append('product_id', productId);
    if (allPlans) params.append('all_plans', 'true');
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[API] Failed to fetch EMI plans:', err);
    return [];
  }
}

export async function createEmiPlan(planData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to create EMI plan.');

  const res = await fetch(`${BASE_URL}/emi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(planData)
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to create EMI plan (${res.status})`);
  }
  return await res.json();
}

export async function updateEmiPlan(planId, planData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to update EMI plan.');

  const res = await fetch(`${BASE_URL}/emi/${planId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(planData)
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to update EMI plan (${res.status})`);
  }
  return await res.json();
}

export async function deleteEmiPlan(planId) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to delete EMI plan.');

  const res = await fetch(`${BASE_URL}/emi/${planId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to delete EMI plan (${res.status})`);
  }
  return await res.json();
}

// ==========================================
// PHASE 4: SHOP SETTINGS API
// ==========================================

export async function fetchShopSettings() {
  try {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Failed to fetch shop settings, using default fallback:', err);
    return {
      shop_name: 'Amit Mobile Shop',
      tagline: 'Smartphones, Certified Pre-Owned & Expert Repairs',
      phone1: '+91 98765 43210',
      phone2: '+91 91234 56789',
      whatsapp: '919876543210',
      email: 'contact@amitmobileshop.com',
      address: 'Main Market, Station Road, Opp. City Mall, Mirzapur, UP 231001',
      opening_time: '10:00 AM',
      closing_time: '09:00 PM',
      weekly_off: 'None (Open All 7 Days)',
      google_maps_url: 'https://maps.google.com'
    };
  }
}

export async function updateShopSettings(settingsData) {
  const token = getStoredToken();
  if (!token) throw new Error('Authentication required to update shop settings.');

  const res = await fetch(`${BASE_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(settingsData)
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearStoredToken();
      throw new Error('Session expired. Please log in again.');
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to update shop settings (${res.status})`);
  }
  return await res.json();
}

// ==========================================
// PHASE 4: REPAIR STATUS HISTORY & WHATSAPP
// ==========================================

export async function fetchRepairHistory(jobSheetId) {
  const cleanId = (jobSheetId || '').trim().toUpperCase();
  try {
    const res = await fetch(`${BASE_URL}/repairs/${encodeURIComponent(cleanId)}/history`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[API] Failed to fetch repair history:', err);
    return [];
  }
}

export function getWhatsAppInquiryUrl(product, plan = null, shopPhone = '919876543210') {
  const phone = (shopPhone || '919876543210').replace(/[^0-9]/g, '');
  let message = `Hello Amit Mobile Shop, I am interested in purchasing:\n*${product.title || product.model}*`;
  if (product.price) {
    message += ` (Price: ₹${product.price.toLocaleString('en-IN')})`;
  }
  if (product.condition) {
    message += `\nCondition: ${product.condition.toUpperCase()}`;
  }
  if (plan) {
    message += `\n\nI want to apply for the *${plan.provider}* EMI Plan:`;
    message += `\n- Duration: ${plan.duration_months} Months`;
    message += `\n- Monthly EMI: ₹${plan.monthly_emi.toLocaleString('en-IN')}/mo`;
    if (plan.down_payment > 0) {
      message += `\n- Down Payment: ₹${plan.down_payment.toLocaleString('en-IN')}`;
    }
  }
  message += `\n\nPlease let me know documentation required and availability at your shop.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}


