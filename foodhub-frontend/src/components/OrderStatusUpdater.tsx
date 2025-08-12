import React, { useState } from 'react';

import { ChevronDown, Check, X } from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderStatusUpdaterProps {
  orderId: number;
  currentStatus: string;
  possibleNextStatuses: string[];
  onStatusUpdate: (newStatus: string) => void;
  className?: string;
}

const statusLabels = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  out_for_delivery: 'En livraison',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée'
};

export default function OrderStatusUpdater({ 
  orderId, 
  currentStatus, 
  possibleNextStatuses, 
  onStatusUpdate,
  className = '' 
}: OrderStatusUpdaterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast.error('Veuillez sélectionner un statut');
      return;
    }

    try {
      setIsUpdating(true);
      const response = await apiService.updateOrderStatus(orderId, {
        status: selectedStatus,
        notes: notes.trim() || undefined
      });

      toast.success('Statut mis à jour avec succès');
      onStatusUpdate(selectedStatus);
      setIsOpen(false);
      setSelectedStatus('');
      setNotes('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!possibleNextStatuses || possibleNextStatuses.length === 0) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <OrderStatusBadge status={currentStatus} />
        <span className="text-sm text-gray-500">Statut final</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <OrderStatusBadge status={currentStatus} />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
        >
          <span>Changer</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div
          }
          }
          }
          className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Mettre à jour le statut
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nouveau statut
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un statut</option>
                  {possibleNextStatuses?.map(status => (
                    <option key={status} value={status}>
                      {statusLabels[status as keyof typeof statusLabels]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter des notes sur le changement de statut..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                disabled={isUpdating}
              >
                Annuler
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!selectedStatus || isUpdating}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Mettre à jour</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
