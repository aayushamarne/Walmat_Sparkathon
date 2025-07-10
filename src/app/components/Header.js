'use client';
import React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';


const Header = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

const router=useRouter();

const handleSearch = (e) => {
  if (e.key === "Enter" && searchTerm.trim()) {
    router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
  }
};

const { cartCount } = useCart();
  return (
    <header className="bg-blue-600 text-white w-full">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left Section: Logo and Location */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">Walmart</span>
              <span className="material-symbols-outlined text-yellow-400">star</span>
            </div>

            {/* Location Box */}
            <div className="hidden md:flex items-center bg-blue-700 px-4 py-2 rounded-full space-x-2 hover:bg-blue-800 transition-colors cursor-pointer max-w-[260px] overflow-hidden">
              <span className="material-symbols-outlined text-yellow-400">location_on</span>
              <div className="flex flex-col leading-tight text-sm whitespace-nowrap overflow-hidden">
                <span className="font-semibold">Pickup or delivery?</span>
                <span className="text-white text-xs truncate"></span>
              </div>
              
            </div>
          </div>

          {/* Middle: Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
            <input
  type="text"
  placeholder="Search everything at Walmart online and in store"
  className="w-full px-4 py-2 rounded-full text-gray-800 pr-12 bg-white"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={handleSearch}
/>
              <button className="absolute px-2 right-2 top-1/2 transform -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-colors">
                <span className="material-symbols-outlined mt-1 text-gray-800">search</span>
              </button>
            </div>
          </div>

          {/* Right: Action Icons */}
          <div className="flex items-center space-x-4">
            <div className="flex justify-center space-x-1 hover:text-yellow-400 transition-colors">
              {user ? (
    <Link href="/account" className="flex items-center space-x-1">
      <span className="material-symbols-outlined">account_circle</span>
      <span className="hidden lg:block">Account</span>
    </Link>
  ) : (
                <Link href="/login">
                  <span className="hidden lg:block">Sign In</span>
                </Link>
              )}
            </div>
            <button className="flex items-center space-x-1 hover:text-yellow-400 transition-colors cursor-pointer"
                    
            onClick={() => router.push('/reorder')}
            >
              <span className="material-symbols-outlined">favorite</span>
              <span className="hidden lg:block">Reorder</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-yellow-400 transition-colors relative cursor-pointer" 
            
            onClick={() => router.push('/pages/addtoCart')}
>
              <span className="material-symbols-outlined">shopping_cart</span>
              {(
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
