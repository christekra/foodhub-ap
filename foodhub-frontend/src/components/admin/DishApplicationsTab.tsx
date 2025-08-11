import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Store, DollarSign, Clock, RefreshCw, CheckCircle, XSquare, Eye } from 'lucide-react';
import apiService from '../../services/api';
import toast from 'react-hot-toast';

interface DishApplication {
  id: number;
  vendor: {
    id: number;
    restaurant_name: string;
  };
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  category: {
    id: number;
    name: string;
  };
  image?: string;
  ingredients?: string;
  allergens?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  preparation_time: number;
  spice_level?: number;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  admin_notes?: string;
  reviewed_at?: string;
  reviewer?: any;
  created_at: string;
}

interface Props {
  onRefresh: () => void;
}

export default function DishApplicationsTab({ onRefresh }: Props) {
  const [applications, setApplications] = useState<DishApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<DishApplication | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDishApplications();
      setApplications(response.data.data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des candidatures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleAction = async () => {
    if (!selectedApplication) return;

    try {
      if (actionType === 'approve') {
        await apiService.approveDishApplication(selectedApplication.id, notes);
        toast.success('Plat approuvé avec succès');
      } else {
        await apiService.rejectDishApplication(selectedApplication.id, notes);
        toast.success('Plat rejeté avec succès');
      }
      
      setShowModal(false);
      setNotes('');
      loadApplications();
      onRefresh();
    } catch (error) {
      toast.error('Erreur lors de l\'action');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'rejected': return 'Rejeté';
      case 'under_review': return 'En révision';
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FCFA`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Candidatures plats ({applications.length})
        </h2>
        <button
          onClick={loadApplications}
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
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune candidature
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Aucune candidature de plat en attente pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {application.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {getStatusText(application.status)}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Store className="w-4 h-4" />
                  <span>{application.vendor?.restaurant_name || 'Restaurant inconnu'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Package className="w-4 h-4" />
                  <span>{application.category?.name || 'Catégorie inconnue'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatPrice(application.price)}</span>
                  {application.discount_price && (
                    <span className="text-red-600 line-through">
                      {formatPrice(application.discount_price)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{application.preparation_time} min</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {application.description}
              </p>

              {/* Tags pour les caractéristiques spéciales */}
              <div className="flex flex-wrap gap-2 mb-4">
                {application.is_vegetarian && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Végétarien
                  </span>
                )}
                {application.is_vegan && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Vegan
                  </span>
                )}
                {application.is_gluten_free && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Sans gluten
                  </span>
                )}
                {application.spice_level && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Niveau {application.spice_level}/5
                  </span>
                )}
              </div>

              {application.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setActionType('approve');
                      setShowModal(true);
                    }}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approuver</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setActionType('reject');
                      setShowModal(true);
                    }}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                  >
                    <XSquare className="w-4 h-4" />
                    <span>Rejeter</span>
                  </button>
                </div>
              )}

              {application.admin_notes && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-400">
                    <strong>Notes admin:</strong> {application.admin_notes}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal pour les actions */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {actionType === 'approve' ? 'Approuver' : 'Rejeter'} le plat
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Plat: <strong>{selectedApplication.name}</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Restaurant: <strong>{selectedApplication.vendor?.restaurant_name || 'Inconnu'}</strong>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Prix: <strong>{formatPrice(selectedApplication.price)}</strong>
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                rows={3}
                placeholder="Ajoutez des notes pour cette action..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  actionType === 'approve' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {actionType === 'approve' ? 'Approuver' : 'Rejeter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 