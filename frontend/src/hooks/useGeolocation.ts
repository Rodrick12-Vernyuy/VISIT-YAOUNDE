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

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setState({ coords: null, status: 'unsupported' });
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading' }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coords: { lat: position.coords.latitude, lng: position.coords.longitude },
          status: 'success',
        });
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Location access was denied. Please enable location permission in your browser to use directions.'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'Your current location could not be determined. Please check your device location settings and try again.'
              : error.code === error.TIMEOUT
                ? 'Your current location could not be determined. Please check your device location settings and try again.'
                : error.message;
        setState({ coords: null, status: 'error', error: message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, locate };
}
