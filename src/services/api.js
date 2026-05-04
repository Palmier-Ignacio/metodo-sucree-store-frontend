const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await res.json() : null

  if (!res.ok) {
    throw new Error(payload?.message || payload?.error || 'No se pudo completar la solicitud')
  }

  return payload
}

async function authHeaders(getTokenOrToken) {
  const token = typeof getTokenOrToken === 'function'
    ? await getTokenOrToken()
    : getTokenOrToken

  return token ? { Authorization: `Bearer ${token}` } : {}
}


function buildQuery(params = {}) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value)
    }
  })

  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

async function request(path, options = {}) {
  const { method = 'GET', body, token, headers = {} } = options

  const auth = await authHeaders(token)

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...auth,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  return parseResponse(res)
}

/* Public */

export function getProducts() {
  return request('/products')
}

export function getFeaturedProducts() {
  return request('/products?featured=true')
}

export function getProductById(id) {
  return request(`/products/${id}`)
}

export function getActiveBanner() {
  return request('/banners/active')
}

export function sendContactMessage(payload) {
  return request('/contact', {
    method: 'POST',
    body: payload,
  })
}

/* Checkout */

export function createPreference(items, token) {
  return request('/checkout/create-preference', {
    method: 'POST',
    token,
    body: {
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity || 1,
      })),
    },
  })
}

export function syncCheckoutOrder(orderId, token) {
  return request(`/checkout/sync/${orderId}`, {
    method: 'POST',
    token,
  })
}

/* User */

export function getMyLibrary(token) {
  return request('/me/library', { token })
}

export function createDownloadUrl(productId, token) {
  return request(`/me/library/${productId}/download`, {
    method: 'POST',
    token,
  })
}

/* Admin dashboard */

export function getAdminSummary(token) {
  return request('/admin/summary', { token })
}

export function getAdminRevenue(params = {}, token) {
  return request(`/admin/revenue${buildQuery(params)}`, { token })
}

/* Admin products */

export function getAdminProducts(token, params = {}) {
  return request(`/admin/products${buildQuery(params)}`, { token })
}

export function getAdminProductById(id, token) {
  return request(`/admin/products/${id}`, { token })
}

export function createAdminProduct(payload, token) {
  return request('/admin/products', {
    method: 'POST',
    body: payload,
    token,
  })
}

export function updateAdminProduct(id, payload, token) {
  return request(`/admin/products/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  })
}

/* Admin orders */

export function getAdminOrders(token, params = {}) {
  return request(`/admin/orders${buildQuery(params)}`, { token })
}

export function getAdminOrderById(id, token) {
  return request(`/admin/orders/${id}`, { token })
}

/* Admin users */

export function getAdminUsers(token, params = {}) {
  return request(`/admin/users${buildQuery(params)}`, { token })
}

export function getAdminUserById(id, token) {
  return request(`/admin/users/${id}`, { token })
}

export function updateAdminUser(id, payload, token) {
  return request(`/admin/users/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  })
}

export function grantAdminUserProduct(userId, productId, token) {
  return request(`/admin/users/${userId}/products`, {
    method: 'POST',
    body: { productId },
    token,
  })
}

export function revokeAdminUserProduct(userId, productId, token) {
  return request(`/admin/users/${userId}/products/${productId}`, {
    method: 'DELETE',
    token,
  })
}

/* Admin banners */

export function getAdminBanners(token, params = {}) {
  return request(`/admin/banners${buildQuery(params)}`, { token })
}

export function createAdminBanner(payload, token) {
  return request('/admin/banners', {
    method: 'POST',
    body: payload,
    token,
  })
}

export function updateAdminBanner(id, payload, token) {
  return request(`/admin/banners/${id}`, {
    method: 'PUT',
    body: payload,
    token,
  })
}

export function deleteAdminBanner(id, token) {
  return request(`/admin/banners/${id}`, {
    method: 'DELETE',
    token,
  })
}
