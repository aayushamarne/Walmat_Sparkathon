"use client";
import React, { useState } from "react";
import Navbar from "@/app/components/Navbar";
import Header from "@/app/components/Header";
import Image from "next/image";

const clothingProducts = [
  {
    id: 1,
    name: "Classic Cotton T-Shirt",
    brand: "Hanes",
    price: 12.99,
    description: "A timeless and comfortable cotton t-shirt perfect for everyday wear.",
    image: "/placeholder.svg",
    details: {
      material: "100% Cotton",
      care: "Machine washable",
      origin: "Imported",
      fit: "Relaxed",
      length: "Standard length",
      closure: "Pullover style",
      sleeves: "Short sleeves"
    },
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: 2,
    name: "Women's Floral Dress",
    brand: "Time and Tru",
    price: 24.99,
    description: "A stylish floral dress suitable for summer outings and casual wear.",
    image: "/placeholder.svg",
    details: {
      material: "Soft blend fabric",
      care: "Hand wash recommended",
      origin: "Made in India",
      fit: "Slim fit",
      length: "Knee length",
      closure: "Back zipper",
      sleeves: "Sleeveless"
    },
    sizes: ["XS", "S", "M", "L", "XL"]
  },
  {
    id: 3,
    name: "Men's Stretch Jeans",
    brand: "Wrangler",
    price: 29.99,
    description: "Durable stretch jeans with a modern fit for all-day comfort.",
    image: "/placeholder.svg",
    details: {
      material: "Denim (98% Cotton, 2% Spandex)",
      care: "Machine washable",
      origin: "USA",
      fit: "Modern fit",
      length: "Full length",
      closure: "Zipper fly with button",
      sleeves: "None"
    },
    sizes: ["30", "32", "34", "36", "38"]
  }
];

const AllClothing = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const product = clothingProducts.find((item) => item.id === expandedCard);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    alert(
      `Added ${quantity} × ${product.name} (Size: ${selectedSize}) to cart.`
    );
  };

  return (
    <>
      <Header />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-4">All Clothing</h1>
        <p className="mb-8">Browse our full range of clothing items for everyone.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clothingProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition relative cursor-pointer"
              onClick={() => {
                setExpandedCard(product.id);
                setSelectedSize("");
                setQuantity(1);
              }}
            >
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-60 object-cover rounded mb-3"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.brand}</p>
              <p className="text-blue-600 font-bold mt-1">${product.price}</p>
              <p className="mt-2 text-sm text-gray-800">{product.description}</p>
              <button
                className="mt-3 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                onClick={(e) => {
                  e.stopPropagation();
                  alert("Added to cart!");
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {product && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
              onClick={() => setExpandedCard(null)}
              aria-label="Close"
            >
              &times;
            </button>

            <div className="grid md:grid-cols-2 gap-6">
              <Image
                src={product.image}
                alt={product.name}
                width={400}
                height={400}
                className="w-full h-72 object-cover rounded"
              />

              <div>
                <h3 className="text-2xl font-bold mb-1">{product.name}</h3>
                <p className="text-gray-600">{product.brand}</p>
                <p className="text-blue-600 text-lg font-semibold mt-1">${product.price}</p>
                <p className="mt-2 text-sm text-gray-800">{product.description}</p>

                <div className="mt-4">
                  <h4 className="font-semibold mb-1">Select Size:</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`border px-3 py-1 rounded ${
                          selectedSize === size ? "bg-gray-800 text-white" : "bg-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Product Features:</h4>
                  <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                    <li><strong>Material:</strong> {product.details.material}</li>
                    <li><strong>Care:</strong> {product.details.care}</li>
                    <li><strong>Country of Origin:</strong> {product.details.origin}</li>
                    <li><strong>Fit:</strong> {product.details.fit}</li>
                    <li><strong>Length:</strong> {product.details.length}</li>
                    <li><strong>Closure:</strong> {product.details.closure}</li>
                    <li><strong>Sleeves:</strong> {product.details.sleeves}</li>
                  </ul>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <label htmlFor="quantity" className="font-semibold">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 border rounded px-2 py-1"
                  />
                </div>

                <button
                  className="mt-5 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllClothing;
