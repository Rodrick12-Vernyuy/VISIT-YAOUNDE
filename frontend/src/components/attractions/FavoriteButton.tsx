'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsFavorited, useToggleFavorite } from '@/lib/queries/favorites';
import { useAuthStore } from '@/stores/auth.store';

export function FavoriteButton({ attractionId, className }: { attractionId: string; className?: string }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isFavorited = useIsFavorited(attractionId);
  const toggleFavorite = useToggleFavorite(attractionId);

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.info('Log in to save favorites');
      router.push('/login');
      return;
    }

    toggleFavorite.mutate();
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
      onClick={handleClick}
      disabled={toggleFavorite.isPending}
      className={cn('backdrop-blur', className)}
    >
      <Heart className={cn('h-4 w-4', isFavorited && 'fill-destructive text-destructive')} />
    </Button>
  );
}
