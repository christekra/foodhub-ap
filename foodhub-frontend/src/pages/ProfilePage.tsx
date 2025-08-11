import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  ShoppingBag, 
  Star, 
  Clock,
  LogOut,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await updateProfile(formData);
      
      if (result.success) {
        toast.success('Profil mis à jour avec succès !');
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold dark:text-white">Mon Profil</h1>
                <p className="text-gray-600 dark:text-gray-300">Gérez vos informations personnelles</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-orange-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </motion.button>
              ) : (
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        address: user?.address || '',
                        city: user?.city || '',
                        postal_code: user?.postal_code || '',
                      });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Annuler</span>
                  </motion.button>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations personnelles */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-6 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informations personnelles
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom complet
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Téléphone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">{user.phone || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Adresse
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Adresse"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="Ville"
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                        <input
                          type="text"
                          name="postal_code"
                          value={formData.postal_code}
                          onChange={handleInputChange}
                          placeholder="Code postal"
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-900 dark:text-white">
                      {user.address ? (
                        <>
                          <p>{user.address}</p>
                          <p>{user.city} {user.postal_code}</p>
                        </>
                      ) : (
                        <p>Non renseigné</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistiques et actions rapides */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Statistiques */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Mes statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <div className="flex items-center">
                    <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Commandes</span>
                  </div>
                  <span className="font-bold text-orange-600 dark:text-orange-400">0</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avis donnés</span>
                  </div>
                  <span className="font-bold text-yellow-600 dark:text-yellow-400">0</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Membre depuis</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Actions rapides</h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/commandes')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center">
                    <ShoppingBag className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-3" />
                    <div>
                      <p className="font-medium dark:text-white">Mes commandes</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Voir l'historique</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/panier')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center">
                    <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="font-medium dark:text-white">Mon panier</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Continuer les achats</p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/plats')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                    <div>
                      <p className="font-medium dark:text-white">Découvrir</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Nouveaux plats</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 