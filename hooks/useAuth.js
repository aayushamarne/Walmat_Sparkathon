"use client"
import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const register = async (data) => {
    const res = await axios.post('http://localhost:5000/api/users/register', data);
    setUser(res.data.user);
  };

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
    setUser(res.data.user);
      return res.data.user;
  };

  const updateProfile = async (newData) => {
    const res = await axios.put(`http://localhost:5000/api/users/${user.user_id}`, newData);
    setUser(res.data.user);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
