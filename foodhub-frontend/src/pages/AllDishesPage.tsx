import React, { useState, useMemo, useEffect } from 'react';

import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Clock, 
  MapPin, 
  ShoppingCart,
  Heart,
  ChevronDown,
  X,
  SlidersHorizontal,
  Package,
  Box
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';


interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  vendor: {
    id: number;
    name: string;
    address: string;
    city: string;
  };
  rating: number;
  review_count: number;
  image: string;
  category: {
    id: number;
    name: string;
  };
  preparation_time: number;
  is_popular: boolean;
  is_featured: boolean;
  is_vegetarian: boolean;
  is_spicy: boolean;
  spice_level: number;
  cuisine_type: string;
  ingredients: string[];
  allergens: string[];
  calories: number;
  is_available: boolean;
}

const categories = [
  'Tous',
  'Plats principaux',
  'Entrées',
  'Desserts',
  'Boissons',
  'Snacks',
  'Salades',
  'Soupes'
];

const sortOptions = [
  { id: 'newest', label: 'Nouveaux', icon: '🆕' },
  { id: 'popular', label: 'Populaires', icon: '🔥' },
  { id: 'price-low', label: 'Moins chers', icon: '💰' },
  { id: 'price-high', label: 'Plus chers', icon: '💎' },
  { id: 'rating', label: 'Mieux notés', icon: '⭐' },
  { id: 'delivery', label: 'Livraison rapide', icon: '⚡' }
];

export default function AllDishesPage() {
  const { addToCart, isInCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDishes();
        console.log('Données reçues de l\'API:', response);
        setDishes(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des plats:', err);
        setError('Failed to fetch dishes');
        toast.error('Failed to fetch dishes');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  // Filtrage et tri des plats
  const filteredDishes = useMemo(() => {
    let filtered = dishes.filter(dish => {
      const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           dish.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (dish.vendor && dish.vendor.name && dish.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Ne filtrer par catégorie que si une catégorie spécifique est sélectionnée
      const matchesCategory = selectedCategory === 'Tous' || 
                             (dish.category && dish.category.name && 
                              dish.category.name.toLowerCase().includes(selectedCategory.toLowerCase()));
      
      const matchesPrice = dish.price >= priceRange[0] && dish.price <= priceRange[1];
      
      const matchesTags = selectedTags.length === 0 || 
                         (dish.ingredients && selectedTags.some(tag => dish.ingredients.includes(tag)));
      
      return matchesSearch && matchesCategory && matchesPrice && matchesTags;
    });

    // Tri
    switch (sortBy) {
      case 'newest':
        filtered = filtered.filter(dish => dish.is_featured);
        break;
      case 'popular':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered = filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'delivery':
        filtered = filtered.sort((a, b) => {
          if (a.is_available && !b.is_available) return -1;
          if (!a.is_available && b.is_available) return 1;
          return a.price - b.price; // Assuming price is a good proxy for delivery time
        });
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, priceRange, selectedTags, dishes]);

  const toggleFavorite = (dishId: number) => {
    setFavorites(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  const handleAddToCart = (dish: Dish) => {
    // Convertir le format du plat pour le panier
    const cartDish = {
      id: dish.id,
      name: dish.name,
      price: dish.price,
      discount_price: dish.discount_price ? dish.discount_price : null,
      image: dish.image,
      vendor: {
        id: dish.vendor?.id || 0,
        name: dish.vendor?.name || 'Restaurant inconnu',
        description: '',
        is_featured: dish.is_featured
      }
    };
    addToCart(cartDish);
  };



  const allTags = useMemo(() => {
    const tags = new Set<string>();
    dishes.forEach(dish => {
      if (dish.ingredients && Array.isArray(dish.ingredients)) {
        dish.ingredients.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [dishes]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (dishes.length === 0) {
    return (
      <div
        }
        }
        className="text-center py-12"
      >
        <div className="text-gray-400 dark:text-gray-600 text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucun plat trouvé
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Essayez de modifier vos critères de recherche
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header avec recherche */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b border-orange-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Barre de recherche améliorée */}
            <div className="flex-1 relative max-w-xl w-full">
              <div className="relative">
                                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
                 <input
                   type="text"
                   placeholder="🔍 Rechercher un plat, restaurant ou ingrédient..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-12 pr-4 py-4 border-2 border-orange-300 dark:border-gray-600 rounded-2xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 shadow-lg"
                 />
              </div>
            </div>

            {/* Boutons de contrôle améliorés */}
            <div className="flex items-center gap-3">
              {/* Bouton filtres */}
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                                 className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all duration-300 shadow-lg ${
                   showFilters 
                     ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white border-orange-500 shadow-orange-200' 
                     : 'bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-300 border-orange-300 dark:border-gray-600 hover:border-orange-500'
                 }`}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span className="font-semibold">Filtres</span>
              </motion.button>

              {/* Sélecteur de vue amélioré */}
                             <div className="flex bg-white/90 dark:bg-gray-700/90 rounded-2xl border-2 border-orange-300 dark:border-gray-600 p-1 shadow-lg">
                 <motion.button
                   onClick={() => setViewMode('grid')}
                   className={`p-3 rounded-xl transition-all duration-300 ${
                     viewMode === 'grid' 
                       ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg' 
                       : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'
                   }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Grid className="w-5 h-5" />
                </motion.button>
                                 <motion.button
                   onClick={() => setViewMode('list')}
                   className={`p-3 rounded-xl transition-all duration-300 ${
                     viewMode === 'list' 
                       ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg' 
                       : 'text-gray-500 dark:text-gray-400 hover:text-orange-500'
                   }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

                     {/* Filtres avancés améliorés */}
           <div>
             {showFilters && (
               <div
                 }
                 }
                 }
                                   className="mt-6 pt-6 border-t border-orange-300 dark:border-gray-700"
               >
                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                   {/* Catégories */}
                   <div className="space-y-3">
                     <label className="block text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                       <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                       Catégorie
                     </label>
                                           <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-orange-300 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 shadow-lg"
                      >
                       {categories.map(category => (
                         <option key={category} value={category}>{category}</option>
                       ))}
                     </select>
                   </div>

                   {/* Tri */}
                   <div className="space-y-3">
                     <label className="block text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                               <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                       Trier par
                     </label>
                                           <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-orange-300 dark:border-gray-600 rounded-xl bg-white/90 dark:bg-gray-700/90 text-gray-900 dark:text-white focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all duration-300 shadow-lg"
                      >
                       {sortOptions.map(option => (
                         <option key={option.id} value={option.id}>
                           {option.icon} {option.label}
                         </option>
                       ))}
                     </select>
                   </div>

                   {/* Prix */}
                   <div className="space-y-3">
                     <label className="block text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                               <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                       Prix: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} FCFA
                     </label>
                     <div className="relative">
                       <input
                         type="range"
                         min="0"
                         max="5000"
                         step="100"
                         value={priceRange[1]}
                         onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                         className="w-full h-3 bg-orange-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                       />
                       <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-gray-500">
                         <span>0 FCFA</span>
                         <span>5000 FCFA</span>
                       </div>
                     </div>
                   </div>

                   {/* Résultats */}
                   <div className="space-y-3">
                     <label className="block text-sm font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                       Résultats
                     </label>
                                           <div className="bg-gradient-to-r from-orange-100 to-green-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-xl border-2 border-orange-300 dark:border-gray-600">
                       <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                         {filteredDishes.length}
                       </div>
                       <div className="text-sm text-gray-600 dark:text-gray-400">
                         plat{filteredDishes.length > 1 ? 's' : ''} trouvé{filteredDishes.length > 1 ? 's' : ''}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Tags améliorés */}
                 <div className="mt-8 space-y-4">
                   <label className="block text-sm font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                     <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                     Ingrédients populaires
                   </label>
                   <div className="flex flex-wrap gap-3">
                     {allTags.map(tag => (
                       <motion.button
                         key={tag}
                         onClick={() => {
                           setSelectedTags(prev => 
                             prev.includes(tag) 
                               ? prev.filter(t => t !== tag)
                               : [...prev, tag]
                           );
                         }}
                                                   className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-lg ${
                            selectedTags.includes(tag)
                              ? 'bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-orange-200'
                              : 'bg-white/90 dark:bg-gray-700/90 text-gray-700 dark:text-gray-300 border-2 border-orange-300 dark:border-gray-600 hover:border-orange-500 hover:shadow-xl'
                          }`}
                         whileHover={{ scale: 1.05, y: -2 }}
                         whileTap={{ scale: 0.95 }}
                       >
                         {tag}
                       </motion.button>
                     ))}
                   </div>
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>

             {/* Contenu principal */}
       <div className="container mx-auto px-6 py-12">
         {/* En-tête amélioré */}
         <div className="mb-12 text-center">
                       <div
              }
              }
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-green-100 dark:from-gray-700 dark:to-gray-600 px-6 py-3 rounded-full border-2 border-orange-300 dark:border-gray-600 mb-6"
            >
             <span className="text-2xl">🍽️</span>
             <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
               {filteredDishes.length} plat{filteredDishes.length > 1 ? 's' : ''} trouvé{filteredDishes.length > 1 ? 's' : ''}
             </span>
           </div>
                       <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-green-600 to-orange-600 bg-clip-text text-transparent mb-4">
             Découvrez nos délicieux plats
           </h1>
           <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
             Explorez notre sélection de plats authentiques préparés avec passion par nos meilleurs restaurants partenaires
           </p>
         </div>

                 {/* Grille des plats améliorée */}
         <div className={viewMode === 'grid' 
           ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
           : 'space-y-6'
         }>
           <div>
             {filteredDishes.map((dish, index) => (
                               <div
                  key={dish.id}
                  }
                  }
                  }
                  }
                  className={`group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 border-orange-200 dark:border-gray-700 flex flex-col ${
                    viewMode === 'list' ? 'flex-row' : ''
                  }`}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                                 {/* Image améliorée */}
                 <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-32' : 'h-56'}`}>
                   {dish.image && dish.image.trim() !== '' ? (
                     <div className="relative w-full h-full group">
                       <img
                         src={dish.image}
                         alt={dish.name}
                         className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                     </div>
                   ) : (
                                           <div className="w-full h-full bg-gradient-to-br from-orange-100 to-green-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                       <Package className="w-16 h-16 text-orange-400 dark:text-orange-300" />
                     </div>
                   )}
                   
                   {/* Badges améliorés */}
                   <div className="absolute top-4 left-4 flex flex-col gap-2">
                     {dish.is_featured && (
                       <motion.span 
                         }
                         }
                         className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg border border-white/20"
                       >
                         ⭐ Populaire
                       </motion.span>
                     )}
                     {dish.is_available && (
                       <motion.span 
                         }
                         }
                         }
                         className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg border border-white/20"
                       >
                         ✅ Disponible
                       </motion.span>
                     )}
                   </div>

                   {/* Bouton favori amélioré */}
                   <motion.button
                     onClick={() => toggleFavorite(dish.id)}
                     className="absolute top-4 right-4 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full backdrop-blur-md shadow-lg border border-orange-200 dark:border-gray-600 hover:shadow-xl transition-all duration-300"
                     whileHover={{ scale: 1.15, rotate: 5 }}
                     whileTap={{ scale: 0.9 }}
                   >
                     <Heart 
                       className={`w-5 h-5 transition-all duration-300 ${
                         favorites.includes(dish.id) 
                           ? 'text-red-500 fill-current scale-110' 
                           : 'text-gray-600 dark:text-gray-400 hover:text-red-400'
                       }`} 
                     />
                   </motion.button>
                 </div>

                                                   {/* Contenu amélioré */}
                  <div className={`p-6 flex flex-col h-full ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                        {dish.name}
                      </h3>
                      <div className="text-right">
                        <div className="font-bold text-2xl bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                          {dish.price.toLocaleString()} FCFA
                        </div>
                        {dish.discount_price && (
                          <div className="text-sm text-gray-500 line-through">
                            {dish.discount_price.toLocaleString()} FCFA
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>

                    {/* Informations améliorées */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-semibold text-yellow-700 dark:text-yellow-300">{dish.rating}</span>
                        <span className="text-yellow-600 dark:text-yellow-400">({dish.review_count})</span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-orange-700 dark:text-orange-300">{dish.preparation_time} min</span>
                      </div>
                    </div>

                    {/* Vendeur amélioré */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-600 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {dish.vendor?.name || 'Restaurant inconnu'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {dish.vendor?.address || 'Adresse non disponible'}, {dish.vendor?.city || 'Ville non disponible'}
                        </div>
                      </div>
                    </div>

                    {/* Tags améliorés */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {dish.ingredients && dish.ingredients.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gradient-to-r from-orange-100 to-green-100 dark:from-orange-900/20 dark:to-green-900/20 text-orange-700 dark:text-orange-300 px-3 py-1.5 rounded-full font-medium border border-orange-300 dark:border-orange-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions améliorées - Bouton plus sobre et aligné en bas */}
                    <div className="mt-auto pt-4">
                      <motion.button
                        onClick={() => handleAddToCart(dish)}
                        className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-base transition-all duration-300 ${
                          isInCart(dish.id) 
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md' 
                            : 'bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {isInCart(dish.id) ? 'Ajouté' : 'Ajouter au panier'}
                      </motion.button>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        </div>

                 {/* Message si aucun résultat amélioré */}
         {filteredDishes.length === 0 && (
           <div
             }
             }
             className="text-center py-20"
           >
                           <div className="bg-gradient-to-r from-orange-100 to-green-100 dark:from-gray-700 dark:to-gray-600 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
               <span className="text-6xl">🍽️</span>
             </div>
             <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
               Aucun plat trouvé
             </h3>
             <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
               Essayez de modifier vos critères de recherche ou explorez nos autres catégories
             </p>
             <motion.button
               onClick={() => {
                 setSearchTerm('');
                 setSelectedCategory('Tous');
                 setSelectedTags([]);
               }}
                               className="bg-gradient-to-r from-orange-500 to-green-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
               whileHover={{ scale: 1.05, y: -2 }}
               whileTap={{ scale: 0.95 }}
             >
               🔄 Réinitialiser les filtres
             </motion.button>
           </div>
         )}
      </div>


    </div>
  );
} 
