'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttractionCard } from '@/components/attractions/AttractionCard';
import { useFavorites } from '@/lib/queries/favorites';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthUser } from '@/types';

const schema = z.object({ fullName: z.string().min(2, 'Required').max(120) });
type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [hydrated, setHydrated] = useState(false);
  const { data: favorites, isLoading: favoritesLoading } = useFavorites();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { fullName: user?.fullName ?? '' } });

  useEffect(() => {
    setHydrated(true);
    reset({ fullName: user?.fullName ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.fullName]);

  async function onSubmit(values: FormValues) {
    try {
      const res = await api.patch<{ user: AuthUser }>('/auth/me', values);
      setAuth(res.data.user, accessToken!);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    }
  }

  if (!hydrated) return null;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold">Your profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...register('fullName')} />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-display text-2xl font-bold">Your favorites</h2>
        <div className="mt-6">
          {favoritesLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : favorites?.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((favorite) => (
                <AttractionCard key={favorite.id} attraction={favorite.attraction} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t saved any attractions yet — tap the heart icon on an attraction to save it here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
