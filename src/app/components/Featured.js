"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import Image from "next/image";

const Featured = () => {
  const [products, setProducts] = useState([]);
  const [expandedCard, setExpandedCard] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const [viewReviewModalOpen, setViewReviewModalOpen] = useState(false);
  const [addReviewModalOpen, setAddReviewModalOpen] = useState(false);
  const [searchReviewModalOpen, setSearchReviewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [activeProduct, setActiveProduct] = useState(null);
  const [allReviews, setAllReviews] = useState([]);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  const { updateCartCount } = useCart();

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/top-rated");
        const enriched = res.data.products.map((product) => ({
          ...product,
          stars: getStars(product.average_rating || 0),
        }));
        setProducts(enriched);
      } catch (err) {
        console.error("Failed to fetch top-rated products:", err);
      }
    };
    fetchTopProducts();
  }, []);

  const getStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return [
      ...Array(fullStars).fill("star"),
      ...Array(halfStar).fill("star_half"),
      ...Array(emptyStars).fill("star_border"),
    ];
  };

  const handleAddToCart = (product, variant) => {
    if (!variant?.variant_id) {
      setValidationMessage("Please select both a valid color and size before adding to cart.");
      setShowValidationModal(true);
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
    updateCartCount(cart.length);

    setShowCartDialog(true);
    setTimeout(() => setShowCartDialog(false), 2000);
    setExpandedCard(null);
  };

  const openReviewSection = async (productId) => {
    setActiveProduct(productId);
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${productId}/reviews`);
      setAllReviews(res.data.reviews || []);
      setViewReviewModalOpen(true);
    } catch (err) {
      alert("Failed to load reviews.");
    }
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
      setAllReviews(reviewRes.data.reviews || []);
      setRatingValue(0);
      setReviewText("");
      setAddReviewModalOpen(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      alert("Failed to submit review.");
    }
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Products</h2>
          <a
            href="/pages/allProducts"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform hover:scale-105 cursor-pointer"
              onClick={() => {
                setExpandedCard(product._id);
                setQuantity(1);
                setSelectedColor("");
                setSelectedSize("");
              }}
            >
              <img
                src={product.images?.main || "/fallback.jpg"}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-500 space-x-1">
                    {product.stars.map((icon, i) => (
                      <span key={i} className="material-icons text-base leading-none">
                        {icon}
                      </span>
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm ml-2">
                    ({product.average_rating?.toFixed(1) || "No ratings"})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-blue-600">
                      ₹{product.price?.discounted ?? product.price?.original}
                    </span>
                    {product.price?.discounted && (
                      <span className="text-gray-500 line-through ml-2">
                        ₹{product.price.original}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

     {expandedCard && (() => {
  const product = products.find(p => p._id === expandedCard);
  if (!product) return null;

  const selectedVariant = product.variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const variantWithColorOnly = product.variants.find((v) => v.color === selectedColor);
  const displayImage = variantWithColorOnly?.image || product.images?.main || "/fallback.jpg";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 relative">
        <button onClick={() => setExpandedCard(null)} className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-600">×</button>
        <div className="grid md:grid-cols-2 gap-6">
          <Image src={displayImage} alt={product.name} width={500} height={500} className="w-full object-cover rounded" />
          <div>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-gray-500">{product.brand}</p>
            <p className="text-blue-600 font-semibold text-xl mt-2">
              ₹{product.price?.discounted || product.price?.original}
            </p>
            <p className="text-yellow-500 mt-1">
              ⭐ {product.average_rating?.toFixed(1) || "N/A"}
            </p>
            <div className="mt-4">
              <label className="font-semibold block mb-1">Select Color:</label>
              <select
                value={selectedColor}
                onChange={(e) => {
                  const c = e.target.value;
                  setSelectedColor(c);
                  setSelectedSize("");
                }}
                className="border p-2 rounded w-full"
              >
                <option value="">Select Color</option>
                {[...new Set(product.variants.map(v => v.color))].map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
            <div className="mt-4">
              <label className="font-semibold block mb-1">Select Size:</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter(v => v.color === selectedColor).map(v => (
                  <button
                    key={v.variant_id}
                    onClick={() => setSelectedSize(v.size)}
                    className={`px-3 py-1 border rounded ${selectedSize === v.size ? "bg-gray-800 text-white" : ""}`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-3 items-center">
              <label className="font-semibold">Qty:</label>
              <input type="number" value={quantity} min="1" onChange={(e) => setQuantity(Number(e.target.value))} className="w-20 border p-2 rounded" />
              <button onClick={() => handleAddToCart(product, selectedVariant)} className="ml-auto bg-blue-700 text-white px-4 py-2 rounded">
                Add to Cart
              </button>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <button onClick={() => openReviewSection(product._id)} className="bg-yellow-500 px-4 py-2 rounded">View Reviews</button>
              <button onClick={() => { setActiveProduct(product._id); setAddReviewModalOpen(true); }} className="bg-green-600 px-4 py-2 text-white rounded">Add Review</button>
              <button
                onClick={async () => {
                  setSearchReviewModalOpen(true);
                  setSearchTerm("");
                  try {
                    const res = await axios.get(`http://localhost:5000/api/products/${product._id}/reviews`);
                    setAllReviews(res.data.reviews || []);
                  } catch {
                    setAllReviews([]);
                  }
                }}
                className="bg-purple-600 px-4 py-2 text-white rounded"
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

{addReviewModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
      <button onClick={() => setAddReviewModalOpen(false)} className="absolute top-3 right-4 text-xl text-gray-600 hover:text-red-600">×</button>
      <h3 className="text-xl font-bold mb-4">Submit Your Review</h3>
      <label className="block mb-1">Rating (1–5)</label>
      <input type="number" min="1" max="5" className="border p-2 w-full rounded mb-4" value={ratingValue} onChange={(e) => setRatingValue(Number(e.target.value))} />
      <label className="block mb-1">Review</label>
      <textarea rows="4" className="border p-2 w-full rounded" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
      <button onClick={submitReview} className="bg-green-600 text-white mt-4 px-4 py-2 rounded w-full">Submit</button>
    </div>
  </div>
)}

{viewReviewModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-6">
    <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative">
      <button onClick={() => setViewReviewModalOpen(false)} className="absolute top-4 right-4 text-xl text-gray-600 hover:text-red-600">×</button>
      <h2 className="text-2xl font-semibold text-center mb-4">Customer Reviews</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
        {allReviews.length > 0 ? (
          allReviews.map((r, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded shadow-sm">
              <p className="text-gray-800">{r.review}</p>
              <span className="text-yellow-600 font-bold text-sm">{r.rating} ★</span>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">No reviews available.</p>
        )}
      </div>
    </div>
  </div>
)}

{searchReviewModalOpen && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6">
    <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative">
      <button onClick={() => setSearchReviewModalOpen(false)} className="absolute top-4 right-4 text-xl text-gray-600 hover:text-red-600">×</button>
      <h2 className="text-xl font-semibold text-center mb-4">Search Reviews</h2>
      <input
        type="text"
        placeholder="Search keywords..."
        className="border p-2 rounded w-full mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
        {(searchTerm.trim()
          ? allReviews.filter((r) =>
              r.review?.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : []).map((r, i) => (
            <div key={i} className="bg-gray-100 p-3 rounded">
              <p>{r.review}</p>
              <div className="text-yellow-600 font-semibold text-sm">{r.rating} ★</div>
            </div>
          ))}

        {searchTerm.trim() && allReviews.filter((r) =>
          r.review?.toLowerCase().includes(searchTerm.toLowerCase())
        ).length === 0 && (
          <p className="text-center text-gray-400 col-span-full">No reviews match your search.</p>
        )}
      </div>
    </div>
  </div>
)}

{showSuccess && (
  <div className="fixed bottom-6 right-6 z-50 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded shadow-md">
    ✅ Review submitted successfully!
  </div>
)}

{showCartDialog && (
  <div className="fixed top-6 right-6 z-50 bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded shadow-md">
    ✅ Item added to cart!
  </div>
)}

{showValidationModal && (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
      <h3 className="text-lg font-semibold text-red-600 mb-2">Action Required</h3>
      <p className="text-gray-700">{validationMessage}</p>
      <button
        onClick={() => setShowValidationModal(false)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        OK
      </button>
    </div>
  </div>
)}

     
      {/* Expanded card, review modals, validation modal, success popup, cart popup to be inserted here just like AllClothing */}
    </section>
  );
};

export default Featured;
