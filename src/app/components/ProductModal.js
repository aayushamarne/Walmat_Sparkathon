"use client";
import React from "react";
import Image from "next/image";

const ProductModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-4xl rounded-lg overflow-y-auto max-h-[90vh] p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600 text-xl font-bold"
        >
          &times;
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={300}
            height={300}
            className="rounded-lg"
          />

          <div>
            <h2 className="text-2xl font-bold">{product.name}</h2>
            <p className="text-gray-600 mt-1">{product.brand}</p>
            <div className="mt-3">
              <span className="text-lg font-semibold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              Rating: {product.rating} ⭐ ({product.reviews} reviews)
            </p>
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p><strong>Sizes:</strong> {product.sizes.join(", ")}</p>
              <p><strong>Colors:</strong> {product.colors.join(", ")}</p>
              <p><strong>Category:</strong> {product.category}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
