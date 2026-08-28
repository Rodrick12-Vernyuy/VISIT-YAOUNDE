import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function ChatFab() {
  return (
    <Link
      href="/chat"
      aria-label="Open live chat"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-emerald-600"
    >
      <MessageCircle className="h-6 w-6" />
    </Link>
  );
}
