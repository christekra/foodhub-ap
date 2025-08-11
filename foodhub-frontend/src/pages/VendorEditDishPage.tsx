import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_price?: number;
  image?: string;
  is_available: boolean;
  category_id: number;
  ingredients?: string[];
  allergens?: string[];
  preparation_time?: number;
  calories?: number;
  cuisine_type?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_spicy: boolean;
  spice_level?: number;
}

interface Category {
  id: number;
  name: string;
}

export default function VendorEditDishPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dish, setDish] = useState<Dish | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'dietary'>('basic');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    is_available: true,
    ingredients: [] as string[],
    allergens: [] as string[],
    preparation_time: '',
    calories: '',
    cuisine_type: '',
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_spicy: false,
    spice_level: '0'
  });

  // Charger les données
  useEffect(() => {
    if (isAuthenticated && user?.account_type === 'vendor' && id) {
      loadData();
    }
  }, [isAuthenticated, user, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Chargement des données pour le plat ID:', id);
      
      // Charger les catégories
      const categoriesResponse = await apiService.getCategories();
      setCategories(categoriesResponse.data || []);
      console.log('Catégories chargées:', categoriesResponse.data);
      
      // Charger le plat
      const dishResponse = await apiService.getDish(parseInt(id!));
      const dishData = dishResponse.data;
      console.log('Données du plat chargées:', dishData);
      
      setDish(dishData);
      setFormData({
        name: dishData.name || '',
        description: dishData.description || '',
        price: dishData.price?.toString() || '',
        discount_price: dishData.discount_price?.toString() || '',
        category_id: dishData.category_id?.toString() || '',
        is_available: dishData.is_available ?? true,
        ingredients: dishData.ingredients || [],
        allergens: dishData.allergens || [],
        preparation_time: dishData.preparation_time?.toString() || '',
        calories: dishData.calories?.toString() || '',
        cuisine_type: dishData.cuisine_type || '',
        is_vegetarian: dishData.is_vegetarian ?? false,
        is_vegan: dishData.is_vegan ?? false,
        is_gluten_free: dishData.is_gluten_free ?? false,
        is_spicy: dishData.is_spicy ?? false,
        spice_level: dishData.spice_level?.toString() || '0'
      });
      
      if (dishData.image) {
        setImagePreview(dishData.image);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const dishData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category_id: parseInt(formData.category_id),
        preparation_time: formData.preparation_time ? parseInt(formData.preparation_time) : null,
        calories: formData.calories ? parseFloat(formData.calories) : null,
        spice_level: parseInt(formData.spice_level),
        image: imagePreview
      };

      await apiService.updateVendorDish(parseInt(id!), dishData);
      
      toast.success('Plat mis à jour avec succès');
      navigate('/vendor/dashboard');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du plat');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      return;
    }

    try {
      setSaving(true);
      await apiService.deleteVendorDish(parseInt(id!));
      toast.success('Plat supprimé avec succès');
      navigate('/vendor/dashboard');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du plat');
    } finally {
      setSaving(false);
    }
  };

  // Vérifications d'accès
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connexion requise
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Connectez-vous pour modifier ce plat
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Se connecter
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (user?.account_type !== 'vendor') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center"
          >
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Accès réservé aux vendeurs
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Cette page est réservée aux comptes vendeurs
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
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
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/vendor/dashboard')}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Modifier le plat
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {dish?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg"
        >
          <form onSubmit={handleSubmit}>
            {/* Onglets */}
            <div className="flex border-b border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'basic'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Informations de base
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Détails
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('dietary')}
                className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                  activeTab === 'dietary'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Régime alimentaire
              </button>
            </div>

            <div className="p-6">
              {/* Onglet Informations de base */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom du plat *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prix normal (FCFA) *
                      </label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        required
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prix réduit (FCFA)
                      </label>
                      <input
                        type="number"
                        value={formData.discount_price}
                        onChange={(e) => handleInputChange('discount_price', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => handleInputChange('category_id', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image du plat
                    </label>
                    <div className="space-y-4">
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Aperçu"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={formData.is_available}
                      onChange={(e) => handleInputChange('is_available', e.target.checked)}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="is_available" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Plat disponible
                    </label>
                  </div>
                </div>
              )}

              {/* Onglet Détails */}
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Temps de préparation (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.preparation_time}
                        onChange={(e) => handleInputChange('preparation_time', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Calories
                      </label>
                      <input
                        type="number"
                        value={formData.calories}
                        onChange={(e) => handleInputChange('calories', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de cuisine
                    </label>
                    <input
                      type="text"
                      value={formData.cuisine_type}
                      onChange={(e) => handleInputChange('cuisine_type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                      placeholder="ex: Italienne, Asiatique, Africaine..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Niveau d'épice (0-5)
                    </label>
                    <select
                      value={formData.spice_level}
                      onChange={(e) => handleInputChange('spice_level', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    >
                      <option value="0">0 - Pas épicé</option>
                      <option value="1">1 - Très doux</option>
                      <option value="2">2 - Doux</option>
                      <option value="3">3 - Moyen</option>
                      <option value="4">4 - Épicé</option>
                      <option value="5">5 - Très épicé</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Onglet Régime alimentaire */}
              {activeTab === 'dietary' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_vegetarian"
                        checked={formData.is_vegetarian}
                        onChange={(e) => handleInputChange('is_vegetarian', e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="is_vegetarian" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Végétarien
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_vegan"
                        checked={formData.is_vegan}
                        onChange={(e) => handleInputChange('is_vegan', e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="is_vegan" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Végétalien
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_gluten_free"
                        checked={formData.is_gluten_free}
                        onChange={(e) => handleInputChange('is_gluten_free', e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="is_gluten_free" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Sans gluten
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_spicy"
                        checked={formData.is_spicy}
                        onChange={(e) => handleInputChange('is_spicy', e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <label htmlFor="is_spicy" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Épicé
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => navigate('/vendor/dashboard')}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 