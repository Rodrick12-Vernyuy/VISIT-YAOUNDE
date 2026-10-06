'use client';

import { Copy, Facebook, Mail, MessageCircle, Share2, Twitter } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const shareText = `Discover ${title} on Visit Yaoundé`;

  function openShareMenu() {
    setUrl(window.location.href);
    setOpen(true);
  }

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy the link. Please copy it from the address bar.');
    }
  }

  async function openNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch {
        // user cancelled share sheet
      }
      return;
    }
    await copyLink();
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const platforms = [
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`, icon: MessageCircle },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, icon: Facebook },
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, icon: Twitter },
    { name: 'Email', href: `mailto:?subject=${encodedText}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}`, icon: Mail },
  ];

  return (
    <>
      <Button variant="outline" size="icon" aria-label="Share" onClick={openShareMenu}>
        <Share2 className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Share this place</DialogTitle>
            <DialogDescription>Send {title} to friends or add it to your trip conversation.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map(({ name, href, icon: Icon }) => (
              <Button key={name} variant="outline" asChild className="justify-start gap-2">
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <Icon className="h-4 w-4" /> {name}
                </a>
              </Button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => void copyLink()}>
              <Copy className="h-4 w-4" /> Copy link
            </Button>
            <Button type="button" variant="outline" className="flex-1 gap-2" onClick={() => void openNativeShare()}>
              <Share2 className="h-4 w-4" /> More apps
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
