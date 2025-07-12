"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { useRef } from "react";

const Account = () => {
  const { user, updateProfile, logout } = useAuth();
  const [form, setForm] = useState(user);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const formRef = useRef(form);
 
  
  useEffect(() => {
    if (user) setForm(user);

    const handleVoiceUpdate = (e) => {
      const { field, value } = e.detail;

      // Skin fields are nested under form.skin_profile
      if (field === "skinTone" || field === "skinType") {
        setForm((prev) => ({
          ...prev,
          skin_profile: {
            ...(prev.skin_profile || {}),
            [field === "skinTone" ? "skin_tone" : "skin_type"]: value,
          },
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          [field === "fullName" ? "name" : field]: value,
        }));
      }
    };

    const handleVoiceSave = () => {
        handleUpdate();
    };

    const handleVoiceLogout = () => {
      logout();
      router.push("/login");
    };

    window.addEventListener("voiceAccountUpdate", handleVoiceUpdate);
    window.addEventListener("voiceAccountSave", handleVoiceSave);
    window.addEventListener("voiceLogout", handleVoiceLogout);

    return () => {
      window.removeEventListener("voiceAccountUpdate", handleVoiceUpdate);
      window.removeEventListener("voiceAccountSave", handleVoiceSave);
      window.removeEventListener("voiceLogout", handleVoiceLogout);
    };
  }, [user]);
  
  useEffect(() => {
    formRef.current = form;
  }, [form]);
  

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 bg-gray-50">
        <p className="text-lg font-medium">Please login to view your profile.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSkinChange = (e) => {
    setForm({
      ...form,
      skin_profile: {
        ...form.skin_profile,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "tryllect");

    const res = await fetch("https://api.cloudinary.com/v1_1/dlil6t6m4/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.secure_url) {
      setForm((prev) => ({ ...prev, avatar_url: data.secure_url }));
      await updateProfile({ ...form, avatar_url: data.secure_url });
    } else {
      alert("Image upload failed");
    }

    setUploading(false);
  };

  const handleUpdate = async () => {
    
    await updateProfile(formRef.current);
    setForm({ ...formRef.current }); // Refresh UI manually
    alert("Profile updated!");
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-80 bg-gradient-to-b from-blue-700 to-blue-900 text-white p-6 sm:p-8 flex flex-col space-y-8">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={form.avatar_url || "https://via.placeholder.com/120"}
                alt="Avatar"
                className="w-full h-full rounded-full border-4 border-white object-cover shadow-md"
              />
              <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </label>
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">{form.name}</h2>
            {uploading && <p className="text-sm text-blue-200 mt-2 animate-pulse">Uploading...</p>}
          </div>
          <nav className="flex-1 space-y-4">
            <button className="w-full text-left text-lg font-medium hover:text-yellow-300 transition-colors py-2 px-4 rounded-md hover:bg-blue-800">
              Personal Info
            </button>
            <button className="w-full text-left text-lg font-medium hover:text-yellow-300 transition-colors py-2 px-4 rounded-md hover:bg-blue-800">
              My Orders
            </button>
            <button className="w-full text-left text-lg font-medium hover:text-yellow-300 transition-colors py-2 px-4 rounded-md hover:bg-blue-800">
              Wishlist
            </button>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="w-full text-left text-lg font-medium text-red-300 hover:text-red-500 transition-colors py-2 px-4 rounded-md hover:bg-blue-800"
            >
              Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 sm:p-8 lg:p-12 space-y-10">
          {/* Personal Info */}
          <section className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  placeholder="Your email address"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Your delivery address"
                />
              </div>
            </div>
          </section>

          {/* Skin Preferences */}
          <section className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-800">Skin Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Skin Type</label>
                <select
                  name="skin_type"
                  // ref={skinTypeRef}
                  value={form.skin_profile?.skin_type || "normal"}
                  onChange={handleSkinChange}
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="normal">Normal</option>
                  <option value="dry">Dry</option>
                  <option value="oily">Oily</option>
                  <option value="combination">Combination</option>
                </select>
                <span id="skinTypeToolTip" className="text-sm text-gray-500 hidden">
               Options: Normal, Oily, Dry, Combination</span>
                                                        
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Skin Tone</label>
                <select
                  name="skin_tone"
                  // ref={skinToneRef}
                  value={form.skin_profile?.skin_tone || "medium"}
                  onChange={handleSkinChange}
                  className="w-full mt-2 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="fair">Fair</option>
                  <option value="medium">Medium</option>
                  <option value="dark">Dark</option>
                </select>
                <span id="skinToneToolTip" className="text-sm text-gray-500 hidden">
                Options: Fair , Medium , Dark</span>

              </div>
            </div>
          </section>

          {/* Save Button */}
          <div className="pt-6">
            <button
              onClick={handleUpdate}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
