import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Starts every page at the top.
 *
 * A single-page app keeps the window's scroll position across a route change, so following
 * a link from halfway down one page drops you into the middle — or the end — of the next.
 *
 * A hash is left alone: "/about#coaching" is a request for a specific section, and the
 * browser scrolls to it once the target has rendered.
 */
const useScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);
};

/** Mount inside the router; renders nothing. */
export function ScrollToTop() {
  useScrollToTop();
  return null;
}

export default useScrollToTop;
