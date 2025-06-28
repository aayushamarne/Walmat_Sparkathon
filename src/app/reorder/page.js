'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe("pk_test_51OzZKjSGbk9Yd6N1HOmsT28mkka0oVK6bO3upmeOtPQ2tIkuBGVaTdyfU1jlsYwaiDnK7BMGEfBCNfMPz1BPzXAE00tT3l0rAr");

export default function ReorderPage() {
  const [reorderItems, setReorderItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    const fetchReorderData = async () => {
      try {
        const rawReorder = JSON.parse(localStorage.getItem('reorder') || '[]');
        if (rawReorder.length === 0) return;

        const res = await axios.get('http://localhost:5000/api/products');
        const products = res.data?.products || [];

        const enriched = rawReorder.map((orderItem) => {
          const product = products.find((p) => p._id === orderItem.productId);
          if (!product) return null;

          const variant = product.variants.find((v) => v.variant_id === orderItem.variant_id);
          if (!variant) return null;

          return {
            ...orderItem,
            product,
            variant,
            image: variant.image || product.images?.main || '/placeholder.svg',
            price: product.price.discounted || product.price.original,
          };
        }).filter(Boolean);

        setReorderItems(enriched);
      } catch (err) {
        console.error('Failed to load reorder items:', err);
      }
    };

    fetchReorderData();
  }, []);

  const toggleSelect = (variant_id) => {
    if (selectedItems.find((item) => item.variant_id === variant_id)) {
      setSelectedItems(selectedItems.filter((item) => item.variant_id !== variant_id));
    } else {
      const selectedItem = reorderItems.find((item) => item.variant_id === variant_id);
      if (selectedItem) {
        setSelectedItems([...selectedItems, selectedItem]);
      }
    }
  };

  const handleRemove = (variant_id) => {
    const updated = reorderItems.filter((item) => item.variant_id !== variant_id);
    setReorderItems(updated);

    // Also remove from selected items if selected
    setSelectedItems(selectedItems.filter((item) => item.variant_id !== variant_id));

    // Update localStorage
    localStorage.setItem('reorder', JSON.stringify(
      updated.map(({ productId, type, variant_id, quantity }) => ({
        productId, type, variant_id, quantity
      }))
    ));
  };

  const handlePayment = async () => {
    const stripe = await stripePromise;
    const res = await axios.post("http://localhost:5000/api/checkout/create-checkout-session", {
      items: selectedItems,
      user: {}, // Add user if needed
    });

    const paidIds = selectedItems.map(item => item.variant_id);
    localStorage.setItem('paidReorders', JSON.stringify(paidIds));

    await stripe.redirectToCheckout({ sessionId: res.data.id });
  };

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const success = urlParams.get("paymentSuccess");

  if (success === "true") {
    const paidIds = JSON.parse(localStorage.getItem("paidReorders") || "[]");
    const prevReorder = JSON.parse(localStorage.getItem("reorder") || "[]");

    // Filter out duplicates
    const combined = [...prevReorder, ...paidIds.map(id => {
      const match = reorderItems.find(item => item.variant_id === id);
      return match
        ? {
            productId: match.productId,
            variant_id: match.variant_id,
            quantity: match.quantity,
            type: match.type
          }
        : null;
    })].filter(Boolean);

    // ✅ Deduplicate by variant_id
    const unique = Array.from(new Map(combined.map(item => [item.variant_id, item])).values());

    // Save back
    localStorage.setItem("reorder", JSON.stringify(unique));
    localStorage.removeItem("paidReorders");

    // Update UI too
    setReorderItems(unique);
  }
}, []);


  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reorder Items</h1>

      {reorderItems.length === 0 ? (
        <p>No previously ordered items.</p>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {reorderItems.map((item, i) => {
              const isSelected = selectedItems.find(sel => sel.variant_id === item.variant_id);
              return (
                <div key={i} className="flex items-center gap-4 bg-white p-4 shadow rounded">
                  <input
                    type="checkbox"
                    checked={!!isSelected}
                    onChange={() => toggleSelect(item.variant_id)}
                  />
                  <Image
                    src={item.image}
                    alt={item.product?.name || "Product"}
                    width={100}
                    height={100}
                    className="rounded object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">{item.product?.name || "Unnamed Product"}</h2>
                    <p className="text-sm">Qty: {item.quantity}</p>
                    <p className="text-sm">₹{item.price} each</p>
                    {item.variant?.size && <p className="text-sm">Size: {item.variant.size}</p>}
                    {item.variant?.color && <p className="text-sm">Color: {item.variant.color}</p>}
                  </div>
                  <button
                    onClick={() => handleRemove(item.variant_id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary & Pay */}
          <div className="bg-white p-6 shadow rounded border max-w-md">
            <h3 className="text-xl font-semibold mb-2">Payment Summary</h3>
            <p>Items Selected: {selectedItems.length}</p>
            <p className="text-lg font-bold">Subtotal: ₹{subtotal}</p>
            <button
              disabled={selectedItems.length === 0}
              onClick={handlePayment}
              className="mt-4 w-full bg-yellow-500 text-black py-2 rounded hover:bg-yellow-600 disabled:opacity-50"
            >
              Pay for Selected
            </button>
          </div>
        </>
      )}
    </div>
  );
}
