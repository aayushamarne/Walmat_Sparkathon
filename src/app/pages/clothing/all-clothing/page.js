"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Header from "@/app/components/Header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";

const AllClothing = () => {
  const [clothingProducts, setClothingProducts] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [activeProduct, setActiveProduct] = useState(null);
  const [allReviews, setAllReviews] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchClothing = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/products?type=clothing");
        let products = [];

        if (Array.isArray(res.data)) {
          products = res.data;
        } else if (res.data && Array.isArray(res.data.products)) {
          products = res.data.products;
        } else if (res.data && Array.isArray(res.data.data)) {
          products = res.data.data;
        } else {
          console.error("Unexpected API format:", res.data);
          setError("Invalid data format received from server.");
        }

        setClothingProducts(products);
      } catch (err) {
        console.error("Error fetching products:", err.response?.data?.error || err.message);
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

  const handleAddToCart = (product, variant) => {
    if (!variant || !variant.variant_id) {
      alert("Please select a valid color and size.");
      return;
    }

    const cartItem = {
      productId: product._id,
      type: product.type,
      variant_id: variant.variant_id,
      quantity,
    };

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Item added to cart!");
    setExpandedCard(null);
    router.push("/pages/addtoCart");
  };

  const submitReview = async () => {
    if (!activeProduct || ratingValue < 1 || ratingValue > 5) {
      alert("Please provide a rating between 1 and 5.");
      return;
    }
    if (!reviewText.trim()) {
      alert("Please provide a review text.");
      return;
    }

    try {
      console.log("Submitting review for product ID:", activeProduct);
      await axios.post(`http://localhost:5000/api/products/rate/${activeProduct}`, {
        rating: ratingValue,
        review: reviewText,
      });

      const updatedRes = await axios.get(`http://localhost:5000/api/products/${activeProduct}/reviews`);
      setAllReviews(updatedRes.data.reviews);

      alert("Review submitted successfully!");
      setRatingValue(0);
      setReviewText("");
      setReviewModalOpen(false);
    } catch (err) {
      console.error("Failed to submit review:", err.response?.data?.error || err.message);
      alert("Failed to submit review: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const openReviewSection = async (productId) => {
    setActiveProduct(productId);
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${productId}/reviews`);
      setAllReviews(res.data.reviews || []);
      setReviewModalOpen(true);
    } catch (err) {
      console.error("Failed to load reviews:", err.response?.data?.error || err.message);
      alert("Failed to load reviews: " + (err.response?.data?.error || "Unknown error"));
      setAllReviews([]);
    }
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

        {!loading && clothingProducts.length === 0 && !error && <p>No clothing products available.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clothingProducts.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
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
              <p className="text-yellow-500 font-medium mt-1">
                ⭐ {product.rating?.average?.toFixed(1) || "N/A"} ({product.rating?.count || 0} ratings)
              </p>
              <p className="mt-2 text-sm text-gray-800">{product.description}</p>
            </div>
          ))}
        </div>
      </div>

      {expandedCard && (() => {
        const product = clothingProducts.find((item) => item._id === expandedCard);
        if (!product) return null;

        const selectedVariant = product.variants.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        );

        const displayImage = selectedVariant?.image || product.images?.main || "/placeholder.svg";

        return (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
            <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-8 relative">
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
                  width={500}
                  height={500}
                  className="w-full h-80 object-cover rounded"
                />

                <div>
                  <h3 className="text-2xl font-bold mb-1">{product.name}</h3>
                  <p className="text-gray-600">{product.brand}</p>
                  <p className="text-blue-600 text-lg font-semibold mt-1">
                    ₹{product.price?.discounted || product.price?.original}
                  </p>
                  <p className="text-yellow-500 font-medium mt-1">
                    ⭐ {product.rating?.average?.toFixed(1) || "N/A"} ({product.rating?.count || 0} ratings)
                  </p>
                  <p className="mt-2 text-sm text-gray-800">{product.description}</p>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-1">Select Color:</h4>
                    <select
                      value={selectedColor}
                      onChange={(e) => {
                        setSelectedColor(e.target.value);
                        setSelectedSize("");
                      }}
                      className="w-full border p-2 rounded"
                    >
                      <option value="">Select Color</option>
                      {[...new Set(product.variants.map(v => v.color))].map((color) => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold mb-1">Select Size:</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.variants?.filter((v) => v.color === selectedColor).map((variant) => (
                        <button
                          key={variant.variant_id}
                          onClick={() => setSelectedSize(variant.size)}
                          className={`border px-3 py-1 rounded ${selectedSize === variant.size ? "bg-gray-800 text-white" : "bg-white"}`}
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
                      <li><strong>Care Instructions:</strong> {product.clothing_attributes?.ar_tryon?.instructions || 'N/A'}</li>
                      <li><strong>Skin Types Suitable For:</strong> {product.clothing_attributes?.skin_compatibility?.skin_types || 'N/A'}</li>
                      <li><strong>Skin Tones Recommended:</strong> {product.clothing_attributes?.skin_compatibility?.skin_tones || 'N/A'}</li>
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
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                    onClick={() => handleAddToCart(product, selectedVariant)}
                  >
                    Add to Cart
                  </button>

                  <button
                    className="mt-3 bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 w-full"
                    onClick={() => openReviewSection(product._id)}
                  >
                    View/Add Reviews
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
              onClick={() => setReviewModalOpen(false)}
            >×</button>
            <h3 className="text-xl font-bold mb-4">Reviews</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {allReviews.length > 0 ? (
                allReviews.map((r, i) => (
                  <div key={i} className="bg-gray-100 p-3 rounded">
                    <p className="text-yellow-500">⭐ {r.rating}</p>
                    <p className="text-sm text-gray-700">{r.review}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Add Your Review</h4>
              <input
                type="number"
                min="1"
                max="5"
                value={ratingValue}
                onChange={(e) => setRatingValue(Number(e.target.value))}
                className="w-full mb-2 border p-2 rounded"
                placeholder="Rating (1-5)"
              />
              <textarea
                rows="3"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full border p-2 rounded"
                placeholder="Write your review here"
              ></textarea>
              <button
                onClick={submitReview}
                className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllClothing;