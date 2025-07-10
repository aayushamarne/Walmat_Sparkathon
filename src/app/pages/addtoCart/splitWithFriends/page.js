"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../../hooks/useAuth";
import { useCart } from "../../../../context/CartContext";
import SplitItemsModal from "../../../components/SplitItemsModal";

export default function SplitWithFriendsPage() {
  const [numFriends, setNumFriends] = useState(2);
  const { user } = useAuth();
  const [errors, setErrors] = useState([]);
  const [friendDetails, setFriendDetails] = useState([
    { email: "", user_id: "" },
    { email: "", user_id: "" },
  ]);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [validatedFriends, setValidatedFriends] = useState([]);
  const { cartItems } = useCart();
  const router = useRouter();

  // Memoize currentUser and validatedFriends to prevent re-renders
  const currentUser = useMemo(() => ({
    email: user?.email || "",
    user_id: user?.user_id || "",
  }), [user?.email, user?.user_id]);

  const handleChangeNumFriends = (e) => {
    const count = parseInt(e.target.value);
    setNumFriends(count);

    const updated = [...friendDetails];
    while (updated.length < count) updated.push({ email: "", user_id: "" });
    while (updated.length > count) updated.pop();
    setFriendDetails(updated);
    setErrors([]); // Clear errors when changing number of friends
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...friendDetails];
    updated[index][field] = value;
    setFriendDetails(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email || !user?.user_id) {
      setErrors(["Please log in to share your cart."]);
      console.error("User not authenticated:", user);
      return;
    }

    if (!cartItems.length) {
      setErrors(["Your shopping basket is empty. Add items to share."]);
      console.warn("Empty cart, cannot proceed to split.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/validate-friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          friends: friendDetails,
          currentUser: { email: user.email, user_id: user.user_id },
        }),
      });

      const data = await response.json();

      if (!data || !Array.isArray(data.results)) {
        console.error("Unexpected response:", data);
        setErrors(["Something went wrong validating friends."]);
        return;
      }

      setErrors(data.results);

      if (data.results.some((msg) => msg !== "")) {
        console.warn("Friend validation errors:", data.results);
        return;
      }

      // Assume backend returns validated friends with user_id
      const validated = data.validatedFriends || friendDetails.map(friend => ({
        email: friend.email,
        user_id: friend.user_id || `temp_${friend.email}`, // Fallback user_id
      }));
      setValidatedFriends(validated);
      setShowSplitModal(true);
    } catch (error) {
      console.error("Error validating friends:", error);
      setErrors(["Server error during validation. Please check your connection."]);
    }
  };

  const handleSplitSubmit = () => {

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 mb-12">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800 font-serif">Share Your Cart with Friends</h1>

        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">
            {errors.map((error, index) => (
              error && <p key={index}>{error}</p>
            ))}
          </div>
        )}

        <div className="mb-8">
          <label className="block text-gray-700 font-medium mb-2">Select number of friends to share with:</label>
          <select
            value={numFriends}
            onChange={handleChangeNumFriends}
            className="w-full p-3 border border-gray-200 rounded-lg"
            aria-label="Number of friends to share with"
          >
            {[1, 2, 3, 4].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {friendDetails.map((friend, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-xl bg-green-50 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 flex items-center justify-center bg-teal-100 text-teal-600 rounded-full mr-3">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Friend {index + 1}</h3>
                {errors[index] && (
                  <p className="text-red-500 text-sm ml-4">{errors[index]}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-600 text-sm mb-1">Email</label>
                <input
                  type="email"
                  value={friend.email}
                  onChange={(e) => handleInputChange(index, "email", e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  required
                  placeholder="email@example.com"
                  aria-label={`Email for friend ${index + 1}`}
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Proceed to divide cart"
          >
            Proceed to Divide Cart
          </button>
        </form>
      </div>

      {showSplitModal && (
        <SplitItemsModal
          friends={validatedFriends}
          currentUser={currentUser}
          onSubmit={handleSplitSubmit}
        />
      )}
    </div>
  );
}