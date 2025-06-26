"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Header from "@/app/components/Header";
import Image from "next/image";
import axios from "axios";

const AllClothing = () => {
  const [clothingProducts, setClothingProducts] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClothing = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/products?type=clothing");
        // Handle different response formats
        let products = [];
        if (Array.isArray(res.data)) {
          products = res.data;
        } else if (res.data && Array.isArray(res.data.products)) {
          products = res.data.products;
        } else if (res.data && Array.isArray(res.data.data)) {
          products = res.data.data;
        } else {
          console.error("API response is not an array or does not contain an array:", res.data);
          setError("Invalid data format received from server.");
        }
        setClothingProducts(products);
      } catch (err) {
        console.error("Error fetching clothing products:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(
          err.response?.data?.error ||
            "Failed to load clothing products. Please check if the server is running and try again."
        );
        setClothingProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClothing();
  }, []);

  const handleAddToCart = (product) => {
    if (!selectedColor) {
      alert("Please select a color.");
      return;
    }
    if (!selectedSize) {
      alert("Please select a size.");
      return;
    }
    alert(`Added ${quantity} × ${product.name} (Color: ${selectedColor}, Size: ${selectedSize}) to cart.`);
  };

  return (
    <>
      <Header />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-4">All Clothing</h1>
        <p className="mb-8">Browse our full range of clothing items for everyone.</p>

        {loading && <p>Loading products...</p>}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        {!loading && clothingProducts.length === 0 && !error && (
          <p>No clothing products available.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clothingProducts.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition relative cursor-pointer"
              onClick={() => {
                setExpandedCard(product._id);
                setSelectedColor(product.variants?.[0]?.color || "");
                setSelectedSize("");
                setQuantity(1);
              }}
            >
              <Image
                src={product.images?.main || "/placeholder.svg"}
                alt={product.name}
                width={300}
                height={300}
                className="w-full h-60 object-cover rounded mb-3"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.brand}</p>
              <p className="text-blue-600 font-bold mt-1">
                ₹{product.price?.discounted || product.price?.original}
              </p>
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
      {expandedCard && (
        (() => {
          const product = clothingProducts.find((item) => item._id === expandedCard);
          if (!product) return null;

          // Find the variant for the selected color, or use the first variant as default
          const selectedVariant = selectedColor
            ? product.variants.find((v) => v.color === selectedColor)
            : product.variants[0];

          // Use variant image if available, otherwise fall back to main image
          const displayImage = selectedVariant?.image || product.images?.main || "/placeholder.svg";

          return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
                  onClick={() => setExpandedCard(null)}
                  aria-label="Close"
                >
                  ×
                </button>

                <div className="grid md:grid-cols-2 gap-6">
                  <Image
                    src={displayImage}
                    alt={`${product.name} - ${selectedColor || 'Default'}`}
                    width={400}
                    height={400}
                    className="w-full h-72 object-cover rounded"
                  />

                  <div>
                    <h3 className="text-2xl font-bold mb-1">{product.name}</h3>
                    <p className="text-gray-600">{product.brand}</p>
                    <p className="text-blue-600 text-lg font-semibold mt-1">
                      ₹{product.price?.discounted || product.price?.original}
                    </p>
                    <p className="mt-2 text-sm text-gray-800">{product.description}</p>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Select Color:</h4>
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full border p-2 rounded"
                      >
                        <option value="">Select Color</option>
                        {product.variants?.map((variant) => (
                          <option key={variant.variant_id} value={variant.color}>
                            {variant.color}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-1">Select Size:</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.variants
                          ?.filter((v) => !selectedColor || v.color === selectedColor)
                          .map((variant) => (
                            <button
                              key={variant.variant_id}
                              onClick={() => setSelectedSize(variant.size)}
                              className={`border px-3 py-1 rounded ${
                                selectedSize === variant.size
                                  ? "bg-gray-800 text-white"
                                  : "bg-white"
                              }`}
                            >
                              {variant.size}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Product Features:</h4>
                      <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                        <li><strong>Material:</strong> {product.clothing_attributes?.fabric || 'N/A'}</li>
                        <li><strong>Care:</strong> {product.clothing_attributes?.ar_tryon?.instructions || 'N/A'}</li>
                        <li><strong>Skin Type:</strong> {product.clothing_attributes?.skin_compatibility?.skin_types || 'N/A'}</li>
                        <li><strong>Skin Tone:</strong> {product.clothing_attributes?.skin_compatibility?.skin_tones || 'N/A'}</li>
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
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </>
  );
};

export default AllClothing;