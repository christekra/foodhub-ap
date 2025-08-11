import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Save, 
  AlertCircle,
  DollarSign,
  Tag,
  Clock,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

interface Category {
  id: number;
  name: string;
}

interface DishFormData {
  name: string;
  description: string;
  price: string;
  discount_price: string;
  category_id: string;
  image: string;
  is_available: boolean;
  is_popular: boolean;
  is_featured: boolean;
  preparation_time: string;
  spice_level: string;
  cuisine_type: string;
  dietary_info: {
    vegetarian: boolean;
    vegan: boolean;
    gluten_free: boolean;
    halal: boolean;
    kosher: boolean;
  };
  allergens: string[];
  ingredients: string;
  nutritional_info: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

const spiceLevels = [
  { value: 'mild', label: 'Doux' },
  { value: 'medium', label: 'Moyen' },
  { value: 'hot', label: 'Épicé' },
  { value: 'very_hot', label: 'Très épicé' }
];

const cuisineTypes = [
  'Africaine', 'Américaine', 'Asiatique', 'Européenne', 'Indienne', 
  'Italienne', 'Japonaise', 'Mexicaine', 'Méditerranéenne', 'Thaïlandaise'
];

const allergens = [
  'Gluten', 'Lactose', 'Œufs', 'Poisson', 'Crustacés', 'Arachides', 
  'Noix', 'Soja', 'Moutarde', 'Céleri', 'Sésame', 'Sulfites', 'Lupin', 'Mollusques'
];

export default function VendorAddDishPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'nutrition'>('basic');

  const [formData, setFormData] = useState<DishFormData>({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    image: '',
    is_available: true,
    is_popular: false,
    is_featured: false,
    preparation_time: '',
    spice_level: 'mild',
    cuisine_type: '',
    dietary_info: {
      vegetarian: false,
      vegan: false,
      gluten_free: false,
      halal: false,
      kosher: false,
    },
    allergens: [],
    ingredients: '',
    nutritional_info: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
    },
  });

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        toast.error('Erreur lors du chargement des catégories');
      }
    };

    if (isAuthenticated) {
      loadCategories();
    }
  }, [isAuthenticated]);

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
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connexion requise
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Connectez-vous pour ajouter un plat
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
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (name.startsWith('dietary_info.')) {
        const dietaryKey = name.split('.')[1] as keyof typeof formData.dietary_info;
        setFormData(prev => ({
          ...prev,
          dietary_info: {
            ...prev.dietary_info,
            [dietaryKey]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAllergenChange = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  // Fonction pour compresser l'image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Définir une taille maximale plus grande pour préserver la qualité
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Redimensionner si nécessaire
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dessiner l'image redimensionnée
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir en base64 avec compression modérée pour préserver la qualité
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        // Vérifier la taille de la chaîne base64 (limite augmentée)
        if (compressedBase64.length > 50000) {
          // Si encore trop grande, compresser davantage mais garder l'image
          const moreCompressed = canvas.toDataURL('image/jpeg', 0.6);
          resolve(moreCompressed);
        } else {
          resolve(compressedBase64);
        }
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Fonction pour gérer le changement d'image
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('L\'image est trop volumineuse. Taille maximale : 5MB');
        return;
      }
      
      try {
        const compressedImage = await compressImage(file);
        setFormData(prev => ({
          ...prev,
          image: compressedImage
        }));
        setImagePreview(compressedImage);
        toast.success('Image compressée et ajoutée avec succès');
      } catch (error) {
        toast.error('Erreur lors du traitement de l\'image');
      }
    }
  };

  // Fonction pour supprimer l'image
  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    setImagePreview('');
    toast.success('Image supprimée');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom du plat est requis');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('La description est requise');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Le prix doit être supérieur à 0');
      return false;
    }
    if (formData.discount_price && parseFloat(formData.discount_price) >= parseFloat(formData.price)) {
      toast.error('Le prix réduit doit être inférieur au prix normal');
      return false;
    }
    if (!formData.category_id) {
      toast.error('Veuillez sélectionner une catégorie');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Convertir les ingrédients de chaîne vers tableau
      const ingredientsArray = formData.ingredients
        ? formData.ingredients.split(',').map(ingredient => ingredient.trim()).filter(ingredient => ingredient.length > 0)
        : [];

      // Convertir spice_level de chaîne vers entier
      const spiceLevelMap: { [key: string]: number } = {
        'mild': 1,
        'medium': 2,
        'hot': 3,
        'very_hot': 4
      };

      const dishData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category_id: parseInt(formData.category_id),
        image: formData.image,
        is_available: formData.is_available,
        is_popular: formData.is_popular,
        is_featured: formData.is_featured,
        preparation_time: formData.preparation_time ? parseInt(formData.preparation_time) : 15, // Valeur par défaut 15
        spice_level: spiceLevelMap[formData.spice_level] || 1,
        cuisine_type: formData.cuisine_type,
        is_vegetarian: formData.dietary_info.vegetarian,
        is_vegan: formData.dietary_info.vegan,
        is_gluten_free: formData.dietary_info.gluten_free,
        is_spicy: formData.spice_level !== 'mild',
        allergens: formData.allergens,
        ingredients: ingredientsArray,
        calories: formData.nutritional_info.calories ? parseFloat(formData.nutritional_info.calories) : null,
      };

      await apiService.createVendorDish(dishData);
      
      toast.success('Plat ajouté avec succès !');
      navigate('/vendor/dashboard');
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du plat:', error);
      toast.error('Erreur lors de l\'ajout du plat');
    } finally {
      setLoading(false);
    }
  };

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
                  Ajouter un plat
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Créez un nouveau plat pour votre menu
                </p>
              </div>
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
          {/* Onglets */}
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
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
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Détails et options
            </button>
            <button
              onClick={() => setActiveTab('nutrition')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'nutrition'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Nutrition et allergènes
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'basic' && (
                <motion.div
                  key="basic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image du plat
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 h-32 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center">
                        {imagePreview ? (
                          <div className="relative w-full h-full">
                            <img
                              src={imagePreview}
                              alt="Aperçu"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choisir une image
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          JPG, PNG ou GIF jusqu'à 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom du plat *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Ex: Burger Classique"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Décrivez votre plat..."
                      required
                    />
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Catégorie *
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Prix normal (FCFA) *
                       </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         Prix réduit (FCFA)
                       </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="number"
                          name="discount_price"
                          value={formData.discount_price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Options de base */}
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_available"
                        checked={formData.is_available}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Disponible immédiatement
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_popular"
                        checked={formData.is_popular}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Marquer comme populaire
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Mettre en avant
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Temps de préparation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Temps de préparation (minutes)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        name="preparation_time"
                        value={formData.preparation_time}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="15"
                      />
                    </div>
                  </div>

                  {/* Niveau d'épices */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Niveau d'épices
                    </label>
                    <select
                      name="spice_level"
                      value={formData.spice_level}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {spiceLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type de cuisine */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de cuisine
                    </label>
                    <select
                      name="cuisine_type"
                      value={formData.cuisine_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un type</option>
                      {cuisineTypes.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ingrédients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ingrédients principaux
                    </label>
                    <textarea
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Séparez les ingrédients par des virgules (ex: Poulet, Oignons, Tomates, Épices...)"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Séparez chaque ingrédient par une virgule
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'nutrition' && (
                <motion.div
                  key="nutrition"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Informations nutritionnelles */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Informations nutritionnelles (pour 100g)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Calories
                        </label>
                        <input
                          type="number"
                          name="nutritional_info.calories"
                          value={formData.nutritional_info.calories}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            nutritional_info: {
                              ...prev.nutritional_info,
                              calories: e.target.value
                            }
                          }))}
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="kcal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Protéines (g)
                        </label>
                        <input
                          type="number"
                          name="nutritional_info.protein"
                          value={formData.nutritional_info.protein}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            nutritional_info: {
                              ...prev.nutritional_info,
                              protein: e.target.value
                            }
                          }))}
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Glucides (g)
                        </label>
                        <input
                          type="number"
                          name="nutritional_info.carbs"
                          value={formData.nutritional_info.carbs}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            nutritional_info: {
                              ...prev.nutritional_info,
                              carbs: e.target.value
                            }
                          }))}
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Lipides (g)
                        </label>
                        <input
                          type="number"
                          name="nutritional_info.fat"
                          value={formData.nutritional_info.fat}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            nutritional_info: {
                              ...prev.nutritional_info,
                              fat: e.target.value
                            }
                          }))}
                          min="0"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Régimes alimentaires */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Régimes alimentaires
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(formData.dietary_info).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            name={`dietary_info.${key}`}
                            checked={value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                            {key.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Allergènes */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Allergènes présents
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {allergens.map(allergen => (
                        <div key={allergen} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.allergens.includes(allergen)}
                            onChange={() => handleAllergenChange(allergen)}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {allergen}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Boutons de navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-slate-700">
              <div className="flex space-x-2">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'details' ? 'basic' : 'details')}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Précédent
                  </button>
                )}
                {activeTab !== 'nutrition' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === 'basic' ? 'details' : 'nutrition')}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Suivant
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => navigate('/vendor/dashboard')}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Ajout en cours...' : 'Ajouter le plat'}</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 