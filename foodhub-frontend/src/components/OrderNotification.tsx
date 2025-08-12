import React from 'react';

import { Bell, X, CheckCircle, Clock, Truck, Package } from 'lucide-react';

interface OrderNotificationProps {
  orderNumber: string;
  status: string;
  message: string;
  timestamp: string;
  isVisible: boolean;
  onClose: () => void;
}

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  preparing: Package,
  ready: Package,
  out_for_delivery: Truck,
  delivered: CheckCircle,
  cancelled: X,
  refunded: CheckCircle
};

const statusColors = {
  pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  confirmed: 'bg-orange-50 border-orange-200 text-blue-800',
  preparing: 'bg-orange-50 border-orange-200 text-orange-800',
  ready: 'bg-green-50 border-green-200 text-green-800',
  out_for_delivery: 'bg-purple-50 border-purple-200 text-purple-800',
  delivered: 'bg-green-50 border-green-200 text-green-800',
  cancelled: 'bg-red-50 border-red-200 text-red-800',
  refunded: 'bg-gray-50 border-gray-200 text-gray-800'
};

export default function OrderNotification({
  orderNumber,
  status,
  message,
  timestamp,
  isVisible,
  onClose
}: OrderNotificationProps) {
  const IconComponent = statusIcons[status as keyof typeof statusIcons] || Bell;
  const colorClass = statusColors[status as keyof typeof statusColors] || 'bg-gray-50 border-gray-200 text-gray-800';

  return (
    <div>
      {isVisible && (
        <div
          }
          }
          }
          className={`fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg border shadow-lg ${colorClass}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Commande #{orderNumber}
              </p>
              <p className="text-sm mt-1">
                {message}
              </p>
              <p className="text-xs mt-2 opacity-75">
                {new Date(timestamp).toLocaleString('fr-FR')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
