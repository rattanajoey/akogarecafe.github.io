'use client';

import dynamic from 'next/dynamic';
import MainLayout from '../components/Layout/MainLayout';

// Dynamically import the PortfolioSection with SSR disabled
const PortfolioSection = dynamic(
  () => import('../../src/components/Portfolio/Portfolio'),
  { ssr: false }
);

export default function PortfolioPage() {
  return (
    <MainLayout>
      <PortfolioSection />
    </MainLayout>
  );
} 