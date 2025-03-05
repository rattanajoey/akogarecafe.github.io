'use client';

import dynamic from 'next/dynamic';
import MainLayout from '../components/Layout/MainLayout';

// Dynamically import the MusicSection with SSR disabled
const MusicSection = dynamic(
  () => import('../../src/components/Music/MusicSection'),
  { ssr: false }
);

export default function MusicPage() {
  return (
    <MainLayout>
      <MusicSection />
    </MainLayout>
  );
} 