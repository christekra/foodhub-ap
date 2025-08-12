import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle,
  User,
  BarChart3,
  ShoppingBag,
  Package,
  Store
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';







export default function VendorDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'orders' | 'dishes' | 'analytics' | 'restaurant'>('orders');
  const [loading, setLoading] = useState(false);

  // Vérifications d'accès
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
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
          </div>
        </div>
      </div>
    );
  }

  if (user?.account_type !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
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
            
            
          </div>
        </div>



        {/* Onglets */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg mb-8">
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
        </div>

        {/* Contenu des onglets */}
        <div>
          {activeTab === 'orders' && (
            <div className="p-6">
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Gestion des commandes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  La gestion des commandes sera bientôt disponible.
                </p>
              </div>
            </div>
          )}

                    {activeTab === 'dishes' && (
            <div className="p-6">
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Gestion des plats
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  La gestion des plats sera bientôt disponible.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Tableau de bord analytique
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Les analyses détaillées seront bientôt disponibles.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'restaurant' && (
            <div className="p-6">
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Gestion du profil restaurant
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  La gestion du profil restaurant sera bientôt disponible.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 

