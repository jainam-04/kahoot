import { useEffect } from 'react';

let lockCount = 0;
let savedScrollY = 0;
let touchStartX = 0;
let touchStartY = 0;

/**
 * Checks if an element is currently scrollable vertically
 */
function isVerticallyScrollable(el) {
  if (!el || el === document.body || el === document.documentElement) return false;
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  return (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
}

/**
 * Checks if an element is currently scrollable horizontally
 */
function isHorizontallyScrollable(el) {
  if (!el || el === document.body || el === document.documentElement) return false;
  const style = window.getComputedStyle(el);
  const overflowX = style.overflowX;
  return (overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth;
}

/**
 * Traverses up from target to find the nearest scrollable element
 */
function getScrollableAncestor(target, direction = 'vertical') {
  let el = target;
  while (el && el !== document.body && el !== document.documentElement) {
    if (el instanceof HTMLElement) {
      if (direction === 'vertical' && isVerticallyScrollable(el)) {
        return el;
      }
      if (direction === 'horizontal' && isHorizontallyScrollable(el)) {
        return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}

function handleTouchStart(e) {
  if (e.touches && e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
}

function handleTouchMove(e) {
  if (lockCount <= 0) return;

  if (!e.touches || e.touches.length !== 1) return;

  const currentX = e.touches[0].clientX;
  const currentY = e.touches[0].clientY;
  const deltaX = currentX - touchStartX;
  const deltaY = currentY - touchStartY;

  // Determine if gesture is primarily horizontal or vertical
  const isHorizontalGesture = Math.abs(deltaX) > Math.abs(deltaY);

  if (isHorizontalGesture) {
    const hScrollable = getScrollableAncestor(e.target, 'horizontal');
    if (!hScrollable) {
      if (e.cancelable) e.preventDefault();
      return;
    }
    // Check horizontal boundaries
    const isAtLeft = hScrollable.scrollLeft <= 0 && deltaX > 0;
    const isAtRight = hScrollable.scrollLeft + hScrollable.clientWidth >= hScrollable.scrollWidth - 1 && deltaX < 0;
    if ((isAtLeft || isAtRight) && e.cancelable) {
      e.preventDefault();
    }
    return;
  }

  // Vertical gesture
  const vScrollable = getScrollableAncestor(e.target, 'vertical');

  // If touch is on backdrop, header, or non-scrollable area, completely block background drag
  if (!vScrollable) {
    if (e.cancelable) {
      e.preventDefault();
    }
    return;
  }

  // If inside scrollable container, prevent overscroll / scroll chaining at boundaries
  const isAtTop = vScrollable.scrollTop <= 0 && deltaY > 0;
  const isAtBottom = vScrollable.scrollTop + vScrollable.clientHeight >= vScrollable.scrollHeight - 1 && deltaY < 0;

  if ((isAtTop || isAtBottom) && e.cancelable) {
    e.preventDefault();
  }
}

function handleWheel(e) {
  if (lockCount <= 0) return;

  const vScrollable = getScrollableAncestor(e.target, 'vertical');

  // If mouse wheel is on backdrop, header, or outside popup, block background scroll
  if (!vScrollable) {
    if (e.cancelable) {
      e.preventDefault();
    }
    return;
  }

  // Prevent scroll chaining at top/bottom boundaries
  const isAtTop = vScrollable.scrollTop <= 0 && e.deltaY < 0;
  const isAtBottom = vScrollable.scrollTop + vScrollable.clientHeight >= vScrollable.scrollHeight - 1 && e.deltaY > 0;

  if ((isAtTop || isAtBottom) && e.cancelable) {
    e.preventDefault();
  }
}

/**
 * Increment lock count and apply scroll locking on the first lock
 */
export function lockScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount++;

  if (lockCount === 1) {
    // Save current scroll position
    savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

    // Compensate for scrollbar disappearing to avoid layout shift on desktop
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.documentElement.classList.add('gubbi-scroll-locked');
    document.body.classList.add('gubbi-scroll-locked');

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('wheel', handleWheel, { passive: false });
  }
}

/**
 * Decrement lock count and release scroll locking when all locks are cleared
 */
export function unlockScroll() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    document.documentElement.classList.remove('gubbi-scroll-locked');
    document.body.classList.remove('gubbi-scroll-locked');
    document.body.style.paddingRight = '';

    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('wheel', handleWheel);

    // Restore scroll position without jumping
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedScrollY);
    html.style.scrollBehavior = prevScrollBehavior;
  }
}

/**
 * Reset all active locks safely (e.g. on unmount or route transition)
 */
export function resetScrollLock() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (lockCount > 0) {
    lockCount = 0;
    document.documentElement.classList.remove('gubbi-scroll-locked');
    document.body.classList.remove('gubbi-scroll-locked');
    document.body.style.paddingRight = '';

    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('wheel', handleWheel);

    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, savedScrollY);
    html.style.scrollBehavior = prevScrollBehavior;
  }
}

/**
 * Custom React Hook to lock/unlock background scroll for popups, modals, and drawers
 * @param {boolean} locked Whether the overlay is currently open/locked
 */
export function useScrollLock(locked = true) {
  useEffect(() => {
    if (!locked) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [locked]);
}

export default useScrollLock;

