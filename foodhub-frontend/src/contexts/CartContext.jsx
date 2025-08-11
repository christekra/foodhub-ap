import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    const savedCart = localStorage.getItem('foodhub-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
        setCartItems([]);
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem('foodhub-cart')) {
      localStorage.setItem('foodhub-cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Ajouter un plat au panier
  const addToCart = useCallback((dish, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === dish.id);
      
      if (existingItem) {
        // Si le plat existe déjà, augmenter la quantité
        const updatedItems = prevItems.map(item =>
          item.id === dish.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        toast.success(`${quantity} ${quantity > 1 ? 'portions' : 'portion'} ajoutée(s) au panier !`);
        return updatedItems;
      } else {
        // Si c'est un nouveau plat, l'ajouter
        const newItem = {
          id: dish.id,
          name: dish.name,
          price: Number(dish.price || 0),
          discount_price: dish.discount_price ? Number(dish.discount_price) : null,
          image: dish.image,
          vendor: dish.vendor,
          quantity: quantity
        };
        toast.success(`${dish.name} ajouté au panier !`);
        return [...prevItems, newItem];
      }
    });
  }, []);

  // Retirer un plat du panier
  const removeFromCart = useCallback((dishId) => {
    setCartItems(prevItems => {
      const item = prevItems.find(item => item.id === dishId);
      if (item) {
        toast.success(`${item.name} retiré du panier`);
      }
      return prevItems.filter(item => item.id !== dishId);
    });
  }, []);

  // Modifier la quantité d'un plat
  const updateQuantity = useCallback((dishId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(dishId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === dishId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [removeFromCart]);

  // Vider le panier
  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success('Panier vidé');
  }, []);

  // Calculer le total du panier
  const getTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.discount_price || item.price;
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  // Calculer le nombre total d'articles
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  // Calculer le total des réductions
  const getTotalDiscount = useCallback(() => {
    return cartItems.reduce((total, item) => {
      if (item.discount_price) {
        return total + ((item.price - item.discount_price) * item.quantity);
      }
      return total;
    }, 0);
  }, [cartItems]);

  // Obtenir un plat du panier
  const getCartItem = useCallback((dishId) => {
    return cartItems.find(item => item.id === dishId);
  }, [cartItems]);

  // Vérifier si un plat est dans le panier
  const isInCart = useCallback((dishId) => {
    return cartItems.some(item => item.id === dishId);
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalItems,
    getTotalDiscount,
    getCartItem,
    isInCart,
    isOpen,
    setIsOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 