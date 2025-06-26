"use client";
import React,{useCallback} from "react";
import Header from "@/app/components/Header";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useProduct } from "../../../../hooks/useProduct";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
const SellerDashboard = () => {
  const { products, loading, error, addProduct, fetchProducts } = useProduct();

  const loadProducts = useCallback(() => {
      fetchProducts();
    }, [fetchProducts]);
  
    useEffect(() => {
      loadProducts();
    }, [loadProducts]);

    const router=useRouter();
    
    // ✅ FRONTEND FILE ONLY
const handleDelete = async (productId) => {
  try {
    const res = await axios.delete(`http://localhost:5000/api/products/${productId}`);
    if (res.data.success) {
      alert("Deleted");
      fetchProducts(); // reload
    }
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};


  return (
    <>
      <Header />
   

      <main className="bg-blue-50 py-10 min-h-screen px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Seller Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Section 1 */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
              <p className="text-gray-600 mb-4">List and manage inventory</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={()=>{
                router.push('/sellerForm');
              }}>
                Add Product
              </button>
            </div>

            {/* Section 2 */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">View Orders</h2>
              <p className="text-gray-600 mb-4">Check pending & delivered orders</p>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                View Orders
              </button>
            </div>

            {/* Section 3 */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Revenue Stats</h2>
              <p className="text-gray-600 mb-4">Track your earnings</p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
                View Reports
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Your Products</h2>
        
        {loading ? (
          
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.product_id} className="relative border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow">
  {/* Delete button */}
  <button
    onClick={(e) => {
      e.stopPropagation(); // prevent triggering onClick of product
      handleDelete(product.product_id);
    }}
    className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
    title="Delete"
  >
    ✖
  </button>

  {/* Product click navigation */}
  <div onClick={() => router.push(`products/${product.product_id}`)} className="cursor-pointer">
    <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-3">
      {product.images?.main ? (
        <img
          src={product.images.main}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No Image
        </div>
      )}
    </div>
    <h3 className="font-bold truncate">{product.name}</h3>
    <p className="text-sm text-gray-500 truncate">
      {product.brand} • {product.category}
    </p>
    <div className="mt-2 flex justify-between items-center">
      <span className="text-green-600 font-semibold">
        ₹{product.price?.discounted || product.price?.original}
      </span>
      {product.price?.discounted && product.price?.discounted < product.price?.original && (
        <span className="text-xs text-gray-500 line-through">
          ₹{product.price.original}
        </span>
      )}
    </div>
  </div>
</div>

            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">No products found</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    
      </main>

      <Footer />
    </>
  );
};

export default SellerDashboard;
