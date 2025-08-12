import React, { useState, useEffect } from 'react';

import { Package, Users, Store, DollarSign, Clock, RefreshCw, Eye, MapPin, Phone } from 'lucide-react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  order_number: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  vendor: {
    id: number;
    restaurant_name: string;
  };
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';
  delivery_address: string;
  delivery_phone: string;
  delivery_notes?: string;
  items: Array<{
    id: number;
    dish: {
      id: number;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
    total: number;
  }>;
  created_at: string;
  updated_at: string;
}

interface Props {
  onRefresh: () => void;
}

export default function OrdersTab({ onRefresh }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminOrders();
      setOrders(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivering': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'ready': return 'Prête';
      case 'delivering': return 'En livraison';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Gestion des commandes ({orders.length})
        </h2>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune commande
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Aucune commande trouvée pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              }
              }
              className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  #{order.order_number}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{order.user?.name || 'Client inconnu'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Store className="w-4 h-4" />
                  <span>{order.vendor?.restaurant_name || 'Restaurant inconnu'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Package className="w-4 h-4" />
                  <span>{order.items?.length || 0} article(s)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(order.created_at)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedOrder(order);
                  setShowOrderModal(true);
                }}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Voir les détails</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de détails de commande */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Détails de la commande #{selectedOrder.order_number}
            </h3>
            
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Informations client</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{selectedOrder.user?.name || 'Client inconnu'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Email: {selectedOrder.user?.email || 'Email non disponible'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Restaurant</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Store className="w-4 h-4" />
                      <span>{selectedOrder.vendor?.restaurant_name || 'Restaurant inconnu'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Adresse de livraison</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedOrder.delivery_address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{selectedOrder.delivery_phone}</span>
                  </div>
                  {selectedOrder.delivery_notes && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700 rounded">
                      <span className="text-xs">Notes: {selectedOrder.delivery_notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Articles commandés */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Articles commandés</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{item.dish?.name || 'Plat inconnu'}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity} x {formatPrice(item.dish?.price || 0)}
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(item.total)}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      Aucun article trouvé
                    </div>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Statut */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Statut</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div>
                  <span className="font-medium">Créée le:</span> {formatDate(selectedOrder.created_at)}
                </div>
                <div>
                  <span className="font-medium">Modifiée le:</span> {formatDate(selectedOrder.updated_at)}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
