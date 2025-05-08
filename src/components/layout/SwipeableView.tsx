import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { useEffect, ReactNode } from 'react';

interface SwipeableViewProps {
  children: ReactNode;
}

const SWIPE_THRESHOLD = 50; // pixels


export default function SwipeableView({ children }: SwipeableViewProps) {
  const navigate = useNavigate();


  const routes = ['/dashboard', '/', '/simulator', '/profile'];



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
    preventScrollOnSwipe: true,
    trackMouse: true
  });



  console.log('SwipeableView handlers:', handlers);
  return (
    <div {...handlers} className="min-h-screen">
      {children}
    </div>
  );
}
