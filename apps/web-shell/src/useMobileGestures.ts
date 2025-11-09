import { useEffect, useRef } from 'react';

export function useMobileGestures(onSwipeUp?: () => void, onSwipeLeft?: () => void, onSwipeRight?: () => void) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEnd.current = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
      };

      if (!touchStart.current || !touchEnd.current) return;

      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Swipe up
      if (deltaY < -50 && absY > absX && onSwipeUp) {
        onSwipeUp();
      }
      // Swipe left
      else if (deltaX < -50 && absX > absY && onSwipeLeft) {
        onSwipeLeft();
      }
      // Swipe right
      else if (deltaX > 50 && absX > absY && onSwipeRight) {
        onSwipeRight();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeUp, onSwipeLeft, onSwipeRight]);
}

