'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  // ✅ Function to update count from localStorage
  const syncCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = storedCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
    setCartCount(count);
  };

  // ✅ Listen to 'cartUpdated' event OR storage changes
  useEffect(() => {
    syncCartCount();

    const handleCartChange = () => {
      syncCartCount();
    };

    window.addEventListener('cartUpdated', handleCartChange);
    window.addEventListener('storage', handleCartChange); // handles cross-tab

    return () => {
      window.removeEventListener('cartUpdated', handleCartChange);
      window.removeEventListener('storage', handleCartChange);
    };
  }, []);


  const updateCartCount = () => {
    syncCartCount();
  
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
