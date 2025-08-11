import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Phone, 
  Truck, 
  Package,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import apiService from '../services/api';
import OrderStatusBadge from '../components/OrderStatusBadge';
import OrderNotification from '../components/OrderNotification';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  dish: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  status_color: string;
  next_possible_statuses?: string[];
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  delivery_address: string;
  delivery_city: string;
  customer_name: string;
  customer_phone: string;
  special_instructions?: string;
  estimated_delivery_time?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  vendor: {
    id: number;
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  orderItems?: OrderItem[];
}

const statusTimeline = [
  { status: 'pending', label: 'Commande reçue', icon: Clock, description: 'Votre commande a été reçue et est en attente de confirmation' },
  { status: 'confirmed', label: 'Commande confirmée', icon: CheckCircle, description: 'Le restaurant a confirmé votre commande' },
  { status: 'preparing', label: 'En préparation', icon: Package, description: 'Votre commande est en cours de préparation' },
  { status: 'ready', label: 'Prête', icon: Package, description: 'Votre commande est prête pour la livraison' },
  { status: 'out_for_delivery', label: 'En livraison', icon: Truck, description: 'Votre commande est en route vers vous' },
  { status: 'delivered', label: 'Livrée', icon: CheckCircle, description: 'Votre commande a été livrée avec succès' }
];

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    orderNumber: string;
    status: string;
    message: string;
    timestamp: string;
  }>({
    isVisible: false,
    orderNumber: '',
    status: '',
    message: '',
    timestamp: ''
  });

  const [trackingData, setTrackingData] = useState<{
    trackingHistory: any[];
    deliveryLocations: any[];
    currentLocation: any;
  }>({
    trackingHistory: [],
    deliveryLocations: [],
    currentLocation: null
  });

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      console.log('Chargement de la commande avec ID:', orderId);
      
      // Utiliser la nouvelle API de suivi
      const response = await apiService.getOrderTracking(parseInt(orderId!));
      console.log('Réponse API getOrderTracking:', response);
      
      if (response.data && response.data.order) {
        setOrder(response.data.order);
        console.log('Commande chargée:', response.data.order);
        
        // Mettre à jour les données de suivi
        setTrackingData({
          trackingHistory: response.data.tracking_history || [],
          deliveryLocations: response.data.delivery_locations || [],
          currentLocation: response.data.current_location
        });
      } else {
        console.error('Pas de données dans la réponse');
        setError('Aucune donnée reçue pour cette commande');
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement de la commande:', err);
      
      // Gérer spécifiquement les erreurs d'authentification
      if (err.message && err.message.includes('401')) {
        setError('Vous devez être connecté pour voir les détails de cette commande. Veuillez vous connecter.');
      } else if (err.message && err.message.includes('404')) {
        setError('Commande non trouvée. Vérifiez que l\'URL est correcte.');
      } else {
        setError('Impossible de charger les détails de la commande. Veuillez réessayer.');
      }
      
      toast.error('Erreur lors du chargement de la commande');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    return statusTimeline.findIndex(step => step.status === order.status);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Erreur
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Commande non trouvée'}
          </p>
          <div className="space-y-3">
            <Link
              to="/commandes"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux commandes
            </Link>
            {error && error.includes('connecté') && (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors ml-3"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/commandes"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Suivi de commande
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Commande #{order.order_number}
                </p>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Progression de votre commande
              </h2>
              
              <div className="space-y-6">
                {statusTimeline.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const IconComponent = step.icon;

                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-start space-x-4 ${
                        isCompleted ? 'opacity-100' : 'opacity-50'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium ${
                          isCompleted 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {step.description}
                        </p>
                        {isCurrent && order.updated_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Mis à jour le {formatDateTime(order.updated_at)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-6">
            {/* Restaurant Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Restaurant
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {order.vendor.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.vendor.address}, {order.vendor.city}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{order.vendor.phone}</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Livraison
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {order.customer_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.delivery_address}, {order.delivery_city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{order.customer_phone}</span>
                </div>
                {order.special_instructions && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Instructions spéciales :</strong><br />
                      {order.special_instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Résumé de la commande
              </h3>
              <div className="space-y-3">
                {(order.orderItems || []).map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    {item.dish.image && item.dish.image.trim() !== '' ? (
                      <img
                        src={item.dish.image}
                        alt={item.dish.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.dish.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                ))}
                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Frais de livraison</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.delivery_fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-orange-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      <OrderNotification
        orderNumber={notification.orderNumber}
        status={notification.status}
        message={notification.message}
        timestamp={notification.timestamp}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
} 