import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watch = false,
  } = options;

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'La géolocalisation n\'est pas supportée par ce navigateur',
        loading: false,
      }));
      return;
    }

    const successHandler = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const errorHandler = (error: GeolocationPositionError) => {
      let errorMessage = 'Erreur de géolocalisation';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Accès à la géolocalisation refusé';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Informations de position non disponibles';
          break;
        case error.TIMEOUT:
          errorMessage = 'Délai d\'attente dépassé';
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    const geolocationOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    let watchId: number | null = null;

    if (watch) {
      watchId = navigator.geolocation.watchPosition(
        successHandler,
        errorHandler,
        geolocationOptions
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        successHandler,
        errorHandler,
        geolocationOptions
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enableHighAccuracy, timeout, maximumAge, watch]);

  const requestPermission = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          // Permission déjà accordée, la géolocalisation se fera automatiquement
        } else if (result.state === 'prompt') {
          // Demander la permission
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                error: null,
                loading: false,
              });
            },
            (error) => {
              setState(prev => ({
                ...prev,
                error: 'Permission de géolocalisation refusée',
                loading: false,
              }));
            }
          );
        } else {
          setState(prev => ({
            ...prev,
            error: 'Permission de géolocalisation refusée',
            loading: false,
          }));
        }
      });
    }
  };

  return {
    ...state,
    requestPermission,
  };
}
