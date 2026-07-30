'use client';

import Image from 'next/image';
import { DragEvent, useRef, useState } from 'react';
import { Star, Trash2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn, resolveImageUrl } from '@/lib/utils';
import { useRemoveImage, useSetCoverImage, useUploadAttractionImages } from '@/lib/queries/attractions';
import type { AttractionImage } from '@/types';

export function ImageUploader({ attractionId, images }: { attractionId: string; images: AttractionImage[] }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAttractionImages(attractionId);
  const setCover = useSetCoverImage(attractionId);
  const removeImage = useRemoveImage(attractionId);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    try {
      await upload.mutateAsync(Array.from(files));
      toast.success('Images uploaded');
    } catch {
      toast.error('Upload failed');
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border'
        )}
      >
        <UploadCloud className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Drag and drop images, or click to browse</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, or WebP — up to 10 images</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {upload.isPending && <p className="text-sm text-muted-foreground">Uploading…</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
              <Image src={resolveImageUrl(image.url)} alt={image.altText ?? ''} fill sizes="200px" className="object-cover" />
              {image.isCover && (
                <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  Cover
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                {!image.isCover && (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    aria-label="Set as cover"
                    onClick={() => setCover.mutate(image.id)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  aria-label="Delete image"
                  onClick={() => removeImage.mutate(image.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
