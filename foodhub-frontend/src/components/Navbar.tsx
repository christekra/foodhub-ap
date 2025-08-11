import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingCart, User, LogIn, LogOut, UserPlus, Camera, Home, Utensils, Store, Info, Heart, Bell, Settings, HelpCircle, Phone } from "lucide-react"
import { ThemeToggle } from "./theme"
import { useAuth } from "../contexts/AuthContext"
import { useCart } from "../contexts/CartContext"
import React from "react" // Added missing import for React

// Types pour le composant Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  children?: React.ReactNode
}

// Composant Button simple pour éviter les problèmes d'import
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", children, ...props }, ref) => {
         const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
         const variantClasses = {
       default: "bg-orange-600 text-white hover:bg-orange-700",
       destructive: "bg-red-600 text-white hover:bg-red-700",
       outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700",
       secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
       ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
       link: "text-orange-600 underline-offset-4 hover:underline dark:text-orange-400",
     }
    
    const sizeClasses = {
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

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getTotalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)



  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm' 
          : 'bg-white dark:bg-slate-900'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo animé FoodHub */}
          <Link to="/" className="flex items-center space-x-3 group">
            {/* Icône animée */}
            <motion.div
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative"
            >
                             <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
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
                  className="text-white text-xl font-bold"
                >
                  🍽️
                </motion.span>
              </div>
              {/* Effet de brillance */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-xl"
                animate={{
                  x: [-20, 20, -20]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
            
            {/* Texte du logo */}
            <div className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-1"
              >
                <motion.span
                                     className="text-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Food
                </motion.span>
                <motion.span
                  className="text-2xl font-bold text-gray-800 dark:text-white"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  Hub
                </motion.span>
              </motion.div>
              
              {/* Badge CI animé */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center space-x-1"
              >
                <motion.span
                                     className="text-xs font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-0.5 rounded-full shadow-sm"
                  whileHover={{ scale: 1.1, y: -1 }}
                  animate={{
                    boxShadow: [
                      "0 2px 4px rgba(249, 115, 22, 0.3)",
                      "0 4px 8px rgba(22, 163, 74, 0.4)",
                      "0 2px 4px rgba(249, 115, 22, 0.3)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🇨🇮 CI
                </motion.span>
                <motion.span
                  className="text-xs text-gray-500 dark:text-gray-400 font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  • Livraison rapide
                </motion.span>
              </motion.div>
            </div>
          </Link>

          {/* Desktop Navigation */}
                     <nav className="hidden md:flex items-center space-x-8">
             <Link to="/" className="text-sm font-medium text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center space-x-1">
               <Home className="w-4 h-4" />
               <span>Accueil</span>
             </Link>
             <Link to="/plats" className="text-sm font-medium text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center space-x-1">
               <Utensils className="w-4 h-4" />
               <span>Tous les plats</span>
             </Link>
             <Link to="/vendeurs" className="text-sm font-medium text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center space-x-1">
               <Store className="w-4 h-4" />
               <span>Restaurants</span>
             </Link>
             <Link to="/a-propos" className="text-sm font-medium text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center space-x-1">
               <Info className="w-4 h-4" />
               <span>À propos</span>
             </Link>
             <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center space-x-1">
               <Phone className="w-4 h-4" />
               <span>Contact</span>
             </Link>
             <Link to="/aide" className="text-sm font-medium text-gray-700 hover:text-orange-500 dark:text-gray-300 dark:hover:text-white transition-colors flex items-center space-x-1">
               <HelpCircle className="w-4 h-4" />
               <span>Aide</span>
             </Link>
           </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/panier">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>
            
            <ThemeToggle />
            
            {isAuthenticated ? (
              <div className="relative group">
                <Button variant="outline" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user?.name || 'Mon compte'}</span>
                </Button>
                                 <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 py-1 z-50 hidden group-hover:block">
                   {/* En-tête du menu */}
                   <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                     <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'Utilisateur'}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                   </div>
                   
                   {/* Liens principaux */}
                   <div className="py-1">
                     {user?.is_admin ? (
                       <Link
                         to="/admin/dashboard"
                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-slate-700"
                       >
                         <Settings className="h-4 w-4 mr-3" />
                         Tableau de bord Admin
                       </Link>
                     ) : user?.account_type === 'vendor' ? (
                       <Link
                         to="/vendor/dashboard"
                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-slate-700"
                       >
                         <Store className="h-4 w-4 mr-3" />
                         Tableau de bord
                       </Link>
                     ) : (
                       <Link
                         to="/profile"
                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-slate-700"
                       >
                         <User className="h-4 w-4 mr-3" />
                         Mon profil
                       </Link>
                     )}
                     
                     <Link 
                       to="/commandes" 
                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-slate-700"
                     >
                       <ShoppingCart className="h-4 w-4 mr-3" />
                       Mes commandes
                     </Link>
                     
                     <Link 
                       to="/favoris" 
                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-slate-700"
                     >
                       <Heart className="h-4 w-4 mr-3" />
                       Mes favoris
                     </Link>
                     
                     <Link 
                       to="/notifications" 
                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-slate-700"
                     >
                       <Bell className="h-4 w-4 mr-3" />
                       Notifications
                     </Link>
                   </div>
                   
                   {/* Séparateur */}
                   <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                   
                   {/* Liens secondaires */}
                   <div className="py-1">
                     <Link 
                       to="/aide" 
                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-slate-700"
                     >
                       <HelpCircle className="h-4 w-4 mr-3" />
                       Aide & Support
                     </Link>
                     
                     <Link 
                       to="/contact" 
                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-slate-700"
                     >
                       <Phone className="h-4 w-4 mr-3" />
                       Nous contacter
                     </Link>
                   </div>
                   
                   {/* Séparateur */}
                   <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                   
                   {/* Déconnexion */}
                   <div className="py-1">
                     <button 
                       onClick={handleLogout}
                       className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                     >
                       <LogOut className="h-4 w-4 mr-3" />
                       Déconnexion
                     </button>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Connexion</span>
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    <UserPlus className="h-4 w-4 mr-2" />
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */} 
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/panier">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">
                    {getTotalItems()}
                  </span>
                )}
              </Button>
            </Link>
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden bg-white dark:bg-slate-900 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/plats"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Tous les plats
              </Link>
              <Link
                to="/vendeurs"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Restaurants
              </Link>
              <Link
                to="/a-propos"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <Link
                to="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/aide"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                onClick={() => setIsMenuOpen(false)}
              >
                Aide
              </Link>

              <div className="pt-4 pb-3 border-t border-gray-200 dark:border-slate-700 mt-4">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    {user?.is_admin ? (
                      <Link
                        to="/admin/dashboard"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tableau de bord Admin
                      </Link>
                    ) : user?.account_type === 'vendor' ? (
                      <Link
                        to="/vendor/dashboard"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tableau de bord
                      </Link>
                    ) : (
                      <Link
                        to="/profile"
                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Mon profil
                      </Link>
                    )}
                    <Link
                      to="/commandes"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mes commandes
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-slate-800"
                    >
                      Déconnexion
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Connexion
                    </Link>
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-orange-700 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:text-white dark:hover:bg-orange-800"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
