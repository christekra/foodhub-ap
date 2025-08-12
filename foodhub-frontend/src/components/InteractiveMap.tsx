import React from 'react';

import { MapPin, Navigation, Clock } from 'lucide-react';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

interface InteractiveMapProps {
  deliveryLocation?: Location;
  customerLocation?: Location;
  restaurantLocation?: Location;
  height?: string;
  className?: string;
  showRoute?: boolean;
}

export default function InteractiveMap({
  deliveryLocation,
  customerLocation,
  restaurantLocation,
  height = '400px',
  className = '',
  showRoute = false
}: InteractiveMapProps) {
  // Position par défaut (Abidjan, Côte d'Ivoire)
  const defaultPosition = { lat: 5.3600, lng: -4.0083 };

  // Construire l'URL Google Maps avec les marqueurs
  const buildMapUrl = () => {
    const markers = [];
    
    if (restaurantLocation) {
      markers.push(`markers=color:red|label:R|${restaurantLocation.latitude},${restaurantLocation.longitude}`);
    }
    
    if (customerLocation) {
      markers.push(`markers=color:green|label:C|${customerLocation.latitude},${customerLocation.longitude}`);
    }
    
    if (deliveryLocation) {
      markers.push(`markers=color:blue|label:L|${deliveryLocation.latitude},${deliveryLocation.longitude}`);
    }

    // Déterminer le centre de la carte
    let center = defaultPosition;
    if (restaurantLocation) {
      center = { lat: restaurantLocation.latitude, lng: restaurantLocation.longitude };
    } else if (customerLocation) {
      center = { lat: customerLocation.latitude, lng: customerLocation.longitude };
    } else if (deliveryLocation) {
      center = { lat: deliveryLocation.latitude, lng: deliveryLocation.longitude };
    }

    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${center.lat},${center.lng}&zoom=13&size=600x400&maptype=roadmap&${markers.join('&')}&key=YOUR_GOOGLE_MAPS_API_KEY`;

    return mapUrl;
  };

  return (
    <div
      }
      }
      className={`rounded-lg overflow-hidden shadow-lg ${className}`}
      style={{ height }}
    >
      {/* Carte statique avec Google Maps */}
      <div className="relative w-full h-full bg-gray-100 dark:bg-gray-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Carte Interactive
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Configurez votre clé Google Maps API pour afficher la carte
            </p>
            
            {/* Informations des positions */}
            <div className="space-y-3 text-left max-w-md mx-auto">
              {restaurantLocation && (
                <div className="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Restaurant</p>
                    {restaurantLocation.name && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">{restaurantLocation.name}</p>
                    )}
                    {restaurantLocation.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">{restaurantLocation.address}</p>
                    )}
                  </div>
                </div>
              )}

              {customerLocation && (
                <div className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Votre position</p>
                    {customerLocation.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">{customerLocation.address}</p>
                    )}
                  </div>
                </div>
              )}

              {deliveryLocation && (
                <div className="flex items-center space-x-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Livreur</p>
                    {deliveryLocation.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">{deliveryLocation.address}</p>
                    )}
                    <p className="text-xs text-gray-400">
                      Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions pour configurer l'API */}
            <div className="mt-6 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-xs text-orange-700 dark:text-orange-300">
                <strong>Pour activer la carte :</strong><br />
                1. Obtenez une clé Google Maps API<br />
                2. Remplacez "YOUR_GOOGLE_MAPS_API_KEY" dans le code<br />
                3. Ou utilisez le guide dans <code>foodhub-backend/GOOGLE_MAPS_API_KEYS_GUIDE.md</code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="bg-white dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center space-x-6 text-xs">
          {restaurantLocation && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Restaurant</span>
            </div>
          )}
          {customerLocation && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Vous</span>
            </div>
          )}
          {deliveryLocation && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Livreur</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

