export const SHOP_URL = (import.meta.env.VITE_SHOP_URL || 'http://localhost:3003').replace(/\/$/, '')
export const shopHref = (path = '/') => `${SHOP_URL}${path.startsWith('/') ? path : `/${path}`}`

const encodeSession = raw => btoa(unescape(encodeURIComponent(raw)))

/**
 * Opens a shop page carrying the signed-in session across to it.
 *
 * The shop runs on its own origin and therefore has its own storage, so a player who is
 * already signed in here would otherwise be asked to sign in again over there. This hands
 * the session to the shop's auth callback the same way the login redirect does — through
 * the URL fragment, which browsers never send to a server.
 *
 * Built at click time rather than render time so the token never sits in the DOM. Returns
 * false when there is no session, letting the plain link take over.
 */
export function openShopWithSession(path = '/') {
  const session = localStorage.getItem('user-payload')
  if (!session) return false
  try {
    const safePath = path.startsWith('/') && !path.startsWith('//') ? path : '/'
    const target = new URL(`${SHOP_URL}/auth/callback`)
    target.searchParams.set('returnTo', safePath)
    target.hash = new URLSearchParams({ atp_session: encodeSession(session) }).toString()
    window.location.assign(target.toString())
    return true
  } catch {
    return false
  }
}

/** Click handler for any link into the shop: hands off the session, else follows the href. */
export const shopLinkProps = (path = '/') => ({
  href: shopHref(path),
  onClick: event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
    if (openShopWithSession(path)) event.preventDefault()
  },
})

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
