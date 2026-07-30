'use client';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function ShareButton({ title }: { title: string }) {
  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled share sheet
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  }

  return (
    <Button variant="outline" size="icon" aria-label="Share" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
    </Button>
  );
}
