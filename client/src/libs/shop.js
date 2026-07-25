export const SHOP_URL = (import.meta.env.VITE_SHOP_URL || 'http://localhost:3003').replace(/\/$/, '')
export const shopHref = (path = '/') => `${SHOP_URL}${path.startsWith('/') ? path : `/${path}`}`

const encodeSession = raw => btoa(unescape(encodeURIComponent(raw)))

export function completeAuthRedirect(navigate, search) {
  const requested = new URLSearchParams(search).get('redirect')
  if (!requested) { navigate('/u', { replace: true }); return }

  if (requested.startsWith('/') && !requested.startsWith('//')) {
    navigate(requested, { replace: true })
    return
  }

  try {
    const target = new URL(requested)
    const shop = new URL(SHOP_URL)
    const callbackPath = `${shop.pathname.replace(/\/$/, '')}/auth/callback`.replace(/\/+/g, '/')
    if (target.origin !== shop.origin || target.pathname !== callbackPath) throw new Error('Untrusted redirect')
    const session = localStorage.getItem('user-payload')
    if (!session) throw new Error('Missing session')
    target.hash = new URLSearchParams({ atp_session: encodeSession(session) }).toString()
    window.location.assign(target.toString())
  } catch {
    navigate('/u', { replace: true })
  }
}
