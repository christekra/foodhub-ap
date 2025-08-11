import React from 'react';

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏳'
  },
  confirmed: {
    label: 'Confirmée',
    color: 'bg-orange-100 text-blue-800 border-orange-200',
    icon: '✅'
  },
  preparing: {
    label: 'En préparation',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: '👨‍🍳'
  },
  ready: {
    label: 'Prête',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '📦'
  },
  out_for_delivery: {
    label: 'En livraison',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🚚'
  },
  delivered: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🎉'
  },
  cancelled: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '❌'
  },
  refunded: {
    label: 'Remboursée',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '💰'
  }
};

export default function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '❓'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
} 