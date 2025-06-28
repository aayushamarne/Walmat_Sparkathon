"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "../../../../hooks/useAuth";

const stripePromise = loadStripe("pk_test_51OzZKjSGbk9Yd6N1HOmsT28mkka0oVK6bO3upmeOtPQ2tIkuBGVaTdyfU1jlsYwaiDnK7BMGEfBCNfMPz1BPzXAE00tT3l0rAr");
export default function CartPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState("");

  // ✅ Load Cart and Address
  useEffect(() => {
    if (!user?.user_id) return;

    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];

    const loadCartData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products");
        const allProducts = res.data?.products || [];

        const enriched = storedCart
          .map((item) => {
            const product = allProducts.find((p) => p._id === item.productId);
            const variant = product?.variants.find((v) => v.variant_id === item.variant_id);
            if (!product || !variant) return null;

            return {
              ...item,
              product,
              variant,
              image: variant.image || product.images?.main || "/placeholder.svg",
              price: product.price.discounted || product.price.original,
            };
          })
          .filter(Boolean);

        setCartItems(enriched);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };

    const fetchAddress = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/address/${user.user_id}`);
        setAddress(res.data?.address || "");
      } catch (err) {
        console.error("Failed to fetch address", err);
      }
    };

    loadCartData();
    fetchAddress();
  }, [user?.user_id]);

  // ✅ Remove item from cart
  const handleRemove = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
    localStorage.setItem(
      "cart",
      JSON.stringify(updated.map(({ productId, type, variant_id, quantity }) => ({
        productId, type, variant_id, quantity
      })))
    );
  };

  // ✅ Toggle selected items
  const toggleSelect = (variant_id) => {
    if (selectedItems.find((item) => item.variant_id === variant_id)) {
      setSelectedItems(selectedItems.filter((item) => item.variant_id !== variant_id));
    } else {
      const selectedItem = cartItems.find((item) => item.variant_id === variant_id);
      if (selectedItem) setSelectedItems([...selectedItems, selectedItem]);
    }
  };

  // ✅ Handle Stripe Checkout
  const handlePayment = async () => {
    const stripe = await stripePromise;
    const res = await axios.post("http://localhost:5000/api/checkout/create-checkout-session", {
      items: selectedItems,
      user,
    });
  localStorage.setItem("reorder", JSON.stringify(selectedItems));
    // Save paid variant_ids temporarily
    const paidVariantIds = selectedItems.map(i => i.variant_id);
    localStorage.setItem("paidItems", JSON.stringify(paidVariantIds));

    await stripe.redirectToCheckout({ sessionId: res.data.id });
  };

  // ✅ Handle payment success from URL
  useEffect(() => {
    const success = searchParams.get("paymentSuccess");
    if (success === "true") {
      const paidIds = JSON.parse(localStorage.getItem("paidItems") || "[]");

      const updatedCart = cartItems.filter(item => !paidIds.includes(item.variant_id));

      // Update state and localStorage
      setCartItems(updatedCart);
      setSelectedItems([]);

      localStorage.setItem("cart", JSON.stringify(
        updatedCart.map(({ productId, type, variant_id, quantity }) => ({
          productId, type, variant_id, quantity
        }))
      ));

      localStorage.removeItem("paidItems");
    }
  }, [searchParams]);

  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // ✅ Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Required</h2>
          <p className="text-gray-600 mb-6">Please login to view and manage your shopping cart.</p>
          <button 
            onClick={() => router.push("/login")} 
            className="w-full bg-gradibent-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>

        {/* Cart Content */}
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Start shopping to add items to your cart</p>
            <button 
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items ({cartItems.length})</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => {
                    const isSelected = selectedItems.some((i) => i.variant_id === item.variant_id);
                    return (
                      <div key={index} className={`p-6 transition-all duration-200 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-start space-x-4">
                          {/* Checkbox */}
                          <div className="flex items-center h-20">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(item.variant_id)}
                              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </div>

                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                              <Image
                                src={item.image}
                                alt={item.product.name}
                                width={80}
                                height={80}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.product.name}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                              <span className="bg-gray-100 px-2 py-1 rounded-md">Brand: {item.product.brand}</span>
                              <span className="bg-gray-100 px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                              <span className="bg-gray-100 px-2 py-1 rounded-md">₹{item.price} each</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-xl font-bold text-blue-600">₹{(item.price * item.quantity).toLocaleString()}</div>
                              <button 
                                onClick={() => handleRemove(index)} 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors duration-200 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg sticky top-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900">Order Summary</h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Selected Items</span>
                    <span className="font-semibold text-gray-900">{selectedItems.length}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-900">Subtotal</span>
                      <span className="text-2xl font-bold text-gray-900">₹{subtotal.toLocaleString()}</span>
                    </div>
                    
                    <button
                      disabled={selectedItems.length === 0}
                      onClick={handlePayment}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
                        selectedItems.length === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {selectedItems.length === 0 ? 'Select Items to Pay' : 'Proceed to Payment'}
                    </button>
                    
                    {selectedItems.length > 0 && (
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Secure checkout powered by Stripe
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}