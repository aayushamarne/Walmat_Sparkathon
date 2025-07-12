"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const stripePromise = loadStripe("pk_test_51OzZKjSGbk9Yd6N1HOmsT28mkka0oVK6bO3upmeOtPQ2tIkuBGVaTdyfU1jlsYwaiDnK7BMGEfBCNfMPz1BPzXAE00tT3l0rAr");

export default function SplitItemsModal({ friends = [], currentUser = {}, onSubmit }) {
  const { cartItems, isLoading, updateCartCount } = useCart();
  const allPeople = useMemo(() => [currentUser, ...friends].filter(person => person.email && person.user_id), [currentUser, friends]);
  const [assignments, setAssignments] = useState({});
  const [splitConfirmed, setSplitConfirmed] = useState(false);
  const [userTotals, setUserTotals] = useState({});
  const [currentUserSplitItems, setCurrentUserSplitItems] = useState([]);
  const [error, setError] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);

  // Validate currentUser
  useEffect(() => {
    if (!currentUser.email || !currentUser.user_id) {
      setError("Please log in to share your cart.");
      console.error("Invalid currentUser at", new Date().toISOString(), ":", currentUser);
    }
  }, [currentUser]);

  // Initialize assignments
  useEffect(() => {
    if (cartItems.length && allPeople.length && !error) {
      console.log("Initializing assignments at", new Date().toISOString(), "with cartItems:", cartItems, "allPeople:", allPeople);
      setAssignments(prev => {
        const newAssignments = {};
        cartItems.forEach(item => {
          if (!item.variant_id || !item.product?._id) {
            console.warn("Invalid item at", new Date().toISOString(), "missing variant_id or product._id:", item);
            return;
          }
          newAssignments[item.variant_id] = {};
          allPeople.forEach(person => {
            newAssignments[item.variant_id][person.email] =
              prev[item.variant_id]?.[person.email] ?? (person.email === currentUser.email);
          });
        });
        if (JSON.stringify(newAssignments) !== JSON.stringify(prev)) {
          console.log("Updating assignments at", new Date().toISOString(), ":", newAssignments);
          return newAssignments;
        }
        return prev;
      });
    }
  }, [cartItems, currentUser.email, allPeople, error]);

  // Handle toggling item assignment
  const handleToggleAssignment = (itemId, personEmail) => {
    console.log("Toggling assignment at", new Date().toISOString(), "for item:", itemId, "person:", personEmail);
    setAssignments(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [personEmail]: !prev[itemId]?.[personEmail],
      },
    }));
  };

  // Calculate total for a user
  const calculateTotal = (email) => {
    const total = cartItems.reduce((sum, item) => {
      const assigned = assignments[item.variant_id]?.[email];
      const sharedWith = Object.values(assignments[item.variant_id] || {}).filter(Boolean).length;
      if (assigned && sharedWith > 0) {
        return sum + (item.price * item.quantity) / sharedWith;
      }
      return sum;
    }, 0);
    return total.toFixed(2);
  };

  // Handle split confirmation
  const handleSubmit = async () => {
    setIsSplitting(true);
    setError(null);
    console.log("Submitting split at", new Date().toISOString(), "with assignments:", assignments);

    const unassignedItems = cartItems.filter(item => 
      !item.variant_id || !Object.values(assignments[item.variant_id] || {}).some(Boolean)
    );
    if (unassignedItems.length) {
      setError(`Some items are unallocated. Please assign all items in your shopping basket.`);
      console.warn("Unassigned items at", new Date().toISOString(), ":", unassignedItems);
      setIsSplitting(false);
      return;
    }

    try {
      const result = {};
      const totals = {};

      allPeople.forEach(person => {
        const items = cartItems
          .filter(item => assignments[item.variant_id]?.[person.email])
          .map(item => ({
            productId: item.product?._id || item.productId,
            type: item.type || "default",
            variant_id: item.variant_id,
            quantity: item.quantity,
            price: item.price,
            name: item.product?.name || "Unknown Product",
            image: item.image || "/placeholder.svg",
          }));
        result[person.email] = items;
        totals[person.email] = calculateTotal(person.email);
      });

      console.log("Split result at", new Date().toISOString(), ":", result, "Totals:", totals);
      setUserTotals(totals);
      setCurrentUserSplitItems(result[currentUser.email] || []);

      const userKey = `cart_${currentUser.email}`;
      localStorage.setItem(userKey, JSON.stringify(result[currentUser.email] || []));
      localStorage.setItem("carts", JSON.stringify({
        ...JSON.parse(localStorage.getItem("carts") || "{}"),
        [currentUser.user_id]: result[currentUser.email]
      }));

      await updateCartCount();
      console.log("Cart updated at", new Date().toISOString(), ", dispatching cartUpdated event");
      window.dispatchEvent(new Event("cartUpdated"));

      setSplitConfirmed(true);
      alert("✅ Your shopping basket has been successfully divided among friends!");
      if (typeof onSubmit === "function") onSubmit();
    } catch (error) {
      setError("Failed to divide cart at " + new Date().toISOString() + ": " + error.message);
      console.error("Split error at", new Date().toISOString(), ":", error);
    } finally {
      setIsSplitting(false);
    }
  };

  // Handle Stripe payment
  // ... (previous imports and component setup remain unchanged)

const handleStripePayment = async () => {
  if (!currentUser.email || !currentUser.user_id) {
    setError("Please log in to proceed with checkout.");
    console.error("Invalid currentUser for payment at", new Date().toISOString(), ":", currentUser);
    return;
  }

  if (!currentUserSplitItems.length) {
    setError("No items selected for checkout. Please assign items to yourself.");
    console.warn("No items selected for payment at", new Date().toISOString(), ":", currentUserSplitItems);
    return;
  }

  const invalidItems = currentUserSplitItems.filter(
    item => !item.productId || !item.variant_id || !item.quantity || !item.price || !item.name
  );
  if (invalidItems.length) {
    setError("Some items are invalid. Please try splitting again.");
    console.warn("Invalid items for payment at", new Date().toISOString(), ":", invalidItems);
    return;
  }

  setIsPaying(true);
  setError(null);
  try {
    console.log("Initiating Stripe payment at", new Date().toISOString(), "with items:", currentUserSplitItems, "user:", currentUser);
    const stripe = await stripePromise;
    const userKey = `cart_${currentUser.email}`;
    localStorage.setItem(userKey, JSON.stringify(currentUserSplitItems));
    localStorage.setItem("reorder", JSON.stringify(currentUserSplitItems));
    localStorage.setItem("paidItems", JSON.stringify(currentUserSplitItems.map(i => i.variant_id)));

    const payload = {
      items: currentUserSplitItems.map(item => ({
        product: {
          name: item.name,
        },
        price: item.price,
        image: item.image || "https://via.placeholder.com/150",
        quantity: item.quantity,
      })),
      user: {
        user_id: currentUser.user_id,
        email: currentUser.email,
      },
    };
    console.log("Sending payload to backend at", new Date().toISOString(), ":", payload);

    const res = await axios.post("http://localhost:5000/api/checkout/create-checkout-session", payload, { // Updated URL
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    console.log("Received Stripe session at", new Date().toISOString(), ":", res.data);
    const { error: stripeError } = await stripe.redirectToCheckout({ sessionId: res.data.id });
    if (stripeError) {
      console.error("Stripe redirect error at", new Date().toISOString(), ":", stripeError);
      throw new Error(stripeError.message);
    }
  } catch (err) {
    const errorMessage = err.response?.data?.error || err.message || "Unable to process checkout. Please check your connection and try again.";
    setError(`Checkout failed at ${new Date().toISOString()}: ${errorMessage}`);
    console.error("Payment error at", new Date().toISOString(), ":", err.response?.data || err);
  } finally {
    setIsPaying(false);
  }
};

// ... (rest of the component remains unchanged)

  // Handle payment success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("paymentSuccess") === "true") {
      console.log("Payment success detected at", new Date().toISOString(), ", clearing cart");
      const userKey = `cart_${currentUser.email}`;
      localStorage.setItem(userKey, JSON.stringify([]));
      localStorage.removeItem("paidItems");
      setCurrentUserSplitItems([]);
      setSplitConfirmed(false);
      updateCartCount();
      window.dispatchEvent(new Event("cartUpdated"));
      alert("🎉 Payment successful! Your cart has been cleared.");
    }
  }, [currentUser.email, updateCartCount]);

  if (error && (!currentUser.email || !currentUser.user_id)) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Authentication Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl hover:scale-105 transition-all duration-200"
          >
            Log In
          </button>
        </div>
      </motion.div>
    );
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center"
      >
        <div className="text-center text-gray-600 text-lg">
          <svg className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your shopping basket...
        </div>
      </motion.div>
    );
  }

  if (!cartItems?.length || !allPeople.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {cartItems?.length === 0 ? "Your Shopping Basket is Empty" : "No Friends Available to Share"}
          </h2>
          <p className="text-gray-600 mb-6">
            {cartItems?.length === 0
              ? "Add some products to your cart to start sharing."
              : "Invite friends to collaborate and divide your purchase."}
          </p>
          <button
            onClick={() => window.location.href = cartItems?.length === 0 ? "/products" : "/friends"}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-xl hover:scale-105 transition-all duration-200"
          >
            {cartItems?.length === 0 ? "Browse Products" : "Invite Friends"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Share Your Shopping Basket</h1>
        <p className="text-gray-600 text-center mb-8">Divide the cost of your purchase with friends</p>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Cart Items ({cartItems.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {cartItems.map(item => (
                  <motion.div
                    key={item.variant_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-6 transition-all duration-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            width={80}
                            height={80}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-lg font-semibold text-gray-900">{item.product?.name || "Unknown Product"}</h2>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                          <span className="bg-gray-100 px-2 py-1 rounded-md">Qty: {item.quantity}</span>
                          <span className="bg-gray-100 px-2 py-1 rounded-md">₹{item.price}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">Total: ₹{(item.price * item.quantity).toLocaleString()}</p>
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 mb-2">Share with:</p>
                          <div className="flex gap-2 flex-wrap">
                            {allPeople.map(person => {
                              const selected = assignments[item.variant_id]?.[person.email];
                              const label = person.email === currentUser.email ? "You" : person.email;
                              return (
                                <button
                                  key={`${item.variant_id}-${person.email}`}
                                  onClick={() => handleToggleAssignment(item.variant_id, person.email)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                    selected
                                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                      : "bg-gray-100 text-gray-800 hover:bg-green-100"
                                  }`}
                                  aria-label={`Assign ${item.product?.name || "item"} to ${label}`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-lg sticky top-8"
            >
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Split Summary</h3>
              </div>
              <div className="p-6 space-y-4">
                {allPeople.map(person => (
                  <div key={person.email} className="flex justify-between text-sm">
                    <span className="text-gray-600">{person.email === currentUser.email ? "You" : person.email}</span>
                    <span className="font-semibold text-gray-900">₹{calculateTotal(person.email)}</span>
                  </div>
                ))}
                <hr className="my-3 border-gray-200" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{allPeople.reduce((sum, person) => sum + parseFloat(calculateTotal(person.email)), 0).toFixed(2)}</span>
                </div>
                {!splitConfirmed ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSplitting || isPaying}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
                      isSplitting || isPaying
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105 shadow-lg"
                    }`}
                    aria-label="Confirm split of cart items"
                  >
                    {isSplitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Dividing...
                      </span>
                    ) : (
                      "Confirm Split"
                    )}
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={handleStripePayment}
                      disabled={isPaying || isSplitting}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
                        isPaying || isSplitting
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white hover:scale-105 shadow-lg"
                      }`}
                      aria-label={`Proceed to checkout for ₹${userTotals[currentUser.email] || "0.00"}`}
                    >
                      {isPaying ? (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Checkout...
                        </span>
                      ) : (
                        `Checkout ₹${userTotals[currentUser.email] || "0.00"}`
                      )}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-3">
                      Secure checkout powered by Stripe
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}