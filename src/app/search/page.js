"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Image from "next/image";
import axios from "axios";
import { useCart } from "../../context/CartContext";

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [results, setResults] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [searchReviewModalOpen, setSearchReviewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const { cartCount, updateCartCount } = useCart();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
  const [addReviewModalOpen, setAddReviewModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [activeProduct, setActiveProduct] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [displayImage, setDisplayImage] = useState("");
  const [showTryOnSpinner, setShowTryOnSpinner] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showCartDialog, setShowCartDialog] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setError("No search query provided.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/products/search?query=${encodeURIComponent(query)}`
        );
        let products = [];

        if (Array.isArray(res.data)) {
          products = res.data;
        } else if (res.data?.products) {
          products = res.data.products;
        } else if (res.data?.data) {
          products = res.data.data;
        } else {
          setError("Invalid data format received from server.");
          setResults([]);
          return;
        }

        const enrichedProducts = await Promise.all(
          products.map(async (product) => {
            try {
              const reviewRes = await axios.get(
                `http://localhost:5000/api/products/${product._id}/reviews`
              );
              const reviews = reviewRes.data.reviews || [];
              const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
              const average = reviews.length ? (totalRating / reviews.length).toFixed(1) : null;

              return {
                ...product,
                rating: {
                  average: average ? parseFloat(average) : null,
                  count: reviews.length,
                },
              };
            } catch {
              return {
                ...product,
                rating: {
                  average: null,
                  count: 0,
                },
              };
            }
          })
        );

        setResults(enrichedProducts);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load search results.");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  // Add event listeners for voice commands
  useEffect(() => {
    const handleOpenProduct = (event) => {
  const { productTitle } = event.detail;
  const spoken = productTitle.toLowerCase();

  const product = results.find((p) => {
    const name = p.name.toLowerCase();
    const brand = p.brand?.toLowerCase() || "";
    const description = p.description?.toLowerCase() || "";

    return (
      name.includes(spoken) ||
      spoken.includes(name) ||
      brand.includes(spoken) ||
      spoken.includes(brand) ||
      description.includes(spoken) ||
      spoken.split(" ").some(word => name.includes(word) || brand.includes(word))
    );
  });

  if (product) {
    setExpandedCard(product._id);
    setSelectedColor("");
    setSelectedSize("");
    setQuantity(1);
    setDisplayImage(product.images?.main || "/placeholder.svg");
  } else {
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(`Product ${productTitle} not found`)
    );
  }
};


  const handleSelectColor = (event) => {
  const { color } = event.detail;
  if (!expandedCard) return;

  const product = results.find((p) => p._id === expandedCard);
  const allVariants = product?.variants || [];

  const availableColors = [...new Set(allVariants.map((v) => v.color?.toLowerCase().trim()))];

  console.log("🎨 Voice requested color:", color);
  console.log("🎨 Available colors:", availableColors);

  const colorSynonyms = {
    grey: "gray",
    gray: "grey",
    maroon: "red",
    silver: "gray"
  };

  const spokenColor = color.toLowerCase().trim();
  const normalizedColor = colorSynonyms[spokenColor] || spokenColor;

  const matchedColor = availableColors.find((c) =>
    c.includes(normalizedColor) || normalizedColor.includes(c)
  );

  if (matchedColor) {
    console.log("✅ Matched color:", matchedColor);

    const originalColor = allVariants.find(
      (v) => v.color.toLowerCase().trim() === matchedColor
    )?.color;

    setSelectedColor(originalColor); // ✅ Use actual casing
    setSelectedSize("");

    const variant = allVariants.find(
      (v) => v.color.toLowerCase().trim() === matchedColor
    );

    if (variant) {
      console.log("🖼️ Variant with selected color:", variant);
      setDisplayImage(variant?.image || product?.images?.main || "/placeholder.svg");
    } else {
      console.warn("⚠️ No variant found for selected color");
    }

    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(`Selected color ${originalColor}`)
    );
  } else {
    console.warn("❌ No matching color found in product");
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(`Color ${spokenColor} not available`)
    );
  }
};

 

    const handleSelectSize = (event) => {
  const { size } = event.detail;
  if (!expandedCard || !selectedColor) return;

  const product = results.find((p) => p._id === expandedCard);
  const variants = product?.variants || [];

  const availableSizes = variants
    .filter((v) => v.color.toLowerCase().trim() === selectedColor.toLowerCase().trim())
    .map((v) => v.size.toLowerCase().trim());

  console.log("📏 Voice requested size:", size);
  console.log("📏 Available sizes:", availableSizes);

  const spokenSize = size.toLowerCase().trim();

  // Fuzzy matching
  const matchedSize = availableSizes.find(
    (s) => s.includes(spokenSize) || spokenSize.includes(s)
  );

  if (matchedSize) {
    const originalSize = variants.find(
      (v) =>
        v.color.toLowerCase().trim() === selectedColor.toLowerCase().trim() &&
        v.size.toLowerCase().trim() === matchedSize
    )?.size;

    setSelectedSize(originalSize);
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(`Selected size ${originalSize}`)
    );
  } else {
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(`Size ${spokenSize} not available`)
    );
  }
};


    const handleVoiceAddToCart = () => {
      if (expandedCard) {
        const product = results.find((p) => p._id === expandedCard);
        const selectedVariant = product?.variants?.find(
          (v) => v.color === selectedColor && v.size === selectedSize
        );
        if (!selectedVariant?.variant_id) {
          window.speechSynthesis.speak(
            new SpeechSynthesisUtterance("Please select both a valid color and size")
          );
          return;
        }
        handleAddToCart(product, selectedVariant);
      }
    };

    const handleSearchReviews = () => {
      if (expandedCard) {
        setActiveProduct(expandedCard);
        setSearchTerm("");
        axios
          .get(`http://localhost:5000/api/products/${expandedCard}/reviews`)
          .then((res) => {
            setAllReviews(res.data.reviews || []);
            setSearchReviewModalOpen(true);
          })
          .catch((err) => {
            console.error("Error fetching reviews for search:", err);
            setAllReviews([]);
            window.speechSynthesis.speak(
              new SpeechSynthesisUtterance("Failed to load reviews")
            );
          });
      }
    };

    window.addEventListener("voiceOpenProduct", handleOpenProduct);
    window.addEventListener("voiceSelectColor", handleSelectColor);
    window.addEventListener("voiceSelectSize", handleSelectSize);
    window.addEventListener("voiceAddToCart", handleVoiceAddToCart);
    window.addEventListener("voiceSearchReviews", handleSearchReviews);

    return () => {
      window.removeEventListener("voiceOpenProduct", handleOpenProduct);
      window.removeEventListener("voiceSelectColor", handleSelectColor);
      window.removeEventListener("voiceSelectSize", handleSelectSize);
      window.removeEventListener("voiceAddToCart", handleVoiceAddToCart);
      window.removeEventListener("voiceSearchReviews", handleSearchReviews);
    };
  }, [results, expandedCard, selectedColor, selectedSize]);

  const handleAddToCart = (product, variant) => {
    if (!variant?.variant_id) {
      setValidationMessage("Please select both a valid color and size before adding to cart.");
      setShowValidationModal(true);
      return;
    }

    setValidationMessage("");
    setShowValidationModal(false);

    const cartItem = {
      productId: product._id,
      type: product.type,
      variant_id: variant.variant_id,
      quantity,
    };

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push(cartItem);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount(cart.length);

    setShowCartDialog(true);
    setTimeout(() => {
      setShowCartDialog(false);
    }, 2000);
    setExpandedCard(null);
  };

  const submitReview = async () => {
    if (!activeProduct || ratingValue < 1 || ratingValue > 5 || !reviewText.trim()) {
      alert("Please provide a valid rating and review.");
      return;
    }

    try {
      await axios.post(`http://localhost:5000/api/products/rate/${activeProduct}`, {
        rating: ratingValue,
        review: reviewText,
      });

      const reviewRes = await axios.get(`http://localhost:5000/api/products/${activeProduct}/reviews`);
      const reviews = reviewRes.data.reviews || [];
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const average = reviews.length ? (totalRating / reviews.length).toFixed(1) : null;

      setResults((prev) =>
        prev.map((p) =>
          p._id === activeProduct
            ? {
                ...p,
                rating: {
                  average: average ? parseFloat(average) : null,
                  count: reviews.length,
                },
              }
            : p
        )
      );

      setRatingValue(0);
      setReviewText("");
      setAddReviewModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert("Failed to submit review: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  const openReviewSection = async (productId) => {
    setActiveProduct(productId);
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${productId}/reviews`);
      const reviews = res.data.reviews || [];
      setAllReviews(reviews);

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const average = reviews.length ? (totalRating / reviews.length).toFixed(1) : null;

      setResults((prev) =>
        prev.map((p) =>
          p._id === productId
            ? {
                ...p,
                rating: {
                  average: average ? parseFloat(average) : null,
                  count: reviews.length,
                },
              }
            : p
        )
      );
      setViewReviewModalOpen(true); // Fixed typo here
    } catch (err) {
      alert("Failed to load reviews: " + (err.response?.data?.error || "Unknown error"));
    }
  };

 


  return (
    <>
      <Header />
      <Navbar />
         {showTryOnSpinner && (
  <div className="fixed inset-0 z-[999] bg-black bg-opacity-60 flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
    <p className="text-white mt-4  absolute bottom-10 text-lg font-semibold">Trying on...</p>
  </div>
)}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-4">Search Results for "{query}"</h1>
        <p className="mb-8">Browse items matching your search.</p>

        {loading && <p>Loading products...</p>}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">{error}</div>
        )}
        {!loading && results.length === 0 && !error && <p>No products found for your search.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {results.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => {
                setExpandedCard(product._id);
                setSelectedColor("");
                setSelectedSize("");
                setQuantity(1);
                setDisplayImage(product.images?.main || "/placeholder.svg");
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

      {expandedCard &&
        (() => {
          const product = results.find((item) => item._id === expandedCard);
          if (!product) return null;

          const selectedVariant = product.variants?.find(
            (v) => v.color === selectedColor && v.size === selectedSize
          );
          const variantWithColorOnly = product.variants?.find((v) => v.color === selectedColor);
          const displayImageLocal =
            variantWithColorOnly?.image || product.images?.main || "/placeholder.svg";

          return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
              <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full p-8 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl"
                  onClick={() => setExpandedCard(null)}
                >
                  ×
                </button>

                <div className="grid md:grid-cols-2 gap-6">
                  <Image
                    src={displayImageLocal}
                    alt={`${product.name} - ${selectedColor || "Default"}`}
                    width={500}
                    height={500}
                    className="w-full h-80 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{product.name}</h3>
                    <p className="text-gray-600">{product.brand}</p>
                    <p className="text-blue-600 text-lg font-semibold mt-1">
                      ₹{product.price?.discounted || product.price?.original}
                    </p>
                    <p className="text-yellow-500 font-medium mt-1">
                      ⭐ {product.rating?.average?.toFixed(1) || "N/A"} ({product.rating?.count || 0} ratings)
                    </p>

                    <p className="mt-2 text-sm text-gray-800">{product.description}</p>

                    {(!selectedColor || !selectedSize) && product.variants?.length > 0 && (
                      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4 text-sm">
                        Please select a valid <strong>color</strong> and <strong>size</strong> to continue.
                      </div>
                    )}

                    {/* Color selection */}
                    {product.variants?.length > 0 && (
                      <div className="mt-4">
                        <label className="block font-semibold mb-1 cursor-pointer">Select Color:</label>
                        <select
                          value={selectedColor}
                          onChange={(e) => {
                            const newColor = e.target.value;
                            setSelectedColor(newColor);
                            setSelectedSize("");
                            if (newColor === "") {
                              setDisplayImage(product.images?.main || "/placeholder.svg");
                              return;
                            }
                            const variantWithColor = product.variants.find((v) => v.color === newColor);
                            setDisplayImage(variantWithColor?.image || product.images?.main || "/placeholder.svg");
                          }}
                          className="w-full border p-2 rounded"
                        >
                          <option value="">Select Color</option>
                          {[...new Set(product.variants.map((v) => v.color))].map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Size selection */}
                    {product.variants?.length > 0 && (
                      <div className="mt-4">
                        <label className="block font-semibold mb-1">Select Size:</label>
                        <div className="flex flex-wrap gap-2">
                          {product.variants
                            ?.filter((v) => v.color === selectedColor)
                            .map((variant) => (
                              <button
                                key={variant.variant_id}
                                onClick={() => setSelectedSize(variant.size)}
                                className={`border px-3 py-1 rounded ${
                                  selectedSize === variant.size ? "bg-gray-800 text-white" : "bg-white"
                                }`}
                              >
                                {variant.size}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    

                    {/* Quantity and Add to Cart */}
                    <div className="mt-4 flex items-center gap-3">
                      <label htmlFor="quantity" className="font-semibold">
                        Quantity:
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1"
                      />
                      <button
                        className="ml-auto bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer min-w-[280px]"
                        onClick={() => handleAddToCart(product, selectedVariant)}
                      >
                        Add to Cart
                      </button>
                    </div>

                    {/* View & Add Review Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <button
                        className="cursor-pointer bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-600 w-full sm:w-1/2"
                        onClick={() => openReviewSection(product._id)}
                      >
                        View Reviews
                      </button>
                      <button
                        className="cursor-pointer bg-green-700 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-1/2"
                        onClick={() => {
                          setActiveProduct(product._id);
                          setAddReviewModalOpen(true);
                        }}
                      >
                        Add Review
                      </button>
                    </div>


                    <div className="mt-6">
  <button
    className="w-full sm:w-1/2 mx-auto bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-600"
    onClick={() => {
      setShowTryOnSpinner(true);
      setTimeout(() => {
        setShowTryOnSpinner(false);
        alert("Try On complete (replace this with actual feature)");
      }, 3000); // Simulate try-on process
    }}
  >
    👕 Try On
  </button>
</div>


                    <div className="mt-4 flex justify-center">
                      <button
                        className="cursor-pointer bg-purple-800 text-white px-6 py-2 rounded hover:bg-purple-700 w-full sm:w-1/2"
                        onClick={async () => {
                          if (!product._id) return;

                          setSearchReviewModalOpen(true);
                          setSearchTerm("");

                          try {
                            const res = await axios.get(
                              `http://localhost:5000/api/products/${product._id}/reviews`
                            );
                            setAllReviews(res.data.reviews || []);
                          } catch (err) {
                            console.error("Error fetching reviews for search:", err);
                            setAllReviews([]);
                          }
                        }}
                      >
                        Search Reviews
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* View Reviews Modal */}
      {viewReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-4 p-6 relative border border-gray-200 max-h-[90vh] flex flex-col">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl transition-all hover:rotate-90"
              onClick={() => setViewReviewModalOpen(false)}
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Customer Reviews
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
              {allReviews.length > 0 ? (
                allReviews.map((r, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow border border-gray-200 p-4 flex flex-col justify-between gap-3"
                  >
                    <p className="text-gray-800 font-semibold text-base break-words">{r.review}</p>
                    <div className="bg-yellow-400 text-black font-semibold px-3 py-1 rounded text-sm w-fit">
                      {r.rating} ★
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 col-span-full">
                  <div className="text-gray-400 mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500">No reviews yet.</p>
                  <button
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium hover:shadow-md transition-all"
                    onClick={() => setViewReviewModalOpen(false)}
                  >
                    Write First Review
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {addReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-gray-200">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 text-2xl transition"
              onClick={() => setAddReviewModalOpen(false)}
            >
              ×
            </button>
            <h3 className="text-2xl font-bold mb-6 text-center text-green-700">🌟 Submit Your Review</h3>

            <label className="block mb-2 font-semibold">
              Rating <span className="text-xs text-gray-500">(1-5)</span>
            </label>
            <input
              type="number"
              min="1"
              max="5"
              onChange={(e) => setRatingValue(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={ratingValue}
              placeholder="e.g., 5"
            />

            <label className="block mb-2 font-semibold">Review</label>
            <textarea
              rows={4}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Write your honest thoughts here..."
              value={reviewText}
            ></textarea>

            <button
              onClick={submitReview}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full transition duration-200 cursor-pointer"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}

      {/* Search Reviews Modal */}
      {searchReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative border border-gray-200 max-h-[90vh] flex flex-col">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl"
              onClick={() => setSearchReviewModalOpen(false)}
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-center mb-4 text-purple-700">🔍 Search Customer Reviews</h2>

            <input
              type="text"
              placeholder="Type to search (e.g., Saw, Superb...)"
              className="border p-2 rounded w-full mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 max-h-96 scrollbar-thin scrollbar-thumb-gray-300">
              {(() => {
                const filteredReviews = searchTerm.trim()
                  ? allReviews.filter((r) =>
                      r.review?.toLowerCase().includes(searchTerm.trim().toLowerCase())
                    )
                  : allReviews;

                return (
                  <>
                    {filteredReviews.length > 0 ? (
                      filteredReviews.map((r, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-4 shadow border">
                          <p className="text-gray-800">{r.review}</p>
                          <span className="text-yellow-600 font-bold text-sm">{r.rating} ★</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-400 col-span-full">
                        {searchTerm.trim() ? "No reviews found" : "Please enter a search term"}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccess && (
        <div className="fixed bottom-10 right-10 z-50 bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 animate-fade-in-out">
          <span className="text-2xl">✅</span>
          <p className="text-sm font-medium">Review submitted successfully!</p>
        </div>
      )}

      {/* Cart Dialog */}
      {showCartDialog && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg bg-green-100 border border-green-300 shadow-md text-green-800 font-semibold text-sm animate-fade-in-out">
          ✅ Item added to cart!
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Action Required</h2>
            <p className="text-gray-700">{validationMessage}</p>
            <button
              onClick={() => setShowValidationModal(false)}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
 
    </>
  );
};

   

export default SearchResultsPage;