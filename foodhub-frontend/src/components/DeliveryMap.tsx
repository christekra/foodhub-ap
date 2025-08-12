import React from 'react';

import { MapPin, Navigation, Clock, Truck, AlertCircle } from 'lucide-react';
import InteractiveMap from './InteractiveMap';

interface DeliveryMapProps {
  deliveryLocation?: {
    latitude: number;
    longitude: number;
    location_address?: string;
    recorded_at: string;
  };
  customerLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  restaurantLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    name: string;
  };
  estimatedArrival?: string;
  className?: string;
}

export default function DeliveryMap({ 
  deliveryLocation, 
  customerLocation,
  restaurantLocation,
  estimatedArrival, 
  className = '' 
}: DeliveryMapProps) {
  if (!deliveryLocation && !customerLocation && !restaurantLocation) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center ${className}`}>
        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          En attente des positions...
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Carte interactive */}
      <InteractiveMap
        deliveryLocation={deliveryLocation}
        customerLocation={customerLocation}
        restaurantLocation={restaurantLocation}
        height="400px"
        showRoute={true}
      />

      {/* Informations de livraison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {deliveryLocation ? 'Livreur en route' : 'Suivi de commande'}
              </p>
              {deliveryLocation?.location_address && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {deliveryLocation.location_address}
                </p>
              )}
            </div>
          </div>
          
          {estimatedArrival && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Arrivée estimée: {new Date(estimatedArrival).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
          )}
        </div>
        
        {deliveryLocation && (
          <p className="text-xs text-gray-500 mt-2">
            Dernière mise à jour: {new Date(deliveryLocation.recorded_at).toLocaleTimeString('fr-FR')}
          </p>
        )}
      </div>

      {/* Légende */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
        <div className="flex items-center justify-center space-x-6 text-xs">
          {deliveryLocation && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Livreur</span>
            </div>
          )}
          {customerLocation && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Vous</span>
            </div>
          )}
          {restaurantLocation && (
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Restaurant</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
