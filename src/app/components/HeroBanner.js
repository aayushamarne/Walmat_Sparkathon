import React from "react";

const HeroBanner = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
          {/* Text Content */}
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

          {/* Image */}
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
  );
};

export default HeroBanner;
