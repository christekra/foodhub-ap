import React from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Truck,
  CreditCard,
  Shield,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    getTotal, 
    getTotalItems, 
    getTotalDiscount,
    clearCart 
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/plats');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Votre panier est vide
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Découvrez nos délicieux plats et commencez votre commande !
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinueShopping}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Découvrir nos plats
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
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
                  Mon Panier
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {getTotalItems()} article{getTotalItems() > 1 ? 's' : ''} dans votre panier
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vider le panier</span>
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Articles ({getTotalItems()})
              </h2>
              
              <div className="space-y-4">
                {cartItems.map((item: any, index: number) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80"} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Détails */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.vendor?.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="font-bold text-orange-600 dark:text-orange-400">
                          {Number(item.discount_price || item.price).toFixed(0)} FCFA
                        </span>
                        {item.discount_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {Number(item.price).toFixed(0)} FCFA
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contrôles de quantité */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Prix total */}
                    <div className="text-right min-w-0">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {(Number(item.discount_price || item.price) * item.quantity).toFixed(0)} FCFA
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm mt-1"
                      >
                        Supprimer
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Résumé de commande */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Résumé de commande
              </h2>

              {/* Détails des prix */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Sous-total ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})</span>
                  <span>{Number(getTotal()).toFixed(0)} FCFA</span>
                </div>
                
                {getTotalDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-{Number(getTotalDiscount()).toFixed(0)} FCFA</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{Number(getTotal()).toFixed(0)} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Bouton de commande */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors mb-4"
              >
                Passer la commande
              </motion.button>

              {/* Informations supplémentaires */}
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span>Livraison gratuite dès 10 000 FCFA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Livraison en 20-30 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Paiement sécurisé</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
