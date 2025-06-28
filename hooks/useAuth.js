"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Restore user from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (data) => {
    const res = await axios.post("http://localhost:5000/api/users/register", data);
    const newUser = res.data.user;
    setUser(newUser);
    localStorage.setItem("loggedUser", JSON.stringify(newUser));
  };

  const login = async (email, password) => {
    const res = await axios.post("http://localhost:5000/api/users/login", { email, password });
    const newUser = res.data.user;
    setUser(newUser);
    localStorage.setItem("loggedUser", JSON.stringify(newUser));
    return newUser;
  };

  const updateProfile = async (newData) => {
    const res = await axios.put(`http://localhost:5000/api/users/${user.user_id}`, newData);
    const updatedUser = res.data.user;
    setUser(updatedUser);
    localStorage.setItem("loggedUser", JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem("loggedUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
