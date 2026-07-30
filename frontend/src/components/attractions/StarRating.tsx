'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 16 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = Boolean(onChange);

  return (
    <div className={cn('flex items-center gap-0.5', interactive && 'cursor-pointer')}>
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(!interactive && 'cursor-default')}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            className={star <= Math.round(value) ? 'fill-accent text-accent' : 'text-muted-foreground'}
          />
        </button>
      ))}
    </div>
  );
}
