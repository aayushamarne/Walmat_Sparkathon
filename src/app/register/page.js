'use client';

import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaEnvelope, FaLock, FaPhone } from "react-icons/fa";

const Register = () => {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password_hash: "",
    phone: "",
    role: "customer",
    avatar_url: "",
    skin_profile: { skin_type: "normal", skin_tone: "medium" },
    preferences: { preferred_categories: [], notifications_enabled: true },
    wishlist: [],
    cart: [],
    orders: [],
    created_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    status: "active"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSkinChange = (e) => {
    setForm({
      ...form,
      skin_profile: {
        ...form.skin_profile,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
    router.push("/");
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

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900">Sign Up</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Create a new account</p>

        {/* Tabs */}
        <div className="flex mb-4 bg-gray-100 rounded-full p-1">
          <Link href="/login" className="w-1/2 text-center py-2 text-gray-600 hover:text-violet-600 font-semibold transition">
            Sign In
          </Link>
          <button className="w-1/2 bg-violet-600 text-white py-2 rounded-full font-semibold">Sign Up</button>
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

          {/* Skin Profile */}
          {/* <div className="flex space-x-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Skin Type</label>
              <select
                name="skin_type"
                value={form.skin_profile.skin_type}
                onChange={handleSkinChange}
                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="normal">Normal</option>
                <option value="dry">Dry</option>
                <option value="oily">Oily</option>
                <option value="combination">Combination</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-600 mb-1">Skin Tone</label>
              <select
                name="skin_tone"
                value={form.skin_profile.skin_tone}
                onChange={handleSkinChange}
                className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="fair">Fair</option>
                <option value="medium">Medium</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div> */}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-2 rounded-full hover:bg-violet-700 transition font-semibold"
          >
            Register
          </button>
        </form>

        {/* Redirect */}
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
