import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Truck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Phone,
  Filter,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Package,
  Store,
  Mail,
  Globe,
  Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import OrdersManagement from '../components/vendor/OrdersManagement';



// Fonction pour basculer la disponibilité d'un plat
const toggleDishAvailability = async (dishId: number, currentAvailability: boolean) => {
  try {
    await apiService.toggleDishAvailability(dishId, !currentAvailability);
    toast.success('Disponibilité mise à jour avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la disponibilité:', error);
    toast.error('Erreur lors de la mise à jour de la disponibilité');
    return false;
  }
};

// Fonction pour supprimer un plat
const deleteDish = async (dishId: number) => {
  if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
    return false;
  }

  try {
    await apiService.deleteVendorDish(dishId);
    toast.success('Plat supprimé avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    toast.error('Erreur lors de la suppression du plat');
    return false;
  }
};

interface Order {
  id: number;
  order_number: string;
  status: string;
  total: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  created_at: string;
  orderItems: any[];
}

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  image?: string;
  is_available: boolean;
}

interface RestaurantProfile {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  opening_time: string;
  closing_time: string;
  is_open: boolean;
  delivery_fee: number;
  delivery_time: number;
  minimum_order: number;
  logo?: string;
  cover_image?: string;
  is_verified: boolean;
  is_featured: boolean;
  formatted_opening_time?: string;
  formatted_closing_time?: string;
}

const statusConfig = {
  pending: { label: 'En attente', color: 'text-yellow-600 bg-yellow-100', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'text-orange-600 bg-orange-100', icon: CheckCircle },
  preparing: { label: 'En préparation', color: 'text-orange-600 bg-orange-100', icon: Package },
  ready: { label: 'Prête', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  delivering: { label: 'En livraison', color: 'text-orange-600 bg-purple-100', icon: Truck },
  delivered: { label: 'Livrée', color: 'text-green-600 bg-green-100', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'text-red-600 bg-red-100', icon: XCircle }
};

export default function VendorDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [restaurantProfile, setRestaurantProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'dishes' | 'analytics' | 'restaurant'>('orders');
  const [updatingDish, setUpdatingDish] = useState<number | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    opening_time: '',
    closing_time: '',
    is_open: true,
    delivery_fee: 0,
    delivery_time: 30,
    minimum_order: 0
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalDishes: 0
  });

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les commandes du vendeur
      const ordersResponse = await apiService.getVendorOrders();
      
      // Charger les plats du vendeur
      const dishesResponse = await apiService.getVendorDishes();
      
      // Charger les statistiques
      const statsResponse = await apiService.getVendorStats();

      // Charger le profil du restaurant
      const profileResponse = await apiService.getVendorProfile();

      setOrders(ordersResponse.data?.data || []);
      setDishes(dishesResponse.data?.data || []);
      setRestaurantProfile(profileResponse.data || null);
      
      // Initialiser le formulaire avec les données du profil
      if (profileResponse.data) {
        setProfileForm({
          name: profileResponse.data.name || '',
          description: profileResponse.data.description || '',
          phone: profileResponse.data.phone || '',
          address: profileResponse.data.address || '',
          city: profileResponse.data.city || '',
          postal_code: profileResponse.data.postal_code || '',
          opening_time: profileResponse.data.formatted_opening_time || '',
          closing_time: profileResponse.data.formatted_closing_time || '',
          is_open: profileResponse.data.is_open || true,
          delivery_fee: profileResponse.data.delivery_fee || 0,
          delivery_time: profileResponse.data.delivery_time || 30,
          minimum_order: profileResponse.data.minimum_order || 0
        });
      }
      
      setStats({
        totalOrders: statsResponse.data?.total_orders || 0,
        pendingOrders: statsResponse.data?.pending_orders || 0,
        totalRevenue: statsResponse.data?.total_revenue || 0,
        totalDishes: dishesResponse.data?.data?.length || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Gérer la mise à jour du profil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await apiService.updateVendorProfile(profileForm);
      toast.success('Profil mis à jour avec succès');
      setEditingProfile(false);
      loadData(); // Recharger les données pour avoir les dernières informations
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.account_type === 'vendor') {
      loadData();
    }
  }, [isAuthenticated, user]);

  // Gérer la basculement de disponibilité
  const handleToggleAvailability = async (dishId: number, currentAvailability: boolean) => {
    setUpdatingDish(dishId);
    const success = await toggleDishAvailability(dishId, currentAvailability);
    if (success) {
      // Mettre à jour l'état local
      setDishes(prev => prev.map(dish => 
        dish.id === dishId 
          ? { ...dish, is_available: !currentAvailability }
          : dish
      ));
    }
    setUpdatingDish(null);
  };

  // Gérer la suppression
  const handleDeleteDish = async (dishId: number) => {
    const success = await deleteDish(dishId);
    if (success) {
      // Retirer le plat de la liste
      setDishes(prev => prev.filter(dish => dish.id !== dishId));
      // Recharger les statistiques
      loadData();
    }
  };

  // Vérifications d'accès
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connexion requise
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Connectez-vous pour accéder au tableau de bord vendeur
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Se connecter
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (user?.account_type !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Accès réservé aux vendeurs
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Cette page est réservée aux comptes vendeurs
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Tableau de bord vendeur
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Bienvenue, {user.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={loadData}
                disabled={loading}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commandes totales</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{Number(stats.totalRevenue || 0).toFixed(0)} FCFA</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plats disponibles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDishes}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-8"
        >
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5 inline mr-2" />
              Commandes
            </button>
            <button
              onClick={() => setActiveTab('dishes')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'dishes'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Mes Plats
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Analyses
            </button>
            <button
              onClick={() => setActiveTab('restaurant')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'restaurant'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Store className="w-5 h-5 inline mr-2" />
              Mon Profil
            </button>
          </div>
        </motion.div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <OrdersManagement />
            </motion.div>
          )}

          {activeTab === 'dishes' && (
            <motion.div
              key="dishes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Mes Plats
                </h2>
                <button
                  onClick={() => navigate('/vendor/dishes/new')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un plat</span>
                </button>
              </div>

                             {dishes.length === 0 ? (
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
                 >
                   <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Package className="w-12 h-12 text-gray-400" />
                   </div>
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                     Aucun plat ajouté
                   </h2>
                   <p className="text-gray-600 dark:text-gray-300 mb-8">
                     Commencez par ajouter vos premiers plats
                   </p>
                   
                   <button
                     onClick={() => navigate('/vendor/dishes/new')}
                     className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                   >
                     Ajouter mon premier plat
                   </button>
                 </motion.div>
               ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dishes.map((dish, index) => (
                    <motion.div
                      key={dish.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="h-48 bg-gray-200 dark:bg-slate-700 relative">
                        <img
                          src={dish.image || "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80"}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                          dish.is_available 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {dish.is_available ? 'Disponible' : 'Indisponible'}
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          {dish.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {dish.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                                                         <span className="font-bold text-orange-600 dark:text-orange-400">
                               {dish.discount_price ? (
                                 <>
                                   <span className="text-red-500">{Number(dish.discount_price || 0).toFixed(0)} FCFA</span>
                                   <span className="text-gray-400 dark:text-gray-500 text-sm line-through ml-1">
                                                                           {Number(dish.price || 0).toFixed(0)} FCFA
                                   </span>
                                 </>
                               ) : (
                                                                   `${Number(dish.price || 0).toFixed(0)} FCFA`
                               )}
                             </span>
                          </div>
                        </div>

                                                 <div className="flex items-center justify-between">
                           <div className="flex items-center space-x-2">
                             <button
                               onClick={() => navigate(`/vendor/dishes/${dish.id}/edit`)}
                               className="text-orange-600 hover:text-orange-700 font-medium flex items-center space-x-2"
                             >
                               <Edit className="w-4 h-4" />
                               <span>Modifier</span>
                             </button>
                             
                             <button
                               onClick={() => handleDeleteDish(dish.id)}
                               className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-2"
                             >
                               <Trash2 className="w-4 h-4" />
                               <span>Supprimer</span>
                             </button>
                           </div>
                           
                           <button
                             onClick={() => handleToggleAvailability(dish.id, dish.is_available)}
                             disabled={updatingDish === dish.id}
                             className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                               dish.is_available
                                 ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
                                 : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400'
                             } disabled:opacity-50`}
                           >
                             {updatingDish === dish.id ? '...' : (dish.is_available ? 'Masquer' : 'Afficher')}
                           </button>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Tableau de bord analytique
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Les analyses détaillées seront bientôt disponibles.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'restaurant' && (
            <motion.div
              key="restaurant"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Gestion du profil restaurant
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  La gestion du profil restaurant sera bientôt disponible.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
