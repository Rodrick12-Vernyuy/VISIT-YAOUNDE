'use client';

import { useCallback, useState } from 'react';
import type { LatLng } from '@/lib/geo';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'unsupported';

interface GeolocationState {
  coords: LatLng | null;
  status: Status;
  error?: string;
}

/**
 * Wraps the browser Geolocation API behind an explicit `locate()` call —
 * deliberately not requested on mount, since an unprompted permission
 * dialog on page load is a bad first impression.
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ coords: null, status: 'idle' });

  /**
   * Requests a new browser position and returns that exact result. Callers that
   * need a current position (for example, route planning) must use the returned
   * value rather than reading React state, which may still contain an older fix.
   */
  const locate = useCallback((): Promise<LatLng | null> => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({ coords: null, status: 'unsupported' });
      return Promise.resolve(null);
    }

    setState((prev) => ({ ...prev, status: 'loading' }));
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setState({ coords, status: 'success' });
          resolve(coords);
        },
        (error) => {
          const message =
            error.code === error.PERMISSION_DENIED
              ? 'Location access was denied. Please enable location permission in your browser to use directions.'
              : error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT
                ? 'Your current location could not be determined. Please check your device location settings and try again.'
                : error.message;
          setState({ coords: null, status: 'error', error: message });
          resolve(null);
        },
        // Directions must start from a new position, never a browser-cached one.
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    });
  }, []);

  return { ...state, locate };
}
