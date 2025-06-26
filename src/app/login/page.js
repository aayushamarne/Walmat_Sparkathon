'use client';
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaFacebookF, FaApple, FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Load stored credentials on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberEmail");
    const storedPassword = localStorage.getItem("rememberPassword");
    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = await login(email, password); // Must return user object with role

    if (user) {
      // Store credentials if "Remember me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
        localStorage.setItem("rememberPassword", password);
      } else {
        localStorage.removeItem("rememberEmail");
        localStorage.removeItem("rememberPassword");
      }

      // Role-based routing
      if (user.role === "seller") {
        alert("Login Successful");
        router.push("pages/SellerDashboard");
      } else {
        alert("Login Successful. Check Your Account Details.");
        router.push("/");
      }

    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-200 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-violet-600 p-4 rounded-full text-white">
            <FaLock className="text-2xl" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-900">Welcome</h2>
        <p className="text-sm text-center text-gray-500 mb-6">Sign in to your account or create a new one</p>

        {/* Toggle */}
        <div className="flex mb-4 bg-gray-100 rounded-full p-1">
          <button className="w-1/2 bg-violet-600 text-white py-2 rounded-full font-semibold">Sign In</button>
          <Link href="/register" className="w-1/2 text-center py-2 text-gray-600 hover:text-violet-600 font-semibold transition">
            Sign Up
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaEnvelope /></span>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaLock /></span>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Remember me */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-violet-600"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link href="#" className="text-violet-600 hover:underline">Forgot password?</Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-2 rounded-full hover:bg-violet-700 transition font-semibold"
          >
            Sign In
          </button>
        </form>

        {/* Social */}
        <div className="my-6 border-t pt-4 text-center text-gray-500 text-sm">Or continue with</div>
        <div className="flex justify-center gap-4 mb-4">
          <button className="border border-gray-300 p-2 rounded-full hover:bg-gray-100"><FaGoogle className="text-lg" /></button>
          <button className="border border-gray-300 p-2 rounded-full hover:bg-gray-100"><FaFacebookF className="text-lg" /></button>
          <button className="border border-gray-300 p-2 rounded-full hover:bg-gray-100"><FaApple className="text-lg" /></button>
        </div>

        <p className="text-sm text-center text-gray-600">
          Don’t have an account?{" "}
          <Link href="/register" className="text-violet-600 hover:underline">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
