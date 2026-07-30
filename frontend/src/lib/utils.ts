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
  return /^https?:\/\//.test(url) ? url : `${API_ORIGIN}${url}`;
}
