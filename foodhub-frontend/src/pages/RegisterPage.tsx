import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  User, 
  Building2,
  Smartphone,
  MapPin,
  Clock,
  ChefHat,
  Store
} from 'lucide-react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface RegisterForm {
  accountType: 'client' | 'vendor';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  restaurantName: string;
  cuisineType: string;
  businessHours: string;
}

const cuisineTypes = [
  'Cuisine africaine',
  'Cuisine française',
  'Cuisine italienne',
  'Cuisine asiatique',
  'Cuisine libanaise',
  'Cuisine américaine',
  'Street Food',
  'Pâtisserie',
  'Autre'
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    accountType: 'client',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    restaurantName: '',
    cuisineType: '',
    businessHours: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+225|225)?[0-9]{8,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation commune pour tous les types de compte
    if (!registerForm.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!registerForm.lastName) newErrors.lastName = 'Le nom est requis';
    if (!registerForm.address) newErrors.address = 'L\'adresse est requise';

    // Validation spécifique aux vendeurs
    if (registerForm.accountType === 'vendor') {
      if (!registerForm.restaurantName) newErrors.restaurantName = 'Le nom du restaurant est requis';
      if (!registerForm.cuisineType) newErrors.cuisineType = 'Le type de cuisine est requis';
      if (!registerForm.businessHours) newErrors.businessHours = 'Les horaires sont requis';
    }

    if (!registerForm.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!registerForm.phone) {
      newErrors.phone = 'Le téléphone est requis';
    } else if (!validatePhone(registerForm.phone)) {
      newErrors.phone = 'Format de téléphone invalide';
    }

    if (!registerForm.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (!validatePassword(registerForm.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirmez votre mot de passe';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tentative de soumission du formulaire...');
    const isValid = validateForm();
    console.log('Validation result:', isValid);
    console.log('Errors:', errors);
    if (!isValid) {
      console.log('Formulaire invalide, arrêt de la soumission');
      return;
    }

    setIsLoading(true);
    try {
      // Préparer les données selon le type de compte
      const userData = {
        name: `${registerForm.firstName} ${registerForm.lastName}`,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.confirmPassword,
        phone: registerForm.phone,
        account_type: registerForm.accountType,
        address: registerForm.address,
        // Données spécifiques au vendeur
        ...(registerForm.accountType === 'vendor' && {
          restaurant_name: registerForm.restaurantName,
          cuisine_type: registerForm.cuisineType,
          business_hours: registerForm.businessHours
        })
      };

      // Debug: afficher les données envoyées
      console.log('Données envoyées:', userData);
      console.log('Form state:', registerForm);

      const response = await apiService.register(userData);
      
      if (response.status === 'success' || response.data) {
        toast.success('Compte créé avec succès !');
        setIsSubmitted(true);
      } else {
        toast.error(response.message || 'Erreur lors de la création du compte');
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      toast.error(error.message || 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field: keyof RegisterForm, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
                      <Link to="/" className="inline-block">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-16 h-16 bg-gradient-to-br from-orange-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <motion.span
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-white text-2xl"
              >
                🍽️
              </motion.span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2"
            >
              FoodHub CI
            </motion.h1>
          </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Compte créé avec succès !
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bienvenue sur FoodHub ! Votre compte {registerForm.accountType === 'client' ? 'client' : 'vendeur'} a été créé avec succès.
            </p>

            <div className="space-y-4">
              <Link
                to="/login"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <ArrowRight className="mr-2 h-5 w-5" />
                Se connecter maintenant
              </Link>

              <Link
                to="/"
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Retour à l'accueil
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-block">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 bg-gradient-to-br from-orange-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <motion.span
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-white text-3xl"
              >
                🍽️
              </motion.span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent mb-2"
            >
              FoodHub CI
            </motion.h1>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Rejoignez notre communauté
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Type Selection */}
            <div>
              <label className="block text-lg font-medium text-gray-900 dark:text-white mb-4">
                Quel type de compte souhaitez-vous créer ?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.button
                  type="button"
                  onClick={() => updateForm('accountType', 'client')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    registerForm.accountType === 'client'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      registerForm.accountType === 'client'
                        ? 'bg-orange-100 dark:bg-orange-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <User className={`h-8 w-8 ${
                        registerForm.accountType === 'client'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Compte Client
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Commandez vos plats préférés et faites-vous livrer
                    </p>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => updateForm('accountType', 'vendor')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    registerForm.accountType === 'vendor'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      registerForm.accountType === 'vendor'
                        ? 'bg-orange-100 dark:bg-orange-900/30'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <Store className={`h-8 w-8 ${
                        registerForm.accountType === 'vendor'
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Compte Vendeur
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vendez vos plats et développez votre activité
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Champs de base pour tous les types de compte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={registerForm.firstName}
                      onChange={(e) => updateForm('firstName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.firstName
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                      placeholder="Votre prénom"
                    />
                  </div>
                  {errors.firstName && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={registerForm.lastName}
                      onChange={(e) => updateForm('lastName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.lastName
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                      placeholder="Votre nom"
                    />
                  </div>
                  {errors.lastName && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Champs spécifiques aux vendeurs */}
              {registerForm.accountType === 'vendor' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom du restaurant
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={registerForm.restaurantName}
                        onChange={(e) => updateForm('restaurantName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          errors.restaurantName
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white`}
                        placeholder="Nom de votre restaurant"
                      />
                    </div>
                    {errors.restaurantName && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.restaurantName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de cuisine
                    </label>
                    <div className="relative">
                      <ChefHat className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={registerForm.cuisineType}
                        onChange={(e) => updateForm('cuisineType', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          errors.cuisineType
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white`}
                      >
                        <option value="">Sélectionnez un type</option>
                        {cuisineTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {errors.cuisineType && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.cuisineType}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Horaires d'ouverture
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={registerForm.businessHours}
                        onChange={(e) => updateForm('businessHours', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                          errors.businessHours
                            ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                        } text-gray-900 dark:text-white`}
                        placeholder="Ex: Lun-Ven 8h-22h, Sam-Dim 10h-23h"
                      />
                    </div>
                    {errors.businessHours && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.businessHours}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Common Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.email
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                      placeholder="votre@email.com"
                    />
                  </div>
                  {errors.email && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.phone
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                      placeholder="+225 27 22 12 34 56"
                    />
                  </div>
                  {errors.phone && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.phone}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {registerForm.accountType === 'client' ? 'Adresse de livraison' : 'Adresse du restaurant'}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={registerForm.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.address
                        ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                    } text-gray-900 dark:text-white`}
                    placeholder={registerForm.accountType === 'client' ? 'Votre adresse complète' : 'Adresse de votre restaurant'}
                  />
                </div>
                {errors.address && (
                  <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.address}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.password
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerForm.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.confirmPassword
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </motion.button>

            {/* Footer Links */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Vous avez déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 
