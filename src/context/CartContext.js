// context/CartContext.js
'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const enrichCartItems = async (rawCart) => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/products");
      const products = res.data?.products || [];
      
      const enriched = await Promise.all(
        rawCart.map(async (item) => {
          const product = products.find(p => p._id === item.productId);
          const variant = product?.variants.find(v => v.variant_id === item.variant_id);
          
          return {
            ...item,
            product: product || { name: 'Product', brand: 'Brand' },
            variant: variant || null,
            price: variant?.price || product?.price?.discounted || product?.price?.original || 0,
            image: variant?.image || product?.images?.main || '/placeholder.svg'
          };
        })
      );
      
      setCartItems(enriched.filter(Boolean));
    } catch (error) {
      console.error('Failed to enrich cart:', error);
      setCartItems(rawCart); // Fallback to raw items
    } finally {
      setIsLoading(false);
    }
  };

  const syncCart = async () => {
    const rawCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(rawCart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    await enrichCartItems(rawCart);
  };

  useEffect(() => {
    syncCart();

    const handleCartChange = () => {
      syncCart();
    };

    window.addEventListener('cartUpdated', handleCartChange);
    window.addEventListener('storage', handleCartChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartChange);
      window.removeEventListener('storage', handleCartChange);
    };
  }, []);

  const updateCartCount = () => {
    syncCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <CartContext.Provider value={{ 
      cartCount, 
      cartItems,
      isLoading,
      updateCartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);