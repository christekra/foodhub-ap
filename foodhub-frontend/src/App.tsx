import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { CustomCursor } from './components/ui/CustomCursor'
import HomePage from './pages/HomePage'
import AllDishesPage from './pages/AllDishesPage'
import VendorsPage from './pages/VendorsPage'
import VendorProfilePage from './pages/VendorProfilePage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderTrackingPage from './pages/OrderTrackingPage'
import TestOrderSystem from './components/TestOrderSystem'
import TestCartContext from './components/TestCartContext'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import VendorDashboardPage from './pages/VendorDashboardPage'
import VendorAddDishPage from './pages/VendorAddDishPage'
import VendorEditDishPage from './pages/VendorEditDishPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import HelpPage from './pages/HelpPage'
import ChatPage from './pages/ChatPage'
import ChatSystem from './components/ChatSystem'


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ThemeProvider defaultTheme="system" enableSystem>
            <CustomCursor />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow pt-16">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/plats" element={<AllDishesPage />} />
                  <Route path="/restaurants" element={<VendorsPage />} />
                  <Route path="/vendeurs" element={<VendorsPage />} />
                  <Route path="/vendeurs/:id" element={<VendorProfilePage />} />
                  <Route path="/panier" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/commandes" element={<OrderHistoryPage />} />
                  <Route path="/commandes/:id" element={<OrderTrackingPage />} />
                  <Route path="/test-orders" element={<TestOrderSystem />} />
                  <Route path="/test-cart" element={<TestCartContext />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
                  <Route path="/vendor/dishes/new" element={<VendorAddDishPage />} />
                  <Route path="/vendor/dishes/:id/edit" element={<VendorEditDishPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  
                  {/* Nouvelles pages */}
                  <Route path="/a-propos" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/aide" element={<HelpPage />} />
                  <Route path="/support" element={<HelpPage />} />
                  <Route path="/chat" element={<ChatPage />} />

                  {/* Ajoutez d'autres routes ici */}
                  <Route path="*" element={<div>404 - Page non trouvée</div>} />
                </Routes>
              </main>
              <Footer />
            </div>
            <ChatSystem />
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
