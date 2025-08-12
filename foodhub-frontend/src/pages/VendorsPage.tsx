import React, { useState, useMemo, useEffect } from 'react';

import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  Mail, 
  Globe,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Truck,
  Award,
  Users,
  Calendar,
  X,
  Navigation,
  Map
} from 'lucide-react';
import { useGeolocation } from '../hooks/useGeolocation';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import InteractiveMap from '../components/InteractiveMap';

interface Vendor {
  id: number;
  name: string;
  description: string;
  image: string;
  banner: string;
  location: string;
  city: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  minOrder: number;
  cuisine: string[];
  specialties: string[];
  isNew: boolean;
  isVerified: boolean;
  isOpen: boolean;
  openingHours: {
    [key: string]: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  stats: {
    totalOrders: number;
    totalCustomers: number;
    averageRating: number;
  };
}

const cities = [
  'Tous',
  'Abidjan',
  'Bouaké',
  'San-Pédro',
  'Yamoussoukro',
  'Korhogo',
  'Man',
  'Gagnoa'
];

const cuisines = [
  'Tous',
  'Ivoirien',
  'Français',
  'Italien',
  'Chinois',
  'Libanais',
  'Sénégalais',
  'Maliens',
  'Street Food',
  'Végétarien'
];

// Interface pour les vraies données de l'API
interface ApiVendor {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  cover_image?: string;
  opening_time?: string;
  closing_time?: string;
  is_open: boolean;
  rating?: number;
  review_count?: number;
  delivery_fee?: number;
  delivery_time?: number;
  minimum_order?: number;
  is_verified: boolean;
  is_featured: boolean;
  dishes?: any[];
  created_at: string;
  updated_at: string;
}

export default function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tous');
  const [selectedCuisine, setSelectedCuisine] = useState('Tous');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<ApiVendor | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [nearbyVendors, setNearbyVendors] = useState<ApiVendor[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [vendors, setVendors] = useState<ApiVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNearbyOnly, setShowNearbyOnly] = useState(true); // Nouveau state pour basculer entre proximité et tous

  // Charger les vendeurs depuis l'API
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getVendors();
        if (response.success) {
          setVendors(response.data.data || response.data);
        } else {
          setError('Erreur lors du chargement des restaurants');
        }
      } catch (err) {
        console.error('Erreur lors du chargement des vendeurs:', err);
        setError('Erreur lors du chargement des restaurants');
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  // Géolocalisation
  const { latitude, longitude, loading: geoLoading, error: geoError, requestPermission } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  });

  // Filtrage et tri des vendeurs
  const filteredVendors = useMemo(() => {
    // Décider quelle liste utiliser
    const sourceVendors = showNearbyOnly && nearbyVendors.length > 0 ? nearbyVendors : vendors;
    
    let filtered = sourceVendors.filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCity = selectedCity === 'Tous' || vendor.city === selectedCity;
      
      return matchesSearch && matchesCity;
    });

    // Tri
    switch (sortBy) {
      case 'rating':
        filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'delivery':
        filtered = filtered.sort((a, b) => (a.delivery_fee || 0) - (b.delivery_fee || 0));
        break;
      case 'featured':
        filtered = filtered.filter(vendor => vendor.is_featured);
        break;
    }

    return filtered;
  }, [searchTerm, selectedCity, selectedCuisine, sortBy, showNearbyOnly, nearbyVendors, vendors]);

  const openVendorModal = (vendor: ApiVendor) => {
    setSelectedVendor(vendor);
  };

  const navigateToVendorProfile = (vendorId: number) => {
    window.location.href = `/vendeurs/${vendorId}`;
  };

  const closeVendorModal = () => {
    setSelectedVendor(null);
  };

  // Fonction pour gérer le basculement entre proximité et tous
  const handleToggleMode = () => {
    const newMode = !showNearbyOnly;
    setShowNearbyOnly(newMode);
    
    if (newMode && latitude && longitude && nearbyVendors.length === 0) {
      // Si on passe en mode proximité et qu'on n'a pas encore chargé les vendeurs proches
      loadNearbyVendors();
      toast.success('Chargement des restaurants à proximité...');
    } else if (newMode) {
      toast.success('Affichage des restaurants à proximité');
    } else {
      toast.success('Affichage de tous les restaurants');
    }
  };

  // Charger les vendeurs proches
  const loadNearbyVendors = async () => {
    if (!latitude || !longitude) {
      toast.error('Position non disponible');
      return;
    }

    try {
      setLoadingNearby(true);
      const response = await apiService.getNearbyVendors(latitude, longitude, 10);
      setNearbyVendors(response.data.vendors || []);
      toast.success(`${response.data.total} vendeurs trouvés à proximité`);
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs proches:', error);
      toast.error('Erreur lors du chargement des vendeurs proches');
    } finally {
      setLoadingNearby(false);
    }
  };

  // Charger les vendeurs proches quand la géolocalisation est disponible
  useEffect(() => {
    if (latitude && longitude && nearbyVendors.length === 0 && showNearbyOnly) {
      loadNearbyVendors();
    }
  }, [latitude, longitude, showNearbyOnly]);

  // Charger les vendeurs proches quand l'utilisateur bascule vers le mode proximité
  useEffect(() => {
    if (showNearbyOnly && latitude && longitude && nearbyVendors.length === 0) {
      loadNearbyVendors();
    }
  }, [showNearbyOnly, latitude, longitude]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header avec recherche */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Barre de recherche */}
            <div className="flex-1 relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un restaurant, cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Boutons de contrôle */}
            <div className="flex items-center gap-2">
              {/* Bouton de basculement Proximité/Tous */}
              <motion.button
                onClick={handleToggleMode}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showNearbyOnly 
                    ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600' 
                    : 'bg-gray-500 text-white border-gray-500 hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={showNearbyOnly ? 'Basculer vers tous les restaurants' : 'Basculer vers restaurants à proximité'}
              >
                <Navigation className="w-4 h-4" />
                {showNearbyOnly ? 'Proximité' : 'Tous'}
              </motion.button>

              {/* Bouton géolocalisation */}
              <motion.button
                onClick={geoError ? requestPermission : loadNearbyVendors}
                disabled={geoLoading || loadingNearby}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors bg-green-500 text-white border-green-500 hover:bg-green-600 disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={geoError ? 'Autoriser la géolocalisation' : 'Actualiser les vendeurs proches'}
              >
                {geoLoading || loadingNearby ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {geoError ? 'Localiser' : 'Actualiser'}
              </motion.button>

              {/* Bouton carte */}
              <motion.button
                onClick={() => setShowMap(!showMap)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showMap 
                    ? 'bg-orange-500 text-white border-orange-500' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Map className="w-4 h-4" />
                Carte
              </motion.button>

              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-orange-500 text-white border-orange-500' 
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filtres
              </motion.button>
            </div>
          </div>

          {/* Filtres avancés */}
          <div>
            {showFilters && (
              <div
                }
                }
                }
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Ville */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ville
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cuisine */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de cuisine
                    </label>
                    <select
                      value={selectedCuisine}
                      onChange={(e) => setSelectedCuisine(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {cuisines.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tri */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trier par
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="rating">⭐ Meilleure note</option>
                      <option value="newest">🆕 Nouveaux</option>
                      <option value="delivery">⚡ Livraison rapide</option>
                      <option value="orders">📦 Plus de commandes</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Résultats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {showNearbyOnly ? 'Restaurants à proximité' : 'Tous nos partenaires'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredVendors.length} restaurant{filteredVendors.length > 1 ? 's' : ''} trouvé{filteredVendors.length > 1 ? 's' : ''}
                {showNearbyOnly && nearbyVendors.length > 0 && (
                  <span className="ml-2 text-orange-600 dark:text-orange-400">
                    • Basé sur votre position
                  </span>
                )}
              </p>
            </div>
            
            {/* Indicateur de mode */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                showNearbyOnly 
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {showNearbyOnly ? '📍 Proximité' : '🌍 Tous'}
              </div>
            </div>
          </div>
          
          {/* Message d'information */}
          {showNearbyOnly && loadingNearby && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-orange-800 dark:text-orange-200 font-medium">
                    Recherche des restaurants à proximité...
                  </p>
                  <p className="text-orange-600 dark:text-orange-300 text-sm">
                    Veuillez patienter pendant que nous localisons les restaurants près de chez vous
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {showNearbyOnly && nearbyVendors.length === 0 && latitude && longitude && !loadingNearby && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Aucun restaurant trouvé à proximité
                  </p>
                  <p className="text-blue-600 dark:text-blue-300 text-sm">
                    Essayez de basculer vers "Tous" pour voir tous les restaurants disponibles
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {showNearbyOnly && !latitude && !longitude && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Géolocalisation requise
                  </p>
                  <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                    Autorisez la géolocalisation pour voir les restaurants à proximité
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Carte interactive */}
        <div>
          {showMap && (
            <div
              }
              }
              }
              className="mb-8 overflow-hidden"
            >
              <InteractiveMap
                customerLocation={latitude && longitude ? {
                  latitude,
                  longitude,
                  address: 'Votre position'
                } : undefined}
                height="400px"
                className="border border-gray-200 dark:border-gray-600 rounded-lg"
              />
              
              {/* Liste des vendeurs proches */}
              {nearbyVendors.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Vendeurs à proximité ({nearbyVendors.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nearbyVendors.map((vendor) => (
                      <div key={vendor.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{vendor.name}</h4>
                          <span className="text-sm text-green-600">À proximité</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{vendor.address}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{vendor.rating}</span>
                          <span className="text-gray-500">({vendor.review_count})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grille des vendeurs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            {filteredVendors.map((vendor, index) => (
              <div
                key={vendor.id}
                }
                }
                }
                }
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => openVendorModal(vendor)}
              >
                {/* Image de couverture */}
                <div className="relative h-48">
                  <img
                    src={vendor.logo || '/placeholder-restaurant.jpg'}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {vendor.is_featured && (
                      <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        ⭐ Mis en avant
                      </span>
                    )}
                    {vendor.is_verified && (
                      <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Vérifié
                      </span>
                    )}
                  </div>

                  {/* Statut ouvert/fermé */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs ${
                    vendor.is_open 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {vendor.is_open ? 'Ouvert' : 'Fermé'}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {vendor.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="text-sm text-gray-500">({vendor.review_count || 0})</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {vendor.description}
                  </p>

                  {/* Informations */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{vendor.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{vendor.delivery_time ? `${vendor.delivery_time} min` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Truck className="w-4 h-4" />
                      <span>{vendor.delivery_fee ? `${vendor.delivery_fee} FCFA` : 'Gratuit'}</span>
                    </div>
                  </div>

                  {/* Plats disponibles */}
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plats disponibles
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {vendor.dishes && vendor.dishes.length > 0 ? (
                        <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-blue-800 dark:text-orange-300 px-2 py-1 rounded-full">
                          {vendor.dishes.length} plats
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Aucun plat disponible</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToVendorProfile(vendor.id);
                      }}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Voir le menu
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        openVendorModal(vendor);
                      }}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Détails
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message si aucun résultat */}
        {filteredVendors.length === 0 && (
          <div
            }
            }
            className="text-center py-12"
          >
            <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🏪</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucun restaurant trouvé
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>

      {/* Modal détaillé du vendeur */}
      <div>
        {selectedVendor && (
          <div
            }
            }
            }
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeVendorModal}
          >
            <div
              }
              }
              }
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image de couverture */}
              <div className="relative h-48">
                <img
                  src={selectedVendor.logo || '/placeholder-restaurant.jpg'}
                  alt={selectedVendor.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={closeVendorModal}
                  className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu détaillé */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedVendor.name}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{selectedVendor.rating || 'N/A'}</span>
                        <span>({selectedVendor.review_count || 0} avis)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedVendor.dishes?.length || 0} plats</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedVendor.description}
                </p>

                {/* Informations détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Informations
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{selectedVendor.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>Livraison: {selectedVendor.delivery_time ? `${selectedVendor.delivery_time} min` : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span>Frais: {selectedVendor.delivery_fee ? `${selectedVendor.delivery_fee} FCFA` : 'Gratuit'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>Commande min: {selectedVendor.minimum_order ? `${selectedVendor.minimum_order} FCFA` : 'Aucun minimum'}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Contact
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{selectedVendor.phone || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedVendor.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horaires d'ouverture */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Horaires d'ouverture
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Ouverture</span>
                      <span className="text-gray-900 dark:text-white">{selectedVendor.opening_time || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fermeture</span>
                      <span className="text-gray-900 dark:text-white">{selectedVendor.closing_time || 'Non renseigné'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Statut</span>
                      <span className={`text-gray-900 dark:text-white ${selectedVendor.is_open ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedVendor.is_open ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Plats disponibles */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Plats disponibles
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.dishes && selectedVendor.dishes.length > 0 ? (
                      <span className="bg-orange-100 dark:bg-orange-900/30 text-blue-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm">
                        {selectedVendor.dishes.length} plats disponibles
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm">Aucun plat disponible</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Voir le menu complet
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Appeler
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
