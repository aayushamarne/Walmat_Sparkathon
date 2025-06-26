"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ✅ Correct for App Router
import axios from "axios";

const ProductDetails = () => {
  const { productId } = useParams(); // from URL
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (productId) {
      axios
        .get(`http://localhost:5000/api/products/${productId}`)
        .then((res) => {
          setProduct(res.data);
          setSelectedVariant(res.data.variants[0]);
        })
        .catch((err) => {
          console.error("Failed to fetch product", err);
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const handleAddToCart = () => {
    // Replace with real cart logic
    console.log("Added to cart:", selectedVariant);
    alert(`Added variant ${selectedVariant.variant_id} to cart`);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="p-6 text-red-500">Product not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
      <p className="text-gray-600 mb-6">
        {product.brand} • {product.category}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {product.variants.map((variant) => (
          <div
            key={variant.variant_id}
            onClick={() => setSelectedVariant(variant)}
            className={`p-4 border rounded cursor-pointer hover:bg-gray-100 transition-shadow ${
              selectedVariant?.variant_id === variant.variant_id
                ? "border-blue-600 shadow-md"
                : ""
            }`}
          >
            <div className="aspect-square bg-gray-100 mb-3">
              <img
                src={variant.image || "/no-image.png"}
                alt={variant.color}
                className="w-full h-full object-cover"
              />
            </div>
            <p><strong>Color:</strong> {variant.color}</p>
            <p><strong>Size:</strong> {variant.size}<p> inches</p></p>
            {variant.storage && <p><strong>Storage:</strong> {variant.storage}</p>}
            <p><strong>Stock:</strong> {variant.stock}</p>
          </div>
        ))}
      </div>

      {selectedVariant && (
        <div className="mt-8 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-2">Selected Variant</h2>
          <p><strong>Color:</strong> {selectedVariant.color}</p>
          <p><strong>Size:</strong> {selectedVariant.size}</p>
          <p><strong>Storage:</strong> {selectedVariant.storage || "N/A"}</p>
          <p className="text-xl mt-2 text-green-600">
            ₹{product.price?.discounted || product.price?.original}
          </p>
          {product.price?.discounted &&
            product.price.discounted < product.price.original && (
              <p className="line-through text-sm text-gray-500">
                ₹{product.price.original}
              </p>
          )}
          <button
            onClick={handleAddToCart}
            className="mt-4 bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
