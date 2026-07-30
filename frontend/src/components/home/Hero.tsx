'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    router.push(query ? `/attractions?q=${encodeURIComponent(query)}` : '/attractions');
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary to-primary/80 text-secondary-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-accent"
        >
          The City of Seven Hills
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl"
        >
          Discover Yaoundé, Cameroon&apos;s vibrant capital
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg text-secondary-foreground/85"
        >
          Monuments, museums, parks, wildlife, and living culture — explore the attractions that make Yaoundé one
          of Central Africa&apos;s most captivating cities.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="mt-10 flex max-w-xl gap-2 rounded-xl bg-background/95 p-2 shadow-xl backdrop-blur"
        >
          <div className="flex flex-1 items-center gap-2 px-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search attractions, districts, categories…"
              className="border-none bg-transparent p-0 text-foreground shadow-none focus-visible:ring-0"
            />
          </div>
          <Button type="submit" size="lg">
            Search
          </Button>
        </motion.form>
      </div>
    </section>
  );
}
