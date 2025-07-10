"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCartKey = () => (user?.email ? `cart_${user.email}` : null);

  const enrichCartItems = async (rawCart) => {
    try {
      setIsLoading(true);
      const res = await axios.get("http://localhost:5000/api/products");
      const products = res.data?.products || [];

      const enriched = await Promise.all(
        rawCart
          .filter(item => item.productId && item.variant_id && item.quantity) // Validate rawCart
          .map(async (item) => {
            const product = products.find((p) => p._id === item.productId);
            const variant = product?.variants.find((v) => v.variant_id === item.variant_id);

            if (!product || !variant) {
              console.warn("Product or variant not found for item:", item);
              return null;
            }

            return {
              ...item,
              product: { name: product.name, brand: product.brand, _id: product._id },
              variant,
              price: variant.price || product.price?.discounted || product.price?.original || 0,
              image: variant.image || product.images?.main || "/placeholder.svg",
            };
          })
      );

      const validItems = enriched.filter(Boolean);
      console.log("Enriched cart items:", validItems);
      setCartItems(validItems);
      setCartCount(validItems.reduce((sum, item) => sum + (item.quantity || 1), 0));
    } catch (error) {
      console.error("Failed to enrich cart:", error);
      setCartItems([]);
      setCartCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const syncCart = async () => {
    try {
      const cartKey = getCartKey();
      if (!cartKey) {
        console.log("No user email, clearing cart");
        setCartItems([]);
        setCartCount(0);
        setIsLoading(false);
        return;
      }

      const rawCart = JSON.parse(localStorage.getItem(cartKey) || "[]");
      console.log("Syncing cart with key:", cartKey, "rawCart:", rawCart);
      await enrichCartItems(rawCart);
    } catch (error) {
      console.error("Error syncing cart:", error);
      setCartItems([]);
      setCartCount(0);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncCart();

    const handleCartChange = () => {
      console.log("Cart updated event received");
      syncCart();
    };
    window.addEventListener("cartUpdated", handleCartChange);
    window.addEventListener("storage", handleCartChange);

    return () => {
      window.removeEventListener("cartUpdated", handleCartChange);
      window.removeEventListener("storage", handleCartChange);
    };
  }, [user?.email]);

  // Memoize cartItems to prevent unnecessary re-renders
  const memoizedCartItems = useMemo(() => cartItems, [cartItems]);

  const updateCartCount = async () => {
    console.log("Updating cart count");
    await syncCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems: memoizedCartItems,
        isLoading,
        updateCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);