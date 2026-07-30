import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AttractionsPageClient } from './AttractionsPageClient';

export const metadata: Metadata = {
  title: 'Attractions',
  description: "Search and filter Yaoundé's monuments, museums, parks, wildlife, and cultural sites.",
};

export default function AttractionsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">Loading attractions…</div>}>
      <AttractionsPageClient />
    </Suspense>
  );
}
