'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { useCategories } from '@/lib/queries/categories';
import { useCreateAttraction, useUpdateAttraction } from '@/lib/queries/attractions';
import type { Attraction } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Required'),
  shortDescription: z.string().min(10, 'At least 10 characters').max(280),
  description: z.string().min(20, 'At least 20 characters'),
  history: z.string().optional(),
  district: z.string().min(2, 'Required'),
  address: z.string().min(2, 'Required'),
  latitude: z.coerce.number().gte(-90).lte(90),
  longitude: z.coerce.number().gte(-180).lte(180),
  openingHours: z.string().min(2, 'Required'),
  entryFee: z.string().min(1, 'Required'),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  estimatedVisitDuration: z.string().optional(),
  bestVisitingTime: z.string().optional(),
  safetyInfo: z.string().optional(),
  accessibilityInfo: z.string().optional(),
  visitorTips: z.string().optional(),
  categoryId: z.string().uuid('Select a category'),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function toFormValues(attraction?: Attraction): Partial<FormValues> {
  if (!attraction) return { isFeatured: false, isPublished: true };
  return {
    name: attraction.name,
    shortDescription: attraction.shortDescription,
    description: attraction.description,
    history: attraction.history ?? '',
    district: attraction.district,
    address: attraction.address,
    latitude: attraction.latitude,
    longitude: attraction.longitude,
    openingHours: attraction.openingHours,
    entryFee: attraction.entryFee,
    contactPhone: attraction.contactPhone ?? '',
    contactEmail: attraction.contactEmail ?? '',
    estimatedVisitDuration: attraction.estimatedVisitDuration ?? '',
    bestVisitingTime: attraction.bestVisitingTime ?? '',
    safetyInfo: attraction.safetyInfo ?? '',
    accessibilityInfo: attraction.accessibilityInfo ?? '',
    visitorTips: attraction.visitorTips ?? '',
    categoryId: attraction.category.id,
    isFeatured: attraction.isFeatured,
    isPublished: attraction.isPublished,
  };
}

export function AttractionForm({ mode, attraction }: { mode: 'create' | 'edit'; attraction?: Attraction }) {
  const router = useRouter();
  const { data: categories } = useCategories();
  const createAttraction = useCreateAttraction();
  const updateAttraction = useUpdateAttraction(attraction?.id ?? '');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: toFormValues(attraction) });

  async function onSubmit(values: FormValues) {
    const payload = { ...values, contactEmail: values.contactEmail || undefined };
    try {
      if (mode === 'create') {
        const created = await createAttraction.mutateAsync(payload);
        toast.success('Attraction created — now add some photos');
        router.push(`/admin/attractions/${created.id}/edit`);
      } else {
        await updateAttraction.mutateAsync(payload);
        toast.success('Attraction updated');
      }
    } catch {
      toast.error('Could not save attraction');
    }
  }

  const isSaving = createAttraction.isPending || updateAttraction.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={watch('categoryId')} onValueChange={(value) => setValue('categoryId', value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="district">District</Label>
            <Input id="district" {...register('district')} />
            {errors.district && <p className="text-sm text-destructive">{errors.district.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="latitude">Latitude</Label>
            <Input id="latitude" type="number" step="any" {...register('latitude')} />
            {errors.latitude && <p className="text-sm text-destructive">{errors.latitude.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="longitude">Longitude</Label>
            <Input id="longitude" type="number" step="any" {...register('longitude')} />
            {errors.longitude && <p className="text-sm text-destructive">{errors.longitude.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Textarea id="shortDescription" rows={2} {...register('shortDescription')} />
            {errors.shortDescription && <p className="text-sm text-destructive">{errors.shortDescription.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Full description</Label>
            <Textarea id="description" rows={5} {...register('description')} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="history">History (optional)</Label>
            <Textarea id="history" rows={3} {...register('history')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visitor details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="openingHours">Opening hours</Label>
            <Input id="openingHours" {...register('openingHours')} />
            {errors.openingHours && <p className="text-sm text-destructive">{errors.openingHours.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="entryFee">Entry fee</Label>
            <Input id="entryFee" {...register('entryFee')} />
            {errors.entryFee && <p className="text-sm text-destructive">{errors.entryFee.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">Contact phone (optional)</Label>
            <Input id="contactPhone" {...register('contactPhone')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">Contact email (optional)</Label>
            <Input id="contactEmail" type="email" {...register('contactEmail')} />
            {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="estimatedVisitDuration">Estimated visit duration (optional)</Label>
            <Input id="estimatedVisitDuration" {...register('estimatedVisitDuration')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bestVisitingTime">Best time to visit (optional)</Label>
            <Input id="bestVisitingTime" {...register('bestVisitingTime')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="safetyInfo">Safety information (optional)</Label>
            <Textarea id="safetyInfo" rows={2} {...register('safetyInfo')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="accessibilityInfo">Accessibility information (optional)</Label>
            <Textarea id="accessibilityInfo" rows={2} {...register('accessibilityInfo')} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="visitorTips">Visitor tips (optional)</Label>
            <Textarea id="visitorTips" rows={2} {...register('visitorTips')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-8">
          <div className="flex items-center gap-3">
            <Switch checked={watch('isFeatured')} onCheckedChange={(checked) => setValue('isFeatured', checked)} />
            <Label>Featured on homepage</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={watch('isPublished')} onCheckedChange={(checked) => setValue('isPublished', checked)} />
            <Label>Published (visible to visitors)</Label>
          </div>
        </CardContent>
      </Card>

      {mode === 'edit' && attraction && (
        <Card>
          <CardHeader>
            <CardTitle>Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader attractionId={attraction.id} images={attraction.images} />
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/attractions')}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : mode === 'create' ? 'Create attraction' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
