import { API_URL, DEFAULT_SETTINGS } from './config'

const session = () => {
  try { return JSON.parse(localStorage.getItem('user-payload') || 'null') } catch { return null }
}

async function request(path, options = {}) {
  const token = session()?.auth?.token
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.message || 'The ATP Royal service is unavailable.')
    error.status = response.status
    throw error
  }
  return data
}

export const getProducts = async () => (await request('/store/products')).products || []
export const getProduct = async slug => (await request(`/store/products/${encodeURIComponent(slug)}`)).product
export const getSettings = async () => ({ ...DEFAULT_SETTINGS, ...((await request('/store/settings')).settings || {}) })
export const createCheckout = payload => request('/store/checkout', { method: 'POST', body: JSON.stringify(payload) })
export const verifyOrder = (id, reference) => request(`/store/orders/${encodeURIComponent(id)}/verify?reference=${encodeURIComponent(reference)}`)
export const getSession = session
export const getUser = () => session()?.user || null
