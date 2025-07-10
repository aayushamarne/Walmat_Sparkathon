'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../../../src/context/CartContext';

export default function SplitItemsModal({ 
  friends = [], 
  currentUser = {}, 
  onSubmit 
}) {
  const { cartItems, isLoading } = useCart();
  const allPeople = [currentUser, ...friends];

  const [assignments, setAssignments] = useState(() => {
    const initial = {};
    cartItems.forEach(item => {
      initial[item.variant_id] = {};
      allPeople.forEach(person => {
        initial[item.variant_id][person.id] = person.id === currentUser.id;
      });
    });
    return initial;
  });

  const handleToggleAssignment = (itemId, personId) => {
    setAssignments(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [personId]: !prev[itemId]?.[personId]
      }
    }));
  };

  const calculateTotal = (userId) => {
    return cartItems
      .filter(item => assignments[item.variant_id]?.[userId])
      .reduce((sum, item) => sum + item.price, 0);
  };

  const calculateGrandTotal = () => {
    return allPeople.reduce((total, person) => total + calculateTotal(person.id), 0);
  };

  const handleSubmit = () => {
    const result = {};
    allPeople.forEach(person => {
      result[person.id] = cartItems
        .filter(item => assignments[item.variant_id]?.[person.id])
        .map(item => ({ ...item, quantity: 1 }));
    });
    onSubmit(result);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading cart items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 font-serif tracking-tight">Split Items With Friends</h1>
          <p className="text-gray-600 text-lg font-medium font-sans">Click on a friend's name to assign them a product.</p>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-3 space-y-6">
            {cartItems.map((item,index) => (
              <div
                key={`${item.variant_id}-${index}`}
                className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row gap-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Product Image */}
                <div className="w-full md:w-24 h-24 rounded-xl overflow-hidden bg-gray-50 relative group">
                  <Image
                    src={item.image}
                    alt={item.product.name}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
  
                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 font-serif">{item.product.name}</h3>
                  <p className="text-sm text-gray-500 font-sans mt-1">Brand: {item.product.brand}</p>
                  <div className="mt-2 flex gap-4 text-sm text-gray-600">
                    <span className="bg-amber-50 px-3 py-1 rounded-full font-medium text-black-600 font-sans font-bold">Qty: {item.quantity}</span>
                    <span className="bg-amber-50 px-3 py-1 rounded-full font-medium text-black-600 font-sans">₹{item.price}</span>
                  </div>
                  <div className="text-xl font-bold text-black-600 mt-2 font-serif">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
  
                  {/* Assignment Pills */}
                  <div className="mt-4">
                    <span className="text-lg font-medium text-gray-600 mb-3 block font-sans">Assign To (Click to Select):</span>
                    <div className="flex flex-wrap gap-2">
                      {allPeople.map((person) => {
                        const selected = assignments[item.variant_id]?.[person.id];
                        const label = person.id === currentUser.id
                          ? 'You'
                          : person.email.split('@')[0];
  
                        return (
                          <button
                            key={`${item.variant_id}-${person.id}`}
                            onClick={() => handleToggleAssignment(item.variant_id, person.id)}
                            className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 font-sans border
                              ${
                                selected
                                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white border-transparent shadow-md'
                                  : 'bg-gray-50 text-gray-700 hover:bg-green-100 hover:text-amber-700 border-gray-200'
                              }
                            `}
                            title="Click to assign this item"
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
  {/* Summary Card */}
  <div className="lg:col-span-1 sticky top-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:bg-green-50">
              <h3 className="text-xl font-semibold text-gray-800 mb-2 font-serif tracking-tight">Order Summary</h3>
  
              {allPeople.map(person => (
                <div key={person.id} className="flex justify-between text-gray-700 font-sans text-lg">
                  <span className="font-medium text-green-700">{person.id === currentUser.id ? 'You' : person.email.split('@')[0]}</span>
                  <span className="font-medium text-green-600 text-lg">
                    ₹{calculateTotal(person.id).toLocaleString()}
                  </span>
                </div>
              ))}
  
              <hr className="border-gray-200" />
  
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-800 font-serif">Total</span>
                <span className="text-xl font-bold text-green-600 font-serif">
                  ₹{calculateGrandTotal().toLocaleString()}
                </span>
              </div>
  
              <button
                onClick={handleSubmit}
                className="w-full mt-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-sans"
              >
                Confirm Split
              </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}
