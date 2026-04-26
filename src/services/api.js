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

/* Admin products */

export function getAdminProducts(token) {
  return request('/admin/products', { token })
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

export function getAdminOrders(token) {
  return request('/admin/orders', { token })
}

/* Admin users */

export function getAdminUsers(token) {
  return request('/admin/users', { token })
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