'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAdminAttractions, useDeleteAttraction } from '@/lib/queries/attractions';
import type { Attraction } from '@/types';

export function AttractionsTable() {
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<Attraction | null>(null);
  const { data, isLoading } = useAdminAttractions({ q: q || undefined, pageSize: 50, sort: 'newest' });
  const deleteAttraction = useDeleteAttraction();

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteAttraction.mutateAsync(toDelete.id);
      toast.success(`${toDelete.name} deleted`);
    } catch {
      toast.error('Could not delete attraction');
    } finally {
      setToDelete(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search attractions…"
            className="w-64 border-none bg-transparent p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <Button asChild>
          <Link href="/admin/attractions/new" className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add attraction
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : data?.items.length ? (
              data.items.map((attraction) => (
                <tr key={attraction.id}>
                  <td className="px-4 py-3 font-medium">{attraction.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{attraction.category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{attraction.district}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <Badge variant={attraction.isPublished ? 'default' : 'muted'}>
                        {attraction.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {attraction.isFeatured && <Badge variant="secondary">Featured</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/attractions/${attraction.id}/edit`} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete"
                        onClick={() => setToDelete(attraction)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No attractions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(toDelete)} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {toDelete?.name}?</DialogTitle>
            <DialogDescription>
              This permanently removes the attraction and its images. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteAttraction.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
