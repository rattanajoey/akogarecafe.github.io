'use client';

import { useEffect } from 'react';
import { Box } from '@mui/material';
import HeaderComponent from '../Header/HeaderComponent';
import SpeedDialComponent from '../SpeedDial/SpeedDialComponent';
import { useCursorEffect } from '../../lib/useCursorEffect';

export default function MainLayout({ children }) {
  // Use the custom cursor effect hook
  useCursorEffect();

  // Ensure cursor elements exist
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if cursor elements already exist
    let cursor = document.querySelector('.cursor');
    let follower = document.querySelector('.follower');

    // Create elements if they don't exist
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.className = 'cursor';
      document.body.appendChild(cursor);
    }

    if (!follower) {
      follower = document.createElement('div');
      follower.className = 'follower';
      document.body.appendChild(follower);
    }

    return () => {
      // Clean up is optional here since these elements are shared
    };
  }, []);

  return (
    <div className="App">
      <HeaderComponent />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <SpeedDialComponent />
    </div>
  );
} 