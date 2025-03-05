'use client';

import { useEffect } from 'react';

export function useCursorEffect() {
  useEffect(() => {
    // Only run this effect in the browser, not during server-side rendering
    if (typeof window === 'undefined') return;

    // Use setTimeout to ensure the DOM is fully loaded
    const timeoutId = setTimeout(() => {
      const cursor = document.querySelector('.cursor');
      const follower = document.querySelector('.follower');

      const handleMouseMove = (e) => {
        if (cursor) cursor.style.cssText = `left: ${e.clientX}px; top: ${e.clientY}px;`;
        if (follower) follower.style.cssText = `left: ${e.clientX}px; top: ${e.clientY}px;`;
      };

      if (cursor || follower) {
        document.addEventListener('mousemove', handleMouseMove);
      }

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        clearTimeout(timeoutId);
      };
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timeoutId);
  }, []);
} 