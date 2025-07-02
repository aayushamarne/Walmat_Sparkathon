"use client";
import React from "react";
import Image from "next/image";

const HeroBanner = ({ searchResults = [] }) => {
  return (
    <>
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Save Money. Live Better.
              </h1>
              <p className="text-xl mb-6 opacity-90">
                Shop millions of items at low prices every day
              </p>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 px-8 py-3 rounded-full font-semibold transition-colors transform hover:scale-105">
                Shop Now
              </button>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop"
                alt="Shopping cart with groceries"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
              Search Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg"
                >
                  <Image
                    src={product.images?.main || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="w-full h-60 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm">{product.brand}</p>
                    <p className="text-blue-600 font-bold mt-2">
                      ₹{product.price?.discounted || product.price?.original}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HeroBanner;
