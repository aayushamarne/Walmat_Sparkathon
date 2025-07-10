"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../hooks/useAuth";
import { useCart } from "../../../../context/CartContext";
import SplitItemsModal from "../../../components/SplitItemsModal";

export default function SplitWithFriendsPage() {
  const [numFriends, setNumFriends] = useState(2);
  const { user } = useAuth();
  const [errors, setErrors] = useState([]);
  const [friendDetails, setFriendDetails] = useState([
    { id: "", email: "" },
    { id: "", email: "" },
  ]);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [validatedFriends, setValidatedFriends] = useState([]);
  const { cartItems } = useCart();
  const router = useRouter();

  const handleChangeNumFriends = (e) => {
    const count = parseInt(e.target.value);
    setNumFriends(count);

    const updated = [...friendDetails];
    while (updated.length < count) updated.push({ id: "", email: "" });
    while (updated.length > count) updated.pop();
    setFriendDetails(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...friendDetails];
    updated[index][field] = value;
    setFriendDetails(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Friends to split with:", friendDetails);
  
    try {
      const response = await fetch("http://localhost:5000/api/users/validate-friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          friends: friendDetails, 
          currentUser: { id: user?.user_id, email: user?.email } 
        }),
      });
  
      const data = await response.json();
  
      if (!data || !Array.isArray(data.results)) {
        console.error("Unexpected response structure:", data);
        setErrors(["Something went wrong validating friends."]);
        return;
      }
  
      const validationResults = data.results;
      setErrors(validationResults);
  
      if (validationResults.some((msg) => msg !== "")) {
        return;
      }
      
      setValidatedFriends(friendDetails.filter((_, i) => !data.results[i]));
      setShowSplitModal(true);
    } catch (error) {
      console.error("Error:", error);
      setErrors(["Server error during validation."]);
    }
  };
  
  const handleSplitSubmit = (assignments) => {
    console.log("Final assignments:", {
      user: { id: user.user_id, email: user.email },
      friends: validatedFriends,
      items: assignments
    });
    alert("Items split successfully!");
    setShowSplitModal(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-12 transition-all duration-300 hover:shadow-xl">
  <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800 font-serif tracking-tight">
    Split with Friends
  </h1>

  <div className="mb-8">
    <label className="block text-gray-700 font-medium mb-2 font-sans">
      Select number of friends:
    </label>
    <select
      value={numFriends}
      onChange={handleChangeNumFriends}
      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 bg-gray-50 hover:bg-gray-100 font-sans"
    >
      {[2, 3, 4].map((num) => (
        <option key={num} value={num}>{num}</option>
      ))}
    </select>
  </div>

  <form onSubmit={handleSubmit} className="space-y-6">
    {friendDetails.map((friend, index) => (
      <div
        key={index}
        className="p-6 border border-gray-200 rounded-xl bg-green-to-br from-green-50 to-green-50 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
      >
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-teal-100 text-teal-600 rounded-full mr-3 font-medium font-sans">
            {index + 1}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 font-serif">
            Friend {index + 1}
          </h3>
          {errors[index] && (
            <p className="text-red-500 text-sm ml-4 font-semibold font-sans">{errors[index]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1 font-sans">
              Friend ID
            </label>
            <input
              type="text"
              value={friend.id}
              onChange={(e) => handleInputChange(index, "id", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 bg-white hover:bg-gray-50 font-sans"
              required
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1 font-sans">
              Email
            </label>
            <input
              type="email"
              value={friend.email}
              onChange={(e) => handleInputChange(index, "email", e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all duration-200 bg-white hover:bg-gray-50 font-sans"
              required
              placeholder="email@example.com"
            />
          </div>
        </div>
      </div>
    ))}

    <button
      type="submit"
      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-teal-600 hover:to-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 font-sans"
    >
      <span>Proceed to Split</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 transition-transform group-hover:translate-x-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  </form>
</div>
      {showSplitModal && (
        <SplitItemsModal
          friends={validatedFriends}
          currentUser={{ id: user.user_id, email: user.email }}
          cartItems={cartItems}
          onClose={() => setShowSplitModal(false)}
          onSubmit={handleSplitSubmit}
        />
      )}
    </div>
  );
}