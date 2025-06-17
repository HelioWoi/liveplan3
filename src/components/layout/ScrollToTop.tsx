import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls the window to the top whenever
 * the pathname in the location changes.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on page navigation
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
