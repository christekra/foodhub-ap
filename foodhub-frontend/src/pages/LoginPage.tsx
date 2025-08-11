import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight, 
  User, 
  Building2,
  Smartphone,
  MapPin,
  Calendar,
  FileText,
  Clock,
  ChefHat,
  Store
} from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterForm {
  accountType: 'client' | 'vendor';
  // Client fields
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  address: string;
  // Vendor fields
  restaurantName: string;
  cuisineType: string;
  businessHours: string;
  legalDocuments: string;
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
    rememberMe: false
  });
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
    businessHours: '',
    legalDocuments: ''
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

    if (isLogin) {
      if (!loginForm.email) {
        newErrors.email = 'L\'email est requis';
      } else if (!validateEmail(loginForm.email)) {
        newErrors.email = 'Format d\'email invalide';
      }

      if (!loginForm.password) {
        newErrors.password = 'Le mot de passe est requis';
      }
    } else {
      if (registerForm.accountType === 'client') {
        if (!registerForm.firstName) newErrors.firstName = 'Le prénom est requis';
        if (!registerForm.lastName) newErrors.lastName = 'Le nom est requis';
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
        if (!registerForm.address) newErrors.address = 'L\'adresse est requise';
      } else {
        if (!registerForm.restaurantName) newErrors.restaurantName = 'Le nom du restaurant est requis';
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
        if (!registerForm.cuisineType) newErrors.cuisineType = 'Le type de cuisine est requis';
        if (!registerForm.businessHours) newErrors.businessHours = 'Les horaires sont requis';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await login({
        email: loginForm.email,
        password: loginForm.password
      });

      if (result.success) {
        toast.success('Connexion réussie !');
        navigate('/profile'); // Redirection vers le profil
      } else {
        toast.error(result.error || 'Erreur de connexion');
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const userData = {
        name: `${registerForm.firstName} ${registerForm.lastName}`,
        email: registerForm.email,
        password: registerForm.password,
        password_confirmation: registerForm.confirmPassword,
        phone: registerForm.phone,
        address: registerForm.address,
        is_vendor: registerForm.accountType === 'vendor'
      };

      const result = await register(userData);

      if (result.success) {
        toast.success('Inscription réussie !');
        navigate('/profile'); // Redirection vers le profil
      } else {
        toast.error(result.error || 'Erreur d\'inscription');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLoginForm = (field: keyof LoginForm, value: string | boolean) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateRegisterForm = (field: keyof RegisterForm, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre animés */}
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
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 dark:text-gray-400"
            >
              {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
            </motion.p>
          </Link>
        </motion.div>

        {/* Toggle Login/Register */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6"
        >
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin
                  ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin
                  ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Inscription
            </button>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) => updateLoginForm('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.email
                          ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                      placeholder="votre@email.com"
                    />
                    {errors.email && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginForm.password}
                      onChange={(e) => updateLoginForm('password', e.target.value)}
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
                    {errors.password && (
                      <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.password}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={loginForm.rememberMe}
                      onChange={(e) => updateLoginForm('rememberMe', e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      Se souvenir de moi
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                  >
                    Mot de passe oublié ?
                  </Link>
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
                      Connexion...
                    </div>
                  ) : (
                    <>
                      Se connecter
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                {/* Account Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Type de compte
                  </label>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => updateRegisterForm('accountType', 'client')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
                        registerForm.accountType === 'client'
                          ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Client
                    </button>
                    <button
                      type="button"
                      onClick={() => updateRegisterForm('accountType', 'vendor')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center ${
                        registerForm.accountType === 'vendor'
                          ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Store className="h-4 w-4 mr-2" />
                      Vendeur
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {registerForm.accountType === 'client' ? (
                    <motion.div
                      key="client-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Name Fields */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Prénom
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={registerForm.firstName}
                              onChange={(e) => updateRegisterForm('firstName', e.target.value)}
                              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                                errors.firstName
                                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                              } text-gray-900 dark:text-white`}
                              placeholder="Prénom"
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
                              onChange={(e) => updateRegisterForm('lastName', e.target.value)}
                              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                                errors.lastName
                                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                              } text-gray-900 dark:text-white`}
                              placeholder="Nom"
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

                      {/* Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Adresse
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={registerForm.address}
                            onChange={(e) => updateRegisterForm('address', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                              errors.address
                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                            } text-gray-900 dark:text-white`}
                            placeholder="Votre adresse de livraison"
                          />
                        </div>
                        {errors.address && (
                          <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.address}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="vendor-form"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Restaurant Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nom du restaurant
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={registerForm.restaurantName}
                            onChange={(e) => updateRegisterForm('restaurantName', e.target.value)}
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

                      {/* Cuisine Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Type de cuisine
                        </label>
                        <div className="relative">
                          <ChefHat className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <select
                            value={registerForm.cuisineType}
                            onChange={(e) => updateRegisterForm('cuisineType', e.target.value)}
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

                      {/* Business Hours */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Horaires d'ouverture
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={registerForm.businessHours}
                            onChange={(e) => updateRegisterForm('businessHours', e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                              errors.businessHours
                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                            } text-gray-900 dark:text-white`}
                            placeholder="Ex: 8h-22h, fermé le lundi"
                          />
                        </div>
                        {errors.businessHours && (
                          <div className="flex items-center mt-1 text-red-600 dark:text-red-400 text-sm">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.businessHours}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Common Fields */}
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={registerForm.email}
                        onChange={(e) => updateRegisterForm('email', e.target.value)}
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

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={registerForm.phone}
                        onChange={(e) => updateRegisterForm('phone', e.target.value)}
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

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerForm.password}
                        onChange={(e) => updateRegisterForm('password', e.target.value)}
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

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerForm.confirmPassword}
                        onChange={(e) => updateRegisterForm('confirmPassword', e.target.value)}
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
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {isLogin ? "Vous n'avez pas de compte ? " : "Vous avez déjà un compte ? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
} 
