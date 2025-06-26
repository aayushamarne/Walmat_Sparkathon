'use client';

import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaStore } from "react-icons/fa";

const Register = () => {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password_hash: "",
    address:"",
    phone: "",
    role: "customer",
    avatar_url: "",
    skin_profile: { skin_type: "normal", skin_tone: "medium" },
    size: {
      height_cm: 0,
      weight_kg: 0,
      shirt_size: "M"
    },
    preferences: { preferred_categories: [], notifications_enabled: true },
    wishlist: [],
    cart: [],
    orders: [],
    store_name: "", // For sellers
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    status: "active"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
    if (form.role === "seller") {
      alert("Account Created Successfully");
    router.push("/pages/SellerDashboard");
  } else {
    alert("Account Created! Check you Account details.")
    router.push("/");
  }

  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 to-violet-200 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-violet-600 p-4 rounded-full text-white">
            <FaUser className="text-2xl" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900">Sign Up</h2>
        <p className="text-sm text-center text-gray-500 mb-4">Create a new {form.role} account</p>

        {/* Role Toggle */}
        <div className="flex justify-center space-x-2 mb-4">
          <button
            onClick={() => setForm({ ...form, role: "customer" })}
            className={`px-4 py-1 rounded-full font-semibold ${form.role === "customer" ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-600"}`}
          >
            Customer
          </button>
          <button
            onClick={() => setForm({ ...form, role: "seller" })}
            className={`px-4 py-1 rounded-full font-semibold ${form.role === "seller" ? "bg-violet-600 text-white" : "bg-gray-200 text-gray-600"}`}
          >
            Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="name"
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="email"
                type="email"
                placeholder="Email"
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="password_hash"
                type="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="phone"
                placeholder="Phone Number"
                className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Seller Specific Field */}
          {form.role === "seller" && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Store Name</label>
              <div className="relative">
                <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="store_name"
                  placeholder="Your Store Name"
                  className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-2 rounded-full hover:bg-violet-700 transition font-semibold"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-600 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
