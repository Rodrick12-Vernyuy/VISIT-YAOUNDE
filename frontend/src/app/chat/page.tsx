'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CHAT_WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL ?? 'ws://localhost:5000';

export default function ChatPage() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => socketRef.current?.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function joinChat(e: FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;

    const socket = new WebSocket(CHAT_WS_URL);
    socketRef.current = socket;

    socket.onopen = () => setConnected(true);
    socket.onclose = () => setConnected(false);
    socket.onerror = () => setMessages((prev) => [...prev, '[Error] Could not reach the chat server.']);

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
        setMessages((prev) => [...prev, text]);
      }
    };
  }

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !socketRef.current) return;
    socketRef.current.send(draft.trim());
    setMessages((prev) => [...prev, `You: ${draft.trim()}`]);
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
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 text-sm">
              {messages.map((msg, i) => (
                <p key={i} className="text-foreground">
                  {msg}
                </p>
              ))}
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
