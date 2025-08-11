import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';

interface CartItem {
  id: number;
  name: string;
  price: number;
  discount_price?: number;
  image: string;
  vendor: {
    id: number;
    name: string;
    description: string;
    is_featured: boolean;
  };
  quantity: number;
}

export default function TestCartContext() {
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotal, 
    getTotalItems,
    isInCart 
  } = useCart();

  const [testDish] = useState({
    id: 999,
    name: 'Plat de Test',
    price: 1500,
    discount_price: 1200,
    image: '',
    vendor: {
      id: 1,
      name: 'Restaurant Test',
      description: 'Restaurant de test',
      is_featured: false
    }
  });

  const handleAddToCart = () => {
    addToCart(testDish, 1);
  };

  const handleRemoveFromCart = () => {
    if (cartItems.length > 0) {
      removeFromCart(cartItems[0].id);
    }
  };

  const handleUpdateQuantity = () => {
    if (cartItems.length > 0) {
      updateQuantity(cartItems[0].id, cartItems[0].quantity + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Test du CartContext
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testez les fonctionnalités du panier sans erreurs de rendu
          </p>
        </div>

        {/* Statistiques du panier */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Statistiques du Panier
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {getTotalItems()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Articles
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {getTotal().toLocaleString()} FCFA
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {cartItems.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Types de plats
              </div>
            </div>
          </div>
        </div>

        {/* Actions de test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Actions de Test
          </h2>
          <div className="flex flex-wrap gap-4">
            <motion.button
              onClick={handleAddToCart}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ajouter un plat de test
            </motion.button>
            
            <motion.button
              onClick={handleRemoveFromCart}
              disabled={cartItems.length === 0}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Retirer le premier plat
            </motion.button>
            
            <motion.button
              onClick={handleUpdateQuantity}
              disabled={cartItems.length === 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Augmenter quantité
            </motion.button>
            
            <motion.button
              onClick={clearCart}
              disabled={cartItems.length === 0}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Vider le panier
            </motion.button>
          </div>
        </div>

        {/* Contenu du panier */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Contenu du Panier
          </h2>
          {cartItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 dark:text-gray-600 text-4xl mb-4">🛒</div>
              <p className="text-gray-600 dark:text-gray-400">
                Le panier est vide
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item: CartItem) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-lg">🍽️</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {((item.discount_price || item.price) * item.quantity).toLocaleString()} FCFA
                    </div>
                    {item.discount_price && (
                      <div className="text-sm text-gray-500 line-through">
                        {(item.price * item.quantity).toLocaleString()} FCFA
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Test de la fonction isInCart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test de isInCart
          </h2>
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Le plat de test est-il dans le panier ?
            </p>
            <div className={`inline-block px-4 py-2 rounded-lg ${
              isInCart(testDish.id) 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {isInCart(testDish.id) ? 'Oui' : 'Non'}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            Instructions de Test
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p>• <strong>Ajouter</strong> : Testez l'ajout d'un plat au panier</p>
            <p>• <strong>Retirer</strong> : Testez la suppression d'un plat</p>
            <p>• <strong>Quantité</strong> : Testez la modification de quantité</p>
            <p>• <strong>Vider</strong> : Testez le vidage complet du panier</p>
            <p>• <strong>Persistance</strong> : Vérifiez que le panier persiste après rechargement</p>
            <p>• <strong>Console</strong> : Surveillez la console pour les erreurs de rendu</p>
          </div>
        </div>
      </div>
    </div>
  );
} 