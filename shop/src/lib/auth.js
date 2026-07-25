import { CLIENT_URL, SHOP_URL } from './config'

const encodeSession = value => btoa(unescape(encodeURIComponent(value)))
const decodeSession = value => decodeURIComponent(escape(atob(value)))

export function clientAuthUrl(mode, returnTo = '/') {
  const safePath = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/'
  const callback = `${SHOP_URL}/auth/callback?returnTo=${encodeURIComponent(safePath)}`
  return `${CLIENT_URL}/${mode}?redirect=${encodeURIComponent(callback)}`
}

export function acceptSessionFromHash() {
  const encoded = new URLSearchParams(window.location.hash.replace(/^#/, '')).get('atp_session')
  if (!encoded) return false
  try {
    const raw = decodeSession(encoded)
    const value = JSON.parse(raw)
    if (!value?.auth?.token || !value?.user) return false
    localStorage.setItem('user-payload', JSON.stringify(value))
    return true
  } catch { return false }
}

export function encodeSessionForShop(raw) { return encodeSession(raw) }

export function signOut() {
  localStorage.removeItem('user-payload')
  window.dispatchEvent(new Event('atp-auth-change'))
}
