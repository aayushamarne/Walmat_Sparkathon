"use client";
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-8 py-3">
          {/* All Departments Dropdown */}
          <details className="relative">
            <summary className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors list-none">
              <span className="material-symbols-outlined">menu</span>
              <span>All Departments</span>
              <span className="material-symbols-outlined">keyboard_arrow_down</span>
            </summary>
            <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-64 z-20 mt-2">
              <div className="p-4 space-y-2">
                {[
                  "Grocery & Essentials",
                  "Electronics",
                  "Home & Garden",
                  "Clothing",
                  "Toys & Games",
                ].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block py-2 px-3 hover:bg-gray-100 rounded transition-colors"
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </details>

          {/* Horizontal Links */}
          <div className="hidden md:flex space-x-6">
            {["Grocery", "Electronics", "Home", "Fashion", "Auto", "Pharmacy"].map(
              (category) => (
                <a
                  key={category}
                  href={category}
                  className="hover:text-blue-600 transition-colors"
                >
                  {category}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
