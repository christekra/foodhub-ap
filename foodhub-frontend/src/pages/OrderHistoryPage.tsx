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
  Star,
  Calendar,
  Package,
  User,
  Phone,
  CreditCard,
  Wallet,
  Banknote,
  Filter,
  Search,
  ChevronDown,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  dish_id: number;
  dish_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  dish?: {
    id: number;
    name: string;
    image?: string;
  };
}

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  vendor_id: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  subtotal: number;
  delivery_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_postal_code?: string;
  special_instructions?: string;
  payment_method: 'cash' | 'card' | 'mobile_money';
  estimated_delivery_time?: string;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: number;
    name: string;
    logo?: string;
  };
  orderItems: OrderItem[];
}

const statusConfig = {
  pending: {
    label: 'En attente',
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmée',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
    icon: CheckCircle
  },
  preparing: {
    label: 'En préparation',
    color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
    icon: Package
  },
  ready: {
    label: 'Prête',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    icon: CheckCircle
  },
  delivering: {
    label: 'En livraison',
    color: 'text-orange-600 bg-purple-100 dark:bg-purple-900/20',
    icon: Truck
  },
  delivered: {
    label: 'Livrée',
    color: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Annulée',
    color: 'text-red-600 bg-red-100 dark:bg-red-900/20',
    icon: XCircle
  }
};

const paymentMethodConfig = {
  cash: {
    label: 'Espèces',
    icon: Banknote
  },
  card: {
    label: 'Carte bancaire',
    icon: CreditCard
  },
  mobile_money: {
    label: 'Mobile Money',
    icon: Wallet
  }
};

export default function OrderHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les commandes
  const loadOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await apiService.getUserOrders({
        status: statusFilter || undefined,
        search: searchTerm || undefined
      });

      setOrders(response.data?.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, statusFilter, searchTerm]);

  // Si l'utilisateur n'est pas connecté, rediriger
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
              Connectez-vous pour voir votre historique de commandes
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  const getPaymentMethodConfig = (method: string) => {
    return paymentMethodConfig[method as keyof typeof paymentMethodConfig] || paymentMethodConfig.cash;
  };

  const filteredOrders = (orders || []).filter(order => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (order.order_number || '').toLowerCase().includes(searchLower) ||
        (order.vendor?.name || '').toLowerCase().includes(searchLower) ||
        (order.customer_name || '').toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
                  Mes Commandes
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {loading ? 'Chargement...' : `${filteredOrders?.length || 0} commande${(filteredOrders?.length || 0) > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => loadOrders(true)}
                disabled={refreshing}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg shadow-sm transition-colors ${
                  showFilters 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Filtres */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rechercher
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Numéro de commande, restaurant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Tous les statuts</option>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des commandes */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
              >
                <div className="animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
                    ) : (filteredOrders?.length || 0) === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Aucune commande trouvée
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {searchTerm || statusFilter 
                ? 'Aucune commande ne correspond à vos critères de recherche'
                : 'Vous n\'avez pas encore passé de commande'
              }
            </p>
            {!searchTerm && !statusFilter && (
              <button
                onClick={() => navigate('/plats')}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Découvrir nos plats
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
                              {(filteredOrders || []).map((order, index) => {
                const status = getStatusConfig(order.status);
                const StatusIcon = status.icon;
                
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${status.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Commande #{order.order_number}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {Number(order.total).toFixed(0)} FCFA
                        </div>
                        <div className={`text-sm px-2 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Restaurant */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{order.vendor?.name || 'Restaurant'}</span>
                      </div>

                      {/* Articles */}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                                                  {(order.orderItems?.length || 0)} article{(order.orderItems?.length || 0) > 1 ? 's' : ''} • 
                          {(order.orderItems || []).slice(0, 2).map(item => item.dish_name).join(', ')}
                          {(order.orderItems?.length || 0) > 2 && ` et ${(order.orderItems?.length || 0) - 2} autre${(order.orderItems?.length || 0) - 2 > 1 ? 's' : ''}`}
                      </div>

                      {/* Adresse de livraison */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Truck className="w-4 h-4" />
                        <span>{order.delivery_address}, {order.delivery_city}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal de détails de commande */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Commande #{selectedOrder.order_number}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Statut */}
                <div className="mb-6">
                  {(() => {
                    const status = getStatusConfig(selectedOrder.status);
                    const StatusIcon = status.icon;
                    return (
                      <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg ${status.color}`}>
                        <StatusIcon className="w-5 h-5" />
                        <span className="font-medium">{status.label}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Informations de commande */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informations client</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{selectedOrder.customer_phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedOrder.delivery_address}, {selectedOrder.delivery_city}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Informations de commande</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Commandé le {formatDate(selectedOrder.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const payment = getPaymentMethodConfig(selectedOrder.payment_method);
                          const PaymentIcon = payment.icon;
                          return (
                            <>
                              <PaymentIcon className="w-4 h-4" />
                              <span>Paiement : {payment.label}</span>
                            </>
                          );
                        })()}
                      </div>
                      {selectedOrder.special_instructions && (
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-4 h-4 mt-0.5" />
                          <span>Instructions : {selectedOrder.special_instructions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Articles */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Articles commandés</h3>
                  <div className="space-y-3">
                    {(selectedOrder.orderItems || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={item.dish?.image || "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80"} 
                              alt={item.dish_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {item.dish_name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantité : {item.quantity}
                            </p>
                            {item.special_instructions && (
                              <p className="text-xs text-orange-600 dark:text-orange-400">
                                Note : {item.special_instructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {Number(item.total_price).toFixed(0)} FCFA
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {Number(item.unit_price).toFixed(0)} FCFA l'unité
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Résumé des prix */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total</span>
                      <span>{Number(selectedOrder.subtotal).toFixed(0)} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Livraison</span>
                      <span>{Number(selectedOrder.delivery_fee).toFixed(0)} FCFA</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-slate-700 pt-2">
                      <span>Total</span>
                      <span>{Number(selectedOrder.total).toFixed(0)} FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 