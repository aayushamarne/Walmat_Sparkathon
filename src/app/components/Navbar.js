"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const dropdownData = {
  Clothing: [
    "All Clothing",
    "New Arrivals",
    "Women",
    "Men",
    "Tween",
    "Kids",
    "Toddler",
    "Baby",
  ],
  Electronics: [
    "All Electronics",
    "TVs & Video",
    "Computers",
    "Tablets",
    "Cameras",
    "Cell Phones",
    "Audio",
    "Wearables",
    "Smart Home",
  ],
};

const Navbar = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  // Convert text to route-friendly path (kebab-case)
  const toPath = (str) =>
    str.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");

  const router = useRouter();
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-8 py-3 relative">
          {/* All Departments Dropdown */}
          <details className="relative group">
            <summary className="flex items-center space-x-2 cursor-pointer hover:text-blue-600 transition-colors list-none">
              <span className="material-symbols-outlined">menu</span>
              <span>All Departments</span>
              <span className="material-symbols-outlined">keyboard_arrow_down</span>
            </summary>

            <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-[700px] z-30 mt-2 p-4 grid grid-cols-2 gap-8">
              {/* Left: Main Categories */}
              <div className="space-y-2 w-64">
                {[
                  "Clothing",
                  "Electronics",
                  "Grocery",
                  "Home & Garden",
                  "Toys & Games",
                  "Health & Beauty",
                  "Sports & Outdoor",
                  "Baby and Kids",
                  "Pet Supplies",
                  "Office & School",
                  "Books & Media",
                ].map((item) => (
                  <div
                    key={item}
                    onMouseEnter={() =>
                      item === "Clothing" || item === "Electronics"
                        ? setActiveCategory(item)
                        : setActiveCategory(null)
                    }
                    className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 ${
                      activeCategory === item ? "bg-gray-100 font-semibold" : ""
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Right: Submenu if applicable */}
              <div>
                {activeCategory && dropdownData[activeCategory] && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">
                      {activeCategory}
                    </h4>
                    {dropdownData[activeCategory].map((subItem) => (
  <div
    key={subItem}
    onClick={() => {
      const main = activeCategory.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
      const sub = subItem.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");

     router.push(`/pages/${main}/${sub}`);

    }}
    className="block px-3 py-1 rounded hover:bg-gray-100 transition cursor-pointer"
  >
    {subItem}
  </div>
))}

                  </div>
                )}
              </div>
            </div>
          </details>

          {/* Horizontal Links */}
          <div className="hidden md:flex space-x-6">
            {[
              "Get It Fast",
              "New Arrivals",
              "Trending",
              "Back To School",
              "My Items",
              "Only At Walmart",
            ].map((category) => (
              <a
                key={category}
                href="#"
                className="hover:text-blue-600 transition-colors"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
