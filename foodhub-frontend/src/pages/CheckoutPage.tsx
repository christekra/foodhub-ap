import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail, 
  User, 
  Lock, 
  Shield, 
  Calendar,
  CreditCard as CreditCardIcon,
  Wallet,
  Banknote,
  ChevronRight,
  ChevronDown,
  X,
  Edit,
  Trash2,
  Plus,
  Minus,
  Star,
  MessageCircle,
  Info,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface DeliveryInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  instructions?: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'cash';
  name: string;
  icon: React.ReactNode;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    type: 'card',
    name: 'Carte bancaire',
    icon: <CreditCardIcon className="h-5 w-5" />,
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'mobile_money',
    type: 'mobile_money',
    name: 'Mobile Money',
    icon: <Wallet className="h-5 w-5" />,
    description: 'Moov Money, MTN Money, Orange Money'
  },
  {
    id: 'cash',
    type: 'cash',
    name: 'Paiement à la livraison',
    icon: <Banknote className="h-5 w-5" />,
    description: 'Payer en espèces à la livraison'
  }
];

export default function CheckoutPage() {
  const { cartItems, getTotal, getTotalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postal_code || '',
    instructions: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleDeliveryInfoChange = (field: keyof DeliveryInfo, value: string) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return deliveryInfo.firstName && deliveryInfo.lastName && 
               deliveryInfo.phone && deliveryInfo.email && 
               deliveryInfo.address && deliveryInfo.city && deliveryInfo.postalCode;
      case 2:
        return selectedPaymentMethod !== '';
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (!canProceedToNextStep()) {
      toast.error('Veuillez remplir toutes les informations requises');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Préparer les données de la commande selon le format attendu par le backend
      const orderData = {
        vendor_id: cartItems[0]?.vendor?.id, // ID du vendeur du premier plat
        delivery_address: deliveryInfo.address,
        delivery_city: deliveryInfo.city,
        delivery_postal_code: deliveryInfo.postalCode,
        customer_name: `${deliveryInfo.firstName} ${deliveryInfo.lastName}`,
        customer_phone: deliveryInfo.phone,
        special_instructions: deliveryInfo.instructions || '',
        payment_method: selectedPaymentMethod,
        items: cartItems.map((item: any) => ({
          dish_id: item.id,
          quantity: item.quantity,
          special_instructions: '',
          customizations: null
        }))
      };

      // Appel API réel pour créer la commande
      const response = await apiService.createOrder(orderData);

      if (response.success) {
        setOrderPlaced(true);
        clearCart();
        toast.success('Commande placée avec succès !');
        
        // Redirection vers le suivi de commande avec l'ID de la commande
        setTimeout(() => {
          navigate(`/commandes/${response.data.id}`);
        }, 2000);
      } else {
        toast.error(response.message || 'Erreur lors de la commande');
      }
      
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      toast.error('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Si le panier est vide, rediriger
  if (cartItems.length === 0 && !orderPlaced) {
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
              Ajoutez des plats à votre panier pour continuer
            </p>
            <Link
              to="/plats"
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Découvrir nos plats
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  // Page de confirmation de commande
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Commande confirmée !
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Votre commande a été placée avec succès. Vous recevrez une confirmation par email.
            </p>
            
            {/* Informations de suivi */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 dark:text-orange-100 mb-2">
                Suivi de votre commande
              </h3>
              <p className="text-sm text-blue-800 dark:text-orange-200">
                Vous pouvez suivre l'état de votre commande en temps réel dans votre espace client.
              </p>
            </div>
            
            <div className="space-y-3">
              <Link
                to="/commandes"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-block"
              >
                Voir mes commandes
              </Link>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Redirection automatique dans quelques secondes...
              </div>
            </div>
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/panier')}
              className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Finaliser la commande
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Étape {currentStep} sur 3
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              {/* Étapes */}
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 mx-2 ${
                        step < currentStep ? 'bg-orange-600' : 'bg-gray-200 dark:bg-slate-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {/* Étape 1: Informations de livraison */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Informations de livraison
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prénom *
                          </label>
                          <input
                            type="text"
                            value={deliveryInfo.firstName}
                            onChange={(e) => handleDeliveryInfoChange('firstName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Votre prénom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom *
                          </label>
                          <input
                            type="text"
                            value={deliveryInfo.lastName}
                            onChange={(e) => handleDeliveryInfoChange('lastName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Téléphone *
                          </label>
                          <input
                            type="tel"
                            value={deliveryInfo.phone}
                            onChange={(e) => handleDeliveryInfoChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Votre numéro de téléphone"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={deliveryInfo.email}
                            onChange={(e) => handleDeliveryInfoChange('email', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Votre email"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Adresse *
                          </label>
                          <input
                            type="text"
                            value={deliveryInfo.address}
                            onChange={(e) => handleDeliveryInfoChange('address', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Votre adresse complète"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Ville *
                          </label>
                          <input
                            type="text"
                            value={deliveryInfo.city}
                            onChange={(e) => handleDeliveryInfoChange('city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Votre ville"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Code postal *
                          </label>
                          <input
                            type="text"
                            value={deliveryInfo.postalCode}
                            onChange={(e) => handleDeliveryInfoChange('postalCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Code postal"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Instructions de livraison (optionnel)
                          </label>
                          <textarea
                            value={deliveryInfo.instructions}
                            onChange={(e) => handleDeliveryInfoChange('instructions', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            rows={3}
                            placeholder="Instructions spéciales pour la livraison..."
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Étape 2: Méthode de paiement */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Méthode de paiement
                      </h2>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <motion.button
                            key={method.id}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                            className={`w-full p-4 border rounded-lg text-left transition-colors ${
                              selectedPaymentMethod === method.id
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                : 'border-gray-300 dark:border-slate-600 hover:border-gray-400 dark:hover:border-slate-500'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-lg ${
                                selectedPaymentMethod === method.id
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                {method.icon}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {method.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {method.description}
                                </p>
                              </div>
                              {selectedPaymentMethod === method.id && (
                                <CheckCircle className="w-5 h-5 text-orange-600" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Étape 3: Confirmation */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Confirmation de commande
                      </h2>
                      
                      {/* Résumé de la livraison */}
                      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                          Informations de livraison
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>{deliveryInfo.firstName} {deliveryInfo.lastName}</p>
                          <p>{deliveryInfo.phone}</p>
                          <p>{deliveryInfo.email}</p>
                          <p>{deliveryInfo.address}</p>
                          <p>{deliveryInfo.city}, {deliveryInfo.postalCode}</p>
                          {deliveryInfo.instructions && (
                            <p className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-600">
                              <strong>Instructions:</strong> {deliveryInfo.instructions}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Méthode de paiement */}
                      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
                        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                          Méthode de paiement
                        </h3>
                        <div className="flex items-center space-x-3">
                          {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                          <span className="text-gray-600 dark:text-gray-400">
                            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                          </span>
                        </div>
                      </div>

                      {/* Sécurité */}
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-5 h-5 text-orange-600" />
                          <span className="text-sm text-blue-800 dark:text-orange-200">
                            Vos informations sont protégées et sécurisées
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boutons de navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                {currentStep > 1 && (
                  <motion.button
                    onClick={handlePreviousStep}
                    className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Précédent
                  </motion.button>
                )}
                
                <div className="ml-auto">
                  {currentStep < 3 ? (
                    <motion.button
                      onClick={handleNextStep}
                      disabled={!canProceedToNextStep()}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        canProceedToNextStep()
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={canProceedToNextStep() ? { scale: 1.05 } : {}}
                      whileTap={canProceedToNextStep() ? { scale: 0.95 } : {}}
                    >
                      Suivant
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !canProceedToNextStep()}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                        isProcessing || !canProceedToNextStep()
                          ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      whileHover={!isProcessing && canProceedToNextStep() ? { scale: 1.05 } : {}}
                      whileTap={!isProcessing && canProceedToNextStep() ? { scale: 0.95 } : {}}
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Traitement...</span>
                        </div>
                      ) : (
                        'Confirmer la commande'
                      )}
                    </motion.button>
                  )}
                </div>
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

              {/* Articles */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image || "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80"} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quantité: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {(Number(item.discount_price || item.price) * item.quantity).toFixed(0)} FCFA
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Détails des prix */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Sous-total ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})</span>
                  <span>{Number(getTotal()).toFixed(0)} FCFA</span>
                </div>
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

              {/* Informations supplémentaires */}
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span>Livraison en 20-30 minutes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Commande traitée immédiatement</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 
