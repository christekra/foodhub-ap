import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

const currentYear = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <motion.div
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center"
              >
                <span className="text-white text-sm font-bold">🍽️</span>
              </motion.div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
                  FoodHub CI
                </h3>
                <p className="text-xs text-gray-400">🇨🇮 Livraison rapide</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              La plateforme de commande de plats en gros préférée de Côte d'Ivoire.
              Découvrez les meilleurs vendeurs et dégustez des plats délicieux.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/a-propos" className="text-gray-400 hover:text-white transition-colors">
                  À propos de nous
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="text-gray-400 hover:text-white transition-colors">
                  Nos vendeurs
                </Link>
              </li>
              <li>
                <Link to="/aide" className="text-gray-400 hover:text-white transition-colors">
                  Centre d'aide
                </Link>
              </li>
              <li>
                <Link to="/become-seller" className="text-gray-400 hover:text-white transition-colors">
                  Devenir vendeur
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contactez-nous
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-orange-400 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-gray-400">
                  Cocody, Abidjan<br />
                  Côte d'Ivoire
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 text-orange-400 mr-3" />
                <a href="tel:+2250700000000" className="text-gray-400 hover:text-white transition-colors">
                  +225 07 00 00 00 00
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 text-orange-400 mr-3" />
                <a href="mailto:contact@foodhub.ci" className="text-gray-400 hover:text-white transition-colors">
                  contact@foodhub.ci
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">
              Abonnez-vous à notre newsletter pour recevoir les dernières actualités et offres spéciales.
            </p>
            <form className="flex">
              <input
                type="email"
                placeholder="Votre email"
                className="px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 w-full"
                required
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-r-md transition-colors"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} FoodHub CI. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Conditions d'utilisation
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
