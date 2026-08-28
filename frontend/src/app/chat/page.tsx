'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const CHAT_WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL ?? 'ws://localhost:5000';

type ChatMessage = {
  id: number;
  kind: 'own' | 'other' | 'system';
  sender?: string;
  text: string;
};

// Distinct, high-contrast colors so each participant reads as a different
// person at a glance — picked at random per username, not per message.
const SENDER_COLORS = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-orange-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-lime-600',
];

function colorForSender(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return SENDER_COLORS[hash % SENDER_COLORS.length];
}

function parseIncoming(text: string): { sender?: string; text: string; system: boolean } {
  if (text.startsWith('[')) return { text, system: true };
  const separator = text.indexOf(': ');
  if (separator === -1) return { text, system: true };
  return { sender: text.slice(0, separator), text: text.slice(separator + 2), system: false };
}

export default function ChatPage() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    return () => socketRef.current?.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function pushMessage(msg: Omit<ChatMessage, 'id'>) {
    setMessages((prev) => [...prev, { ...msg, id: nextId.current++ }]);
  }

  function joinChat(e: FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    const socket = new WebSocket(CHAT_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => pushMessage({ kind: 'system', text: 'Could not reach the chat server.' });

    let step = 0;
    socket.onmessage = (event) => {
      const text: string = event.data;
      if (step === 0) {
        socket.send(username.trim());
        step = 1;
      } else if (step === 1) {
        socket.send(room.trim() || 'general');
        step = 2;
      } else {
        const parsed = parseIncoming(text);
        pushMessage(
          parsed.system
            ? { kind: 'system', text: parsed.text }
            : { kind: 'other', sender: parsed.sender, text: parsed.text }
        );
      }
    };
  }

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !socketRef.current) return;
    socketRef.current.send(draft.trim());
    pushMessage({ kind: 'own', text: draft.trim() });
    setDraft('');
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">Live chat</h1>
      <p className="mt-1 text-muted-foreground">Chat with other travellers about Yaoundé in real time.</p>

      <Card className="mt-6 flex h-[60vh] flex-col p-4">
        {!connected ? (
          <form onSubmit={joinChat} className="m-auto flex w-full max-w-sm flex-col gap-4">
            <div className="space-y-1">
              <Label htmlFor="username">Your name</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Amina"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="room">Room</Label>
              <Input id="room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="general" />
            </div>
            <Button type="submit">Join chat</Button>
          </form>
        ) : (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto px-1 py-1">
              {messages.map((msg) => {
                if (msg.kind === 'system') {
                  return (
                    <p key={msg.id} className="py-1 text-center text-xs text-muted-foreground">
                      {msg.text}
                    </p>
                  );
                }

                const isOwn = msg.kind === 'own';
                return (
                  <div key={msg.id} className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
                    <div className={cn('flex max-w-[75%] flex-col', isOwn ? 'items-end' : 'items-start')}>
                      {!isOwn && msg.sender && (
                        <span className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">{msg.sender}</span>
                      )}
                      <div
                        className={cn(
                          'break-words rounded-2xl px-3 py-2 text-sm text-white shadow-sm',
                          isOwn ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm',
                          !isOwn && colorForSender(msg.sender ?? '')
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                autoFocus
              />
              <Button type="submit">Send</Button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
