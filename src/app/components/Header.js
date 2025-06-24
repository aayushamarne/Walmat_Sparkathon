// components/Header.jsx
import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo and Links */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">Walmart</span>
              <span className="material-symbols-outlined text-yellow-400">star</span>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Departments
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                Services
              </a>
            </nav>
          </div>

          {/* Middle: Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search everything at Walmart online and in store"
                className="w-full px-4 py-2 rounded-full text-gray-800 pr-12 bg-white"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 p-2 rounded-full transition-colors">
                <span className="material-symbols-outlined text-gray-800">search</span>
              </button>
            </div>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 hover:text-yellow-400 transition-colors">
              <span className="material-symbols-outlined">account_circle</span>
              <span className="hidden lg:block">Sign In</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-yellow-400 transition-colors">
              <span className="material-symbols-outlined">favorite</span>
              <span className="hidden lg:block">Reorder</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-yellow-400 transition-colors relative">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-gray-800 rounded-full w-5 h-5 text-xs flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
