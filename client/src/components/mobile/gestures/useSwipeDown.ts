import { useEffect } from 'react';

// Detects a downward swipe starting near the top of a target element.
// When the swipe travels > threshold pixels, calls onTrigger().
export function useSwipeDown(
  ref: React.RefObject<HTMLElement | null>,
  onTrigger: () => void,
  threshold = 60,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startY: number | null = null;
    let startX: number | null = null;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };
    const onMove = (e: TouchEvent) => {
      if (startY === null || startX === null) return;
      const dy = e.touches[0].clientY - startY;
      const dx = Math.abs(e.touches[0].clientX - startX);
      if (dy > threshold && dx < 80) {
        onTrigger();
        startY = null;
        startX = null;
      }
    };
    const onEnd = () => {
      startY = null;
      startX = null;
    };
    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    el.addEventListener('touchcancel', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [ref, onTrigger, threshold]);
}
