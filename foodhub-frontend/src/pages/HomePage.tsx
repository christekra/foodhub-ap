
import React, { useRef, useState, useEffect } from "react"
import { ShoppingBag, PlayCircle, ShieldCheck, Clock, Heart, Star } from "lucide-react"
import { ChefHat, Shield, Truck, ArrowRight, ChevronRight, ChevronLeft } from "lucide-react"

import { ParticlesBackground } from "../components/ui/ParticlesBackground"
import apiService from "../services/api"
import { useCart } from "../contexts/CartContext"
import { useNavigate } from "react-router-dom"

// Types pour le composant Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
}

// Types pour les données du backend
interface Vendor {
  id: number;
  name: string;
  description: string;
  rating?: number | string | null;
  review_count?: number | null;
  delivery_time?: string | number;
  delivery_fee?: number;
  logo?: string;
  cover_image?: string;
  is_featured: boolean;
  cuisine_type?: string;
}

interface Dish {
  id: number;
  name: string;
  description: string;
  price?: number | string | null;
  discount_price?: number | string | null;
  image?: string;
  rating?: number | string | null;
  review_count?: number | null;
  order_count?: number | null;
  is_popular: boolean;
  is_featured: boolean;
  vendor: Vendor;
  category?: {
    id: number;
    name: string;
  };
}

// Animations avancées
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
}

const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
}

const staggerContainer = (staggerChildren: number) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren: 0.1
    }
  }
})

// Animation pour les cartes qui flottent
const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

// Animation pour les éléments qui apparaissent au scroll
const scrollReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
}

// Composant Button simple
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    const variantClasses: Record<string, string> = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
      ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
      link: "text-orange-600 underline-offset-4 hover:underline dark:text-blue-400",
    }
    
    const sizeClasses: Record<string, string> = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()
    
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function HomePage() {
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart();
  
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const vendorsRef = useRef<HTMLDivElement>(null)
  const dishesRef = useRef<HTMLDivElement>(null)
  
  const isInViewHero = useInView(heroRef, { once: true, amount: 0.3 })
  const isInViewFeatures = useInView(featuresRef, { once: true, amount: 0.1 })
  const isInViewVendors = useInView(vendorsRef, { once: true, amount: 0.1 })
  const isInViewDishes = useInView(dishesRef, { once: true, amount: 0.1 })

  // États pour les données du backend
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[]>([])
  const [popularDishes, setPopularDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)

  // Charger les données du backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Charger les vendeurs populaires
        console.log('Chargement des vendeurs populaires...')
        const vendorsResponse = await apiService.getFeaturedVendors()
        console.log('Réponse vendeurs:', vendorsResponse)
        setFeaturedVendors(vendorsResponse.data || [])
        
        // Charger les plats populaires
        console.log('Chargement des plats populaires...')
        const dishesResponse = await apiService.getPopularDishes()
        console.log('Réponse plats populaires:', dishesResponse)
        setPopularDishes(dishesResponse.data || [])
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Données factices pour les fonctionnalités
  const features: Feature[] = [
    {
      icon: <ChefHat className="w-10 h-10 mx-auto text-orange-600 dark:text-blue-400" />,
      title: "Cuisine locale",
      description: "Des plats préparés avec des ingrédients frais et locaux"
    },
    {
      icon: <Truck className="w-10 h-10 mx-auto text-orange-600 dark:text-blue-400" />,
      title: "Livraison rapide",
      description: "Service de livraison express à votre porte en moins de 30 minutes"
    },
    {
      icon: <Shield className="w-10 h-10 mx-auto text-orange-600 dark:text-blue-400" />,
      title: "Paiement sécurisé",
      description: "Paiement 100% sécurisé avec cryptage SSL"
    },
    {
      icon: <Star className="w-10 h-10 mx-auto text-orange-600 dark:text-blue-400" />,
      title: "Qualité garantie",
      description: "Nous sélectionnons les meilleurs restaurants pour vous"
    }
  ];

  // Fonction pour obtenir l'image par défaut
  const getDefaultImage = (type: 'vendor' | 'dish') => {
    if (type === 'vendor') {
      return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
    }
    return "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80"
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 relative overflow-hidden">

      
      {/* Arrière-plan animé */}
      <ParticlesBackground className="fixed inset-0 -z-10" />

      {/* En-tête avec effet de parallaxe */}
      <motion.header 
        ref={heroRef}
        className="relative bg-gradient-to-r from-blue-600/90 to-blue-800/90 text-white py-24 md:py-32 overflow-hidden"
        style={{
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: isInViewHero ? 'none' : 'translateY(20px)',
          opacity: isInViewHero ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className="max-w-4xl mx-auto text-center"
            }
             : {}}
            }
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              variants={fadeInUp}
            >
              Vos plats préférés, <span className="text-yellow-300">livrés chez vous</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Commandez en ligne auprès de vos restaurants préférés et faites-vous livrer en un rien de temps.
            </motion.p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <div
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-300 to-orange-400 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Button 
                  onClick={() => navigate('/plats')}
                                      className="relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300"
                >
                  <motion.span
                    }
                    whileHover={{ x: 5 }}
                    }
                  >
                    Commander maintenant
                  </motion.span>
                </Button>
              </div>
              <div
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-blue-100 dark:bg-white/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Button 
                  onClick={() => navigate('/restaurants')}
                  variant="outline" 
                                      className="relative border-2 border-orange-500 dark:border-white text-orange-600 dark:text-white hover:bg-blue-50 dark:hover:bg-white/10 px-8 py-4 text-lg font-medium backdrop-blur-sm transition-all duration-300"
                >
                  <motion.span
                    }
                    whileHover={{ x: 5 }}
                    }
                  >
                    Explorer les restaurants
                  </motion.span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vague décorative en bas de l'en-tête */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path 
              fill="#fff" 
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </motion.header>

      {/* Section Fonctionnalités */}
      <section 
        ref={featuresRef}
        className="py-20 relative z-10"
      >
        <div className="container mx-auto px-4">
          <div 
            className="text-center mb-16"
            }
             : {}}
            }
          >
            <span className="text-orange-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2 inline-block">Pourquoi nous choisir</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 dark:text-white">Une expérience culinaire exceptionnelle</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div 
            className="grid md:grid-cols-3 gap-10"
            variants={staggerContainer(0.1)}
            initial="hidden"
            
          >
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 relative overflow-hidden"
                variants={fadeInUp}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <div 
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-300"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                >
                  <div
                    whileHover={{ 
                      scale: 1.2,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                  >
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">{feature.description}</p>
                
                {/* Effet de fond décoratif */}
                <div className="absolute -z-10 -top-10 -right-10 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Vendeurs populaires */}
      <section 
        ref={vendorsRef}
        className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden"
      >
        {/* Éléments décoratifs */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-5">
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 -right-20 w-64 h-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-3/4 left-1/4 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className="flex flex-col md:flex-row justify-between items-center mb-12"
            }
             : {}}
            }
          >
            <div>
              <span className="text-orange-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2 inline-block">Nos partenaires</span>
              <h2 className="text-3xl md:text-4xl font-bold dark:text-white">Restaurants populaires</h2>
            </div>
            <div
              whileHover={{ x: 5 }}
            >
              <Button 
                variant="ghost" 
                className="mt-4 md:mt-0 text-orange-600 dark:text-blue-400 group"
              >
                Voir tout <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-200 dark:bg-slate-700"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer(0.1)}
              initial="hidden"
              
            >
              {featuredVendors.map((vendor, index) => (
                <div 
                  key={vendor.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  variants={fadeInUp}
                  whileHover={{ 
                    y: -10,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  <div className="h-48 bg-gray-200 dark:bg-slate-700 relative overflow-hidden">
                    <motion.img 
                      src={vendor.cover_image || vendor.logo || getDefaultImage('vendor')} 
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      }
                      whileHover={{ scale: 1.1 }}
                    />
                    <div className="absolute top-3 right-3 bg-orange-400 text-orange-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center shadow-md">
                      <Star className="h-4 w-4 mr-1 fill-current" />
                      {Number(vendor.rating || 0).toFixed(1)}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Voir le menu
                      </Button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl dark:text-white group-hover:text-orange-600 dark:group-hover:text-blue-400 transition-colors">
                          {vendor.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{vendor.cuisine_type || 'Cuisine variée'}</p>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {vendor.delivery_time || '20-30 min'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section Plats populaires */}
      <section 
        ref={dishesRef}
        className="py-20 bg-white dark:bg-slate-900 relative overflow-hidden"
      >
        {/* Effet de fond décoratif */}
        <div className="absolute inset-0 overflow-hidden opacity-10 dark:opacity-5">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl transform translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div 
            className="flex flex-col md:flex-row justify-between items-center mb-12"
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            }
          >
            <div className="text-center md:text-left">
              <motion.span 
                className="text-orange-600 dark:text-blue-400 font-semibold text-sm uppercase tracking-wider mb-2 inline-block"
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                }
              >
                Découvrez
              </motion.span>
              <motion.h2 
                className="text-3xl md:text-4xl font-bold dark:text-white"
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                }
              >
                Plats populaires
              </motion.h2>
            </div>
            <div 
              className="flex space-x-2 mt-4 md:mt-0"
              }
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              }
            >
              <div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
              <div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
              <div className="flex space-x-6 md:space-x-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg snap-center animate-pulse">
                    <div className="h-48 bg-gray-200 dark:bg-slate-700"></div>
                    <div className="p-5">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div 
              className="relative"
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="relative">
                {/* Flèches de navigation pour mobile */}
                <div className="md:hidden absolute inset-y-0 left-0 flex items-center z-10">
                  <button 
                    aria-label="Précédent"
                    className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-full shadow-lg -ml-2"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                  <div className="flex space-x-6 md:space-x-8">
                    {popularDishes.map((dish, index) => (
                      <div 
                        key={dish.id}
                        className="w-72 flex-shrink-0 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg snap-center relative group"
                        }
                        whileInView={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { 
                            delay: index * 0.1,
                            duration: 0.5,
                            ease: [0.25, 0.1, 0.25, 1]
                          }
                        }}
                        viewport={{ once: true, margin: "-50px" }}
                        whileHover={{ 
                          y: -10,
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                      >
                        {/* Badge de promotion */}
                        {dish.is_popular && (
                          <div className="absolute top-4 left-4 z-10">
                            <span className="bg-gradient-to-r from-violet-400 to-violet-500 text-orange-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                              Populaire
                            </span>
                          </div>
                        )}
                        
                        {/* Image du plat */}
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                          <motion.img 
                            src={dish.image || getDefaultImage('dish')} 
                            alt={dish.name}
                            className="w-full h-full object-cover"
                            }
                            whileHover={{ scale: 1.1 }}
                            }
                          />
                          
                          {/* Bouton favori */}
                          <motion.button 
                            className="absolute top-3 right-3 bg-white/80 dark:bg-slate-800/80 p-2 rounded-full shadow-md backdrop-blur-sm"
                            whileHover={{ 
                              scale: 1.1, 
                              color: '#ef4444',
                              backgroundColor: 'rgba(255, 255, 255, 0.9)'
                            }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Heart className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                          </motion.button>
                          
                          {/* Note du plat */}
                          <div className="absolute bottom-3 left-3 bg-orange-400 text-orange-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-md">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            <span>{Number(dish.rating || 0).toFixed(1)}</span>
                            <span className="ml-1 text-orange-800 opacity-80">({dish.review_count || 0})</span>
                          </div>
                        </div>
                        
                        {/* Détails du plat */}
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg dark:text-white line-clamp-1">{dish.name}</h3>
                            <span className="font-bold text-orange-600 dark:text-blue-400 whitespace-nowrap ml-2">
                              {dish.discount_price ? (
                                <>
                                  <span className="text-red-500">{Number(dish.discount_price || 0).toFixed(0)} FCFA</span>
                                  <span className="text-gray-400 dark:text-gray-500 text-sm line-through ml-1">
                                    {Number(dish.price || 0).toFixed(0)} FCFA
                                  </span>
                                </>
                              ) : (
                                `${Number(dish.price || 0).toFixed(0)} FCFA`
                              )}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-500 dark:text-gray-300 mb-4 line-clamp-2">
                            {dish.description || `Délicieux plat de chez ${dish.vendor.name}`}
                          </p>
                          
                          <div className="flex justify-between items-center">
                            <div whileHover={{ x: 5 }}>
                              <Button 
                                onClick={() => {
                                  if (dish.vendor && dish.vendor.id) {
                                    navigate(`/vendeurs/${dish.vendor.id}`)
                                  } else {
                                    // Si pas de vendeur, aller vers la page des plats
                                    navigate('/plats')
                                  }
                                }}
                                variant="outline" 
                                size="sm" 
                                className="text-sm group px-3"
                              >
                                Voir détails
                                <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                              </Button>
                            </div>
                            
                            <div 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                size="sm" 
                                className={`text-sm px-4 ${
                                  isInCart(dish.id) 
                                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                                onClick={() => addToCart(dish)}
                              >
                                <ShoppingBag className="h-4 w-4 mr-1.5" />
                                {isInCart(dish.id) ? 'Ajouté' : 'Ajouter'}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Badge de livraison */}
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                            <span className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400">
                              <Truck className="h-3.5 w-3.5 mr-1" />
                              {dish.vendor?.delivery_time ? 
                                `${dish.vendor.delivery_time} min` : 
                                'Livraison disponible'
                              }
                              {dish.vendor?.delivery_fee && (
                                <span className="ml-1 text-emerald-600 dark:text-emerald-400">
                                  • {Number(dish.vendor.delivery_fee).toFixed(0)} FCFA
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Flèche de navigation droite pour mobile */}
                <div className="md:hidden absolute inset-y-0 right-0 flex items-center z-10">
                  <button 
                    aria-label="Suivant"
                    className="bg-white/80 dark:bg-slate-800/80 p-2 rounded-full shadow-lg -mr-2"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section CTA */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
        {/* Effets de fond décoratifs */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              }
            >
              Prêt à vous régaler ?
            </motion.h2>
            
            <motion.p 
              className="text-xl text-blue-100 max-w-3xl mx-auto mb-10"
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              }
            >
              Commandez vos plats préférés en quelques clics et profitez d'une expérience culinaire exceptionnelle directement chez vous.
            </motion.p>
            
            <div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              }
            >
              <motion.button
                onClick={() => navigate('/plats')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap rounded-md px-8 py-3"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Commander maintenant
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto border-2 border-white/50 bg-transparent text-white hover:bg-white/10 text-lg font-semibold hover:border-white transition-all duration-300 inline-flex items-center justify-center whitespace-nowrap rounded-md px-8 py-3"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Voir la démo
              </motion.button>
            </div>
            
            <div 
              className="mt-12 flex flex-wrap justify-center gap-6"
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              }
            >
              {[
                { icon: <ShieldCheck className="h-6 w-6 text-emerald-400" />, text: 'Paiement sécurisé' },
                { icon: <Clock className="h-6 w-6 text-orange-400" />, text: 'Livraison rapide' },
                { icon: <Heart className="h-6 w-6 text-pink-400" />, text: '100% satisfait' },
                { icon: <Star className="h-6 w-6 text-orange-400" />, text: '+10 000 avis' },
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-2 text-blue-100"
                  whileHover={{ y: -3 }}
                  }
                >
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Témoignages flottants */}
          <div className="hidden lg:block">
            {[
              { id: 1, text: 'Excellent service !', top: '20%', left: '10%', rotate: -5 },
              { id: 2, text: 'Délicieux !', top: '30%', right: '15%', rotate: 3 },
              { id: 3, text: 'Livraison rapide', bottom: '25%', left: '15%', rotate: -2 },
              { id: 4, text: 'Je recommande', bottom: '15%', right: '10%', rotate: 4 },
            ].map((testimonial) => (
              <div
                key={testimonial.id}
                className={`absolute bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg`}
                style={{
                  top: testimonial.top,
                  left: testimonial.left,
                  right: testimonial.right,
                  bottom: testimonial.bottom,
                  rotate: `${testimonial.rotate}deg`
                }}
                }
                whileInView={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: { 
                    delay: 0.1 * testimonial.id,
                    type: 'spring',
                    stiffness: 300,
                    damping: 10
                  }
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 0,
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }}
              >
                {testimonial.text} {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="inline-block h-3 w-3 text-orange-400 fill-current ml-0.5" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

