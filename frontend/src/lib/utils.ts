import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/api\/v1\/?$/, '');

/**
 * Locally-stored uploads (Cloudinary disabled) are persisted as root-relative
 * paths like "/uploads/foo.jpg", meant to be served by the backend, not the
 * frontend origin. Cloudinary URLs are already absolute and pass through untouched.
 */
export function resolveImageUrl(url: string) {
  // Versioned catalogue media is shipped with this Next.js app. Keeping it
  // root-relative lets the browser use the frontend CDN/cache directly.
  if (url.startsWith('/images/')) return url;
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}

/** The local-media importer writes a 360px companion for catalogue controls. */
export function resolveThumbnailUrl(url: string) {
  if (url.startsWith('/images/attractions/') && /\.(avif|jpe?g|png|webp)$/i.test(url)) {
    return url.replace(/(\.[^.]+)$/i, '-thumb$1');
  }
  return resolveImageUrl(url);
}
