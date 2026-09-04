import { AuthContext } from '@/hooks/use-auth';
import { createRootRouteWithContext, Outlet, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'

type RouterContext = {
  authentication: AuthContext;
};

/**
 * Starts every page at the top.
 *
 * TanStack Router keeps the window's scroll position across a route change by default, so
 * following a link while scrolled down a long page (e.g. Training packages) drops you into
 * the middle of whichever page loads next.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }) }, [pathname])
  return null
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  ),
})
