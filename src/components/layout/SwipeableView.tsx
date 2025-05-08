import { useSwipeable } from 'react-swipeable';
import { ReactNode } from 'react';

interface SwipeableViewProps {
  children: ReactNode;
}

export default function SwipeableView({ children }: SwipeableViewProps) {
  // Handlers removidos para desativar a navegação por swipe
  const handlers = useSwipeable({
    // Sem handlers de swipe
    preventScrollOnSwipe: false,
    trackMouse: false
  });

  return (
    <div {...handlers} className="min-h-screen">
      {children}
    </div>
  );
}
