'use client';

import Link from 'next/link';
import { Landmark } from 'lucide-react';
import { useCategories } from '@/lib/queries/categories';
import { Card } from '@/components/ui/card';

export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!categories?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/attractions?category=${category.slug}`}>
          <Card className="flex h-24 flex-col items-center justify-center gap-2 text-center transition-colors hover:border-primary hover:bg-primary/5">
            <Landmark className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">{category.name}</span>
          </Card>
        </Link>
      ))}
    </div>
  );
}
