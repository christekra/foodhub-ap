import React, { useState, useMemo } from 'react';

import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Truck, 
  Award, 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  ChevronDown, 
  X, 
  SlidersHorizontal,
  ArrowLeft,
  Info,
  Shield,
  ThumbsUp,
  MessageCircle,
  Share2,
  Bookmark,
  Package
} from 'lucide-react';

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  preparationTime: number;
  isPopular: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  allergens: string[];
  ingredients: string[];
  available: boolean;
}

interface Vendor {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  deliveryTime: number;
  deliveryFee: number;
  minimumOrder: number;
  cuisine: string;
  specialties: string[];
  openingHours: {
    day: string;
    hours: string;
    isOpen: boolean;
  }[];
  images: string[];
  logo: string;
  isOpen: boolean;
  isVerified: boolean;
  joinedDate: string;
  totalOrders: number;
  averageRating: number;
}

const mockVendor: Vendor = {
  id: 1,
  name: "Le Gourmet Parisien",
  description: "Restaurant gastronomique proposant une cuisine française traditionnelle avec une touche moderne. Nos plats sont préparés avec des ingrédients frais et locaux.",
  address: "123 Rue de la Gastronomie",
  city: "Paris",
  phone: "+33 1 23 45 67 89",
  email: "contact@legourmetparisien.fr",
  website: "www.legourmetparisien.fr",
  rating: 4.8,
  reviewCount: 1247,
  deliveryTime: 35,
  deliveryFee: 300,
  minimumOrder: 1500,
  cuisine: "Française",
  specialties: ["Cuisine traditionnelle", "Plats gastronomiques", "Desserts maison"],
  openingHours: [
    { day: "Lundi", hours: "Fermé", isOpen: false },
    { day: "Mardi", hours: "12:00 - 14:30, 19:00 - 22:30", isOpen: true },
    { day: "Mercredi", hours: "12:00 - 14:30, 19:00 - 22:30", isOpen: true },
    { day: "Jeudi", hours: "12:00 - 14:30, 19:00 - 22:30", isOpen: true },
    { day: "Vendredi", hours: "12:00 - 14:30, 19:00 - 23:00", isOpen: true },
    { day: "Samedi", hours: "12:00 - 15:00, 19:00 - 23:30", isOpen: true },
    { day: "Dimanche", hours: "12:00 - 15:00", isOpen: true },
  ],
  images: [
    "/api/placeholder/800/400",
    "/api/placeholder/800/400",
    "/api/placeholder/800/400"
  ],
  logo: "/api/placeholder/100/100",
  isOpen: true,
  isVerified: true,
  joinedDate: "2020",
  totalOrders: 15420,
  averageRating: 4.8
};

const mockDishes: Dish[] = [
  {
    id: 1,
    name: "Coq au Vin Traditionnel",
    description: "Poulet mijoté dans du vin rouge avec des légumes de saison, servi avec des pommes de terre vapeur.",
    price: 2800,
    image: "/api/placeholder/300/200",
    category: "Plats principaux",
    rating: 4.9,
    reviewCount: 156,
    preparationTime: 25,
    isPopular: true,
    isVegetarian: false,
    isSpicy: false,
    allergens: ["Céleri"],
    ingredients: ["Poulet", "Vin rouge", "Légumes", "Pommes de terre"],
    available: true
  },
  {
    id: 2,
    name: "Soupe à l'Oignon Gratinée",
    description: "Soupe traditionnelle à l'oignon caramélisé, gratinée au fromage et servie avec du pain grillé.",
    price: 1200,
    image: "/api/placeholder/300/200",
    category: "Entrées",
    rating: 4.7,
    reviewCount: 89,
    preparationTime: 15,
    isPopular: true,
    isVegetarian: true,
    isSpicy: false,
    allergens: ["Gluten", "Lait"],
    ingredients: ["Oignons", "Fromage", "Pain", "Beurre"],
    available: true
  },
  {
    id: 3,
    name: "Bœuf Bourguignon",
    description: "Bœuf braisé dans du vin rouge avec des carottes, oignons et champignons, servi avec des tagliatelles.",
    price: 3200,
    image: "/api/placeholder/300/200",
    category: "Plats principaux",
    rating: 4.8,
    reviewCount: 203,
    preparationTime: 30,
    isPopular: true,
    isVegetarian: false,
    isSpicy: false,
    allergens: ["Gluten"],
    ingredients: ["Bœuf", "Vin rouge", "Légumes", "Pâtes"],
    available: true
  },
  {
    id: 4,
    name: "Tarte Tatin",
    description: "Tarte renversée aux pommes caramélisées, servie tiède avec de la crème fraîche.",
    price: 900,
    image: "/api/placeholder/300/200",
    category: "Desserts",
    rating: 4.9,
    reviewCount: 134,
    preparationTime: 10,
    isPopular: true,
    isVegetarian: true,
    isSpicy: false,
    allergens: ["Gluten", "Œufs"],
    ingredients: ["Pommes", "Sucre", "Beurre", "Pâte feuilletée"],
    available: true
  },
  {
    id: 5,
    name: "Salade Niçoise",
    description: "Salade composée avec thon, œufs, olives, tomates et anchois, servie avec une vinaigrette maison.",
    price: 1800,
    image: "/api/placeholder/300/200",
    category: "Entrées",
    rating: 4.6,
    reviewCount: 67,
    preparationTime: 12,
    isPopular: false,
    isVegetarian: false,
    isSpicy: false,
    allergens: ["Poisson", "Œufs"],
    ingredients: ["Thon", "Œufs", "Olives", "Tomates", "Anchois"],
    available: true
  },
  {
    id: 6,
    name: "Escargots de Bourgogne",
    description: "Escargots préparés au beurre persillé, servis dans leur coquille avec du pain grillé.",
    price: 1600,
    image: "/api/placeholder/300/200",
    category: "Entrées",
    rating: 4.5,
    reviewCount: 45,
    preparationTime: 8,
    isPopular: false,
    isVegetarian: false,
    isSpicy: false,
    allergens: ["Mollusques", "Gluten"],
    ingredients: ["Escargots", "Beurre", "Persil", "Ail"],
    available: true
  }
];

const categories = [
  "Tous",
  "Entrées",
  "Plats principaux",
  "Desserts",
  "Boissons"
];

const sortOptions = [
  { value: "popular", label: "Plus populaires" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
  { value: "name", label: "Ordre alphabétique" }
];

export default function VendorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [cart, setCart] = useState<{ dish: Dish; quantity: number }[]>([]);

  const filteredDishes = useMemo(() => {
    let filtered = mockDishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dish.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || dish.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.rating - a.rating);
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, sortBy]);

  const toggleFavorite = (dishId: number) => {
    setFavorites(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.dish.id === dish.id);
      if (existingItem) {
        return prev.map(item => 
          item.dish.id === dish.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const openDishModal = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const closeDishModal = () => {
    setSelectedDish(null);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.dish.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/vendeurs" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour aux vendeurs
            </Link>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors">
                <Bookmark className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Hero Section */}
      <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <div
                }
                }
                }
              >
                <div className="flex items-center space-x-2 mb-4">
                  {mockVendor.isVerified && (
                    <div className="bg-orange-500 p-1 rounded-full">
                      <Shield className="h-4 w-4" />
                    </div>
                  )}
                  <h1 className="text-3xl font-bold">{mockVendor.name}</h1>
                </div>
                <p className="text-lg mb-4 opacity-90">{mockVendor.description}</p>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-300" />
                    <span>{mockVendor.rating}</span>
                    <span className="opacity-75">({mockVendor.reviewCount} avis)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{mockVendor.deliveryTime} min</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{mockVendor.city}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div
                }
                }
                }
                className="relative"
              >
                <img
                  src={mockVendor.logo}
                  alt={mockVendor.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                />
                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  mockVendor.isOpen ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {mockVendor.isOpen ? 'O' : 'F'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor Info Section */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              }
              }
              }
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Livraison</p>
                <p className="font-semibold">{mockVendor.deliveryFee} FCFA</p>
              </div>
            </div>

            <div
              }
              }
              }
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Temps de livraison</p>
                <p className="font-semibold">{mockVendor.deliveryTime} min</p>
              </div>
            </div>

            <div
              }
              }
              }
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Commande minimum</p>
                <p className="font-semibold">{mockVendor.minimumOrder} FCFA</p>
              </div>
            </div>

            <div
              }
              }
              }
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Commandes</p>
                <p className="font-semibold">{mockVendor.totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filtres</span>
            </button>
          </div>

          <div>
            {showFilters && (
              <div
                }
                }
                }
                }
                className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Trier par
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish, index) => (
            <div
              key={dish.id}
              }
              }
              }
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="relative">
                {dish.image && dish.image.trim() !== '' ? (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {dish.isPopular && (
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    Populaire
                  </div>
                )}
                <button
                  onClick={() => toggleFavorite(dish.id)}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                    favorites.includes(dish.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                </button>
                {!dish.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">Indisponible</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors">
                    {dish.name}
                  </h3>
                  <div className="text-right">
                    {dish.discountPrice ? (
                      <div>
                        <span className="text-sm text-gray-500 line-through">{dish.price} FCFA</span>
                        <div className="text-lg font-bold text-orange-500">{dish.discountPrice} FCFA</div>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{dish.price} FCFA</div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {dish.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {dish.rating} ({dish.reviewCount})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{dish.preparationTime} min</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  {dish.isVegetarian && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      Végétarien
                    </span>
                  )}
                  {dish.isSpicy && (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                      Épicé
                    </span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openDishModal(dish)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 border border-orange-600 dark:border-orange-400 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  >
                    Voir détails
                  </button>
                  <button
                    onClick={() => addToCart(dish)}
                    disabled={!dish.available}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <div
            }
            }
            className="text-center py-12"
          >
            <div className="text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Aucun plat trouvé</h3>
              <p>Essayez de modifier vos critères de recherche</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div
          }
          }
          className="fixed bottom-6 right-6 z-50"
        >
          <Link
            to="/panier"
            className="flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold">Panier ({cartItemCount})</span>
            <span className="font-bold">{cartTotal} FCFA</span>
          </Link>
        </div>
      )}

      {/* Dish Detail Modal */}
      <div>
        {selectedDish && (
          <div
            }
            }
            }
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeDishModal}
          >
            <div
              }
              }
              }
              }
              className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {selectedDish.image && selectedDish.image.trim() !== '' ? (
                  <img
                    src={selectedDish.image}
                    alt={selectedDish.name}
                    className="w-full h-64 object-cover rounded-t-xl"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-t-xl">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={closeDishModal}
                  className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedDish.name}
                  </h2>
                  <div className="text-right">
                    {selectedDish.discountPrice ? (
                      <div>
                        <span className="text-lg text-gray-500 line-through">{selectedDish.price} FCFA</span>
                        <div className="text-2xl font-bold text-orange-500">{selectedDish.discountPrice} FCFA</div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDish.price} FCFA</div>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedDish.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Ingrédients</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDish.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Allergènes</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedDish.allergens.map((allergen, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedDish.rating} ({selectedDish.reviewCount} avis)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{selectedDish.preparationTime} min</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedDish.isVegetarian && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        Végétarien
                      </span>
                    )}
                    {selectedDish.isSpicy && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                        Épicé
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    addToCart(selectedDish);
                    closeDishModal();
                  }}
                  disabled={!selectedDish.available}
                  className="w-full py-3 text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {selectedDish.available ? 'Ajouter au panier' : 'Indisponible'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
