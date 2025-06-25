"use client";
import React from "react";
import Header from "@/app/components/Header";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const SellerDashboard = () => {
  return (
    <>
      <Header />
      <Navbar />

      <main className="bg-blue-50 py-10 min-h-screen px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Seller Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Section 1 */}
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Add New Product</h2>
              <p className="text-gray-600 mb-4">List and manage inventory</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
      </main>

      <Footer />
    </>
  );
};

export default SellerDashboard;
