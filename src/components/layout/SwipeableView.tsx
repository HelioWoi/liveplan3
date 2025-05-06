import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, ReactNode } from 'react';

interface SwipeableViewProps {
  children: ReactNode;
  onRefresh?: () => Promise<void>;
}

const SWIPE_THRESHOLD = 50; // pixels
const PULL_THRESHOLD = 100; // pixels

export default function SwipeableView({ children, onRefresh }: SwipeableViewProps) {
  const navigate = useNavigate();
  const [pullStartY, setPullStartY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const routes = ['/dashboard', '/', '/simulator', '/profile'];

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      const currentIndex = routes.indexOf(window.location.pathname);
      if (currentIndex < routes.length - 1 && Math.abs(eventData.deltaX) > SWIPE_THRESHOLD) {
        navigate(routes[currentIndex + 1]);
      }
    },
    onSwipedRight: (eventData) => {
      const currentIndex = routes.indexOf(window.location.pathname);
      if (currentIndex > 0 && Math.abs(eventData.deltaX) > SWIPE_THRESHOLD) {
        navigate(routes[currentIndex - 1]);
      }
    },
    onTouchStartOrOnMouseDown: ({ event }) => {
      if (event instanceof TouchEvent) {
        setPullStartY(event.touches[0].clientY);
      }
    },
    onTouchEndOrOnMouseUp: () => {
      if (pulling && pullStartY > PULL_THRESHOLD) {
        handleRefresh();
      }
      setPulling(false);
      setPullStartY(0);
    },
    onSwiping: ({ event }) => {
      if (event instanceof TouchEvent && window.scrollY === 0) {
        const touchY = event.touches[0].clientY;
        const pullDistance = touchY - pullStartY;
        
        if (pullDistance > 0) {
          setPulling(true);
        }
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  useEffect(() => {
    // Cleanup function
    return () => {
      setPulling(false);
      setRefreshing(false);
    };
  }, []);

  return (
    <div {...handlers} className="min-h-screen">
      {/* Pull to refresh indicator */}
      {pulling && !refreshing && (
        <div className="fixed top-0 left-0 right-0 flex justify-center py-2 bg-gray-100 z-50 transition-transform">
          <span className="text-sm text-gray-600">
            Pull down to refresh...
          </span>
        </div>
      )}
      {refreshing && (
        <div className="fixed top-0 left-0 right-0 flex justify-center py-2 bg-gray-100 z-50">
          <span className="text-sm text-gray-600">
            Refreshing...
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
