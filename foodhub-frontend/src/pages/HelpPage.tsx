import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  HelpCircle, 
  FileText, 
  Video, 
  MessageCircle, 
  Phone, 
  Mail,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Settings,
  CreditCard,
  Truck,
  User,
  Shield,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react';

const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const categories = [
    { id: 'general', name: 'Général', icon: HelpCircle },
    { id: 'orders', name: 'Commandes', icon: FileText },
    { id: 'delivery', name: 'Livraison', icon: Truck },
    { id: 'account', name: 'Compte', icon: User },
    { id: 'payment', name: 'Paiement', icon: CreditCard },
    { id: 'technical', name: 'Technique', icon: Settings }
  ];

  const faqs = {
    general: [
      {
        question: 'Comment créer un compte FoodHub ?',
        answer: 'Cliquez sur "S\'inscrire" en haut à droite, remplissez le formulaire avec vos informations et validez votre email. Votre compte sera créé en quelques minutes.'
      },
      {
        question: 'Comment modifier mes informations personnelles ?',
        answer: 'Allez dans "Mon Profil" depuis votre tableau de bord, cliquez sur "Modifier" et mettez à jour vos informations. N\'oubliez pas de sauvegarder.'
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer: 'Contactez notre support client. Nous traiterons votre demande dans les 48h et supprimerons définitivement vos données.'
      }
    ],
    orders: [
      {
        question: 'Comment passer une commande ?',
        answer: 'Parcourez les restaurants, sélectionnez vos plats, ajoutez-les au panier, vérifiez votre commande et procédez au paiement. C\'est simple et rapide !'
      },
      {
        question: 'Comment annuler une commande ?',
        answer: 'Vous pouvez annuler dans les 5 minutes suivant la passation. Allez dans "Mes Commandes" et cliquez sur "Annuler". Après ce délai, contactez le support.'
      },
      {
        question: 'Comment modifier une commande ?',
        answer: 'Les modifications sont possibles uniquement dans les 2 minutes suivant la passation. Contactez immédiatement notre support pour toute modification.'
      },
      {
        question: 'Comment suivre ma commande ?',
        answer: 'Allez dans "Mes Commandes" et cliquez sur votre commande active. Vous verrez le statut en temps réel et la position du livreur sur la carte.'
      }
    ],
    delivery: [
      {
        question: 'Quels sont les délais de livraison ?',
        answer: 'Nos délais varient entre 20 et 45 minutes selon votre localisation, la disponibilité du restaurant et les conditions de circulation.'
      },
      {
        question: 'Comment fonctionne la livraison gratuite ?',
        answer: 'La livraison est gratuite pour toute commande supérieure à 10,000 FCFA. En dessous, des frais de 500 à 1,500 FCFA s\'appliquent selon la distance.'
      },
      {
        question: 'Que faire si ma commande n\'arrive pas ?',
        answer: 'Contactez immédiatement notre support au +225 27 22 49 28 90. Nous localiserons votre commande et vous tiendrons informé.'
      },
      {
        question: 'Puis-je choisir mon livreur ?',
        answer: 'Non, nos livreurs sont assignés automatiquement selon la disponibilité et la proximité pour optimiser les délais de livraison.'
      }
    ],
    account: [
      {
        question: 'J\'ai oublié mon mot de passe, que faire ?',
        answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Entrez votre email et suivez les instructions pour le réinitialiser.'
      },
      {
        question: 'Comment changer mon mot de passe ?',
        answer: 'Allez dans "Mon Profil" > "Sécurité" > "Changer le mot de passe". Entrez votre mot de passe actuel et le nouveau.'
      },
      {
        question: 'Comment ajouter une adresse de livraison ?',
        answer: 'Dans "Mon Profil" > "Adresses", cliquez sur "Ajouter une adresse" et remplissez le formulaire avec vos coordonnées.'
      }
    ],
    payment: [
      {
        question: 'Quels moyens de paiement acceptez-vous ?',
        answer: 'Nous acceptons les cartes bancaires, Orange Money, MTN Money, Moov Money, et le paiement en espèces à la livraison.'
      },
      {
        question: 'Mes informations de paiement sont-elles sécurisées ?',
        answer: 'Absolument ! Nous utilisons un cryptage SSL et ne stockons jamais vos informations de paiement. Toutes les transactions sont sécurisées.'
      },
      {
        question: 'Comment obtenir un reçu ?',
        answer: 'Après chaque commande, un reçu électronique est automatiquement envoyé à votre email. Vous pouvez aussi le télécharger depuis "Mes Commandes".'
      }
    ],
    technical: [
      {
        question: 'L\'application ne se charge pas, que faire ?',
        answer: 'Vérifiez votre connexion internet, fermez et rouvrez l\'application, ou essayez de la réinstaller depuis l\'App Store ou Google Play.'
      },
      {
        question: 'Comment signaler un bug ?',
        answer: 'Utilisez le formulaire de contact en sélectionnant "Problème technique" ou envoyez un email à support@foodhub.ci avec les détails.'
      },
      {
        question: 'L\'application plante souvent, comment résoudre ?',
        answer: 'Mettez à jour l\'application vers la dernière version, redémarrez votre appareil et libérez de l\'espace de stockage.'
      }
    ]
  };

  const guides = [
    {
      title: 'Guide du premier utilisateur',
      description: 'Tout ce que vous devez savoir pour commencer avec FoodHub',
      icon: BookOpen,
      duration: '5 min',
      category: 'Débutant'
    },
    {
      title: 'Optimiser vos commandes',
      description: 'Conseils pour des commandes plus rapides et économiques',
      icon: Star,
      duration: '3 min',
      category: 'Astuces'
    },
    {
      title: 'Sécurité et confidentialité',
      description: 'Comment protéger vos données et informations personnelles',
      icon: Shield,
      duration: '4 min',
      category: 'Sécurité'
    },
    {
      title: 'Utiliser les promotions',
      description: 'Comment profiter au maximum des offres et réductions',
      icon: CreditCard,
      duration: '2 min',
      category: 'Économies'
    }
  ];

  const filteredFaqs = faqs[activeCategory as keyof typeof faqs] || [];

  const handleFaqToggle = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Centre d'aide{' '}
              <span className="bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
                FoodHub
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Trouvez rapidement des réponses à vos questions et des solutions à vos problèmes.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans l'aide..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center p-6 bg-gradient-to-br from-orange-50 to-green-50 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <Phone className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Appel direct</h3>
              <p className="text-gray-600 mb-4">Parlez directement à notre équipe</p>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
                Appeler maintenant
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-6 bg-gradient-to-br from-orange-50 to-green-50 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <MessageCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chat en ligne</h3>
              <p className="text-gray-600 mb-4">Assistance instantanée 24h/24</p>
              <button 
                onClick={() => navigate('/chat')}
                className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Démarrer le chat
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center p-6 bg-gradient-to-br from-orange-50 to-green-50 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <Mail className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email support</h3>
              <p className="text-gray-600 mb-4">Réponse sous 24h garantie</p>
              <button className="bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors">
                Envoyer un email
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories and FAQ */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Questions fréquentes
            </h2>
            <p className="text-xl text-gray-600">
              Sélectionnez une catégorie pour trouver rapidement votre réponse.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-50'
                }`}
              >
                <category.icon className="w-5 h-5" />
                {category.name}
              </motion.button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={() => handleFaqToggle(index)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      {expandedFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-4"
                        >
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Guides et tutoriels
            </h2>
            <p className="text-xl text-gray-600">
              Apprenez à utiliser FoodHub comme un pro avec nos guides détaillés.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {guides.map((guide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-orange-50 to-green-50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-4">
                  <guide.icon className="w-8 h-8 text-orange-500" />
                  <span className="text-sm font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                    {guide.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {guide.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {guide.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {guide.duration}
                  </span>
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                    Lire le guide →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Besoin d'aide supplémentaire ?
            </h2>
            <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
              Notre équipe support est là pour vous aider 24h/24 et 7j/7. 
              N'hésitez pas à nous contacter pour toute question spécifique.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Appeler le support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Chat en ligne
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
