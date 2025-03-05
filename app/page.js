'use client';

import dynamic from 'next/dynamic';
import MainLayout from './components/Layout/MainLayout';

// Dynamically import the ShogiBoardComponent with SSR disabled
const ShogiBoardComponent = dynamic(
  () => import('../src/components/Shogi/ShogiBoardComponent'),
  { ssr: false }
);

export default function Home() {
  return (
    <MainLayout>
      <ShogiBoardComponent />
    </MainLayout>
  );
} 