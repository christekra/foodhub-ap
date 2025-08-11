import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import InteractiveMap from './InteractiveMap';

interface AddressSelectorProps {
  value: string;
  onChange: (address: string, coordinates?: { latitude: number; longitude: number }) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
  error?: string;
}

export default function AddressSelector({
  value,
  onChange,
  placeholder = "Entrez votre adresse",
  label = "Adresse",
  className = "",
  required = false,
  error
}: AddressSelectorProps) {
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState(value);
  
  const { latitude, longitude, loading: geoLoading, error: geoError, requestPermission } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  // Mettre à jour les coordonnées quand la géolocalisation change
  useEffect(() => {
    if (latitude && longitude) {
      setCoordinates({ latitude, longitude });
      // Optionnel: faire un reverse geocoding pour obtenir l'adresse
      reverseGeocode(latitude, longitude);
    }
  }, [latitude, longitude]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        const address = data.display_name.split(',').slice(0, 3).join(',');
        setSearchQuery(address);
        onChange(address, { latitude: lat, longitude: lng });
      }
    } catch (error) {
      console.error('Erreur lors du reverse geocoding:', error);
    }
  };

  const handleGeolocationClick = () => {
    if (geoError) {
      requestPermission();
    }
  };

  const handleAddressChange = (newAddress: string) => {
    setSearchQuery(newAddress);
    onChange(newAddress, coordinates || undefined);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCoordinates({ latitude: lat, longitude: lng });
    reverseGeocode(lat, lng);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Champ de saisie */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleAddressChange(e.target.value)}
          className={`w-full pl-10 pr-20 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
            error
              ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
          } text-gray-900 dark:text-white`}
          placeholder={placeholder}
        />
        
        {/* Bouton de géolocalisation */}
        <button
          type="button"
          onClick={handleGeolocationClick}
          disabled={geoLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          title="Utiliser ma position actuelle"
        >
          {geoLoading ? (
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          ) : geoError ? (
            <AlertCircle className="w-5 h-5 text-red-500" />
          ) : coordinates ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Navigation className="w-5 h-5 text-orange-500" />
          )}
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      {/* Message de géolocalisation */}
      {geoError && (
        <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {geoError}
        </div>
      )}

      {/* Bouton pour afficher/masquer la carte */}
      <button
        type="button"
        onClick={() => setIsMapVisible(!isMapVisible)}
        className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
      >
        <MapPin className="w-4 h-4" />
        <span>{isMapVisible ? 'Masquer la carte' : 'Afficher la carte'}</span>
      </button>

      {/* Carte interactive */}
      {isMapVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <InteractiveMap
            customerLocation={coordinates ? {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              address: searchQuery
            } : undefined}
            height="300px"
            className="border border-gray-200 dark:border-gray-600"
          />
          
          {coordinates && (
            <div className="mt-2 text-xs text-gray-500 text-center">
              Coordonnées: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
