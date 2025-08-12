import React, { useState } from 'react';

import OrderStatusBadge from './OrderStatusBadge';
import OrderStatusUpdater from './OrderStatusUpdater';
import OrderNotification from './OrderNotification';

export default function TestOrderSystem() {
  const [currentStatus, setCurrentStatus] = useState('pending');
  const [showNotification, setShowNotification] = useState(false);

  const statusMessages = {
    pending: 'Votre commande est en attente de confirmation',
    confirmed: 'Votre commande a été confirmée par le restaurant',
    preparing: 'Votre commande est en cours de préparation',
    ready: 'Votre commande est prête pour la livraison',
    out_for_delivery: 'Votre commande est en route vers vous',
    delivered: 'Votre commande a été livrée avec succès',
    cancelled: 'Votre commande a été annulée',
    refunded: 'Votre commande a été remboursée'
  };

  const nextPossibleStatuses = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['out_for_delivery', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    cancelled: [],
    refunded: []
  };

  const handleStatusUpdate = (newStatus: string) => {
    setCurrentStatus(newStatus);
    setShowNotification(true);
    
    // Masquer la notification après 5 secondes
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Test du Système de Gestion des Commandes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testez les nouvelles fonctionnalités de gestion des statuts de commandes
          </p>
        </div>

        {/* Test du badge de statut */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Badge de Statut
          </h2>
          <div className="flex flex-wrap gap-4">
            {Object.keys(statusMessages).map(status => (
              <div key={status} className="text-center">
                <OrderStatusBadge status={status} />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {status}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Test du gestionnaire de statut */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Gestionnaire de Statut (Vendeur)
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Statut actuel :
              </span>
              <OrderStatusBadge status={currentStatus} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {statusMessages[currentStatus as keyof typeof statusMessages]}
              </p>
              <OrderStatusUpdater
                orderId={1}
                currentStatus={currentStatus}
                possibleNextStatuses={nextPossibleStatuses[currentStatus as keyof typeof nextPossibleStatuses] || []}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          </div>
        </div>

        {/* Test des notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cliquez sur le bouton ci-dessous pour tester les notifications de changement de statut
            </p>
            <button
              onClick={() => setShowNotification(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tester la notification
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Instructions de Test
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>• <strong>Badge de Statut</strong> : Vérifiez que tous les statuts s'affichent correctement avec leurs couleurs</p>
            <p>• <strong>Gestionnaire de Statut</strong> : Testez les transitions de statut autorisées</p>
            <p>• <strong>Notifications</strong> : Vérifiez que les notifications apparaissent et disparaissent correctement</p>
            <p>• <strong>Responsive</strong> : Testez sur différentes tailles d'écran</p>
          </div>
        </div>
      </div>

      {/* Notification de test */}
      <OrderNotification
        orderNumber="TEST-001"
        status={currentStatus}
        message={statusMessages[currentStatus as keyof typeof statusMessages]}
        timestamp={new Date().toISOString()}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </div>
  );
} 
