import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Store, Package, DollarSign, AlertTriangle, Shield, XCircle, BarChart3, RefreshCw, Star, MessageSquare, Tag, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import VendorApplicationsTab from '../components/admin/VendorApplicationsTab';
import UsersTab from '../components/admin/UsersTab';
import DishApplicationsTab from '../components/admin/DishApplicationsTab';
import ReviewApplicationsTab from '../components/admin/ReviewApplicationsTab';
import CategoriesTab from '../components/admin/CategoriesTab';
import OrdersTab from '../components/admin/OrdersTab';
import ChatManagementTab from '../components/admin/ChatManagementTab';

export default function AdminDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vendor-applications' | 'dish-applications' | 'review-applications' | 'categories' | 'orders' | 'chat'>('overview');

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      loadDashboardData();
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

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
              <Shield className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connexion requise
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Connectez-vous pour accéder au tableau de bord administrateur
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

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Accès réservé aux administrateurs
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Cette page est réservée aux comptes administrateurs
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
                  Tableau de bord administrateur
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Bienvenue, {user.name}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </motion.div>

        {/* Statistiques générales */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateurs totaux</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.total_users}</p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.total_clients}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendeurs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.total_vendors}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Store className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus totaux</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{Number(stats.overview.total_revenue || 0).toFixed(0)} FCFA</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Alertes en attente */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Candidatures vendeurs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending.vendor_applications}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Candidatures plats</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending.dish_applications}</p>
                </div>
                <Package className="w-6 h-6 text-orange-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Candidatures avis</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending.review_applications}</p>
                </div>
                <MessageSquare className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Onglets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-8"
        >
          <div className="flex border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('vendor-applications')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'vendor-applications'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Store className="w-5 h-5 inline mr-2" />
              Candidatures vendeurs
            </button>
            <button
              onClick={() => setActiveTab('dish-applications')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'dish-applications'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Candidatures plats
            </button>
            <button
              onClick={() => setActiveTab('review-applications')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'review-applications'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Star className="w-5 h-5 inline mr-2" />
              Candidatures avis
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Tag className="w-5 h-5 inline mr-2" />
              Catégories
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              Commandes
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-shrink-0 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Chat Support
            </button>
          </div>
        </motion.div>

        {/* Contenu des onglets */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Vue d'ensemble
                </h2>
                
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Revenus des 7 derniers jours
                      </h3>
                      <div className="text-3xl font-bold text-green-600">
                        {Number(stats?.overview.recent_revenue || 0).toFixed(0)} FCFA
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Commandes par statut
                      </h3>
                      <div className="space-y-3">
                        {stats?.orders_by_status.map((status: any) => (
                          <div key={status.status} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {status.status === 'pending' ? 'En attente' :
                               status.status === 'confirmed' ? 'Confirmée' :
                               status.status === 'preparing' ? 'En préparation' :
                               status.status === 'ready' ? 'Prête' :
                               status.status === 'delivering' ? 'En livraison' :
                               status.status === 'delivered' ? 'Livrée' : 'Annulée'}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {status.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <UsersTab onRefresh={loadDashboardData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'vendor-applications' && (
            <motion.div
              key="vendor-applications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <VendorApplicationsTab onRefresh={loadDashboardData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'dish-applications' && (
            <motion.div
              key="dish-applications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <DishApplicationsTab onRefresh={loadDashboardData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'review-applications' && (
            <motion.div
              key="review-applications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <ReviewApplicationsTab onRefresh={loadDashboardData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <CategoriesTab onRefresh={loadDashboardData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <OrdersTab onRefresh={loadDashboardData} />
              </div>
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <ChatManagementTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
