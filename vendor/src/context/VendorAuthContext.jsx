import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { io } from 'socket.io-client';

const VendorAuthContext = createContext(null);

export const VendorAuthProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('nexus_vendor_token') || null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
      : 'http://localhost:5000';

    const socketInstance = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 2,
      timeout: 4000,
      withCredentials: true,
    });

    socketInstance.on('connect_error', () => {
      // Graceful fallback for serverless environments
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!token) {
        setVendor(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/vendor/profile');
        setVendor(res.data.vendor);
        localStorage.setItem('nexus_vendor_user', JSON.stringify(res.data.vendor));

        if (socket && res.data.vendor?._id) {
          socket.emit('join_vendor_room', res.data.vendor._id);
        }
      } catch (err) {
        console.error('Failed to sync vendor session:', err);
        setToken(null);
        setVendor(null);
        localStorage.removeItem('nexus_vendor_token');
        localStorage.removeItem('nexus_vendor_user');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProfile();
  }, [token, socket]);

  const login = async (email, password) => {
    const res = await api.post('/vendor/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setVendor(res.data.vendor);
      localStorage.setItem('nexus_vendor_token', res.data.token);
      localStorage.setItem('nexus_vendor_user', JSON.stringify(res.data.vendor));

      if (socket && res.data.vendor?._id) {
        socket.emit('join_vendor_room', res.data.vendor._id);
      }
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/vendor/register', formData);
    if (res.data.success) {
      setToken(res.data.token);
      setVendor(res.data.vendor);
      localStorage.setItem('nexus_vendor_token', res.data.token);
      localStorage.setItem('nexus_vendor_user', JSON.stringify(res.data.vendor));

      if (socket && res.data.vendor?._id) {
        socket.emit('join_vendor_room', res.data.vendor._id);
      }
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setVendor(null);
    localStorage.removeItem('nexus_vendor_token');
    localStorage.removeItem('nexus_vendor_user');
  };

  const updateProfile = (updatedVendor) => {
    setVendor(updatedVendor);
    localStorage.setItem('nexus_vendor_user', JSON.stringify(updatedVendor));
  };

  return (
    <VendorAuthContext.Provider
      value={{
        vendor,
        token,
        loading,
        isAuthenticated: Boolean(token && vendor),
        socket,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </VendorAuthContext.Provider>
  );
};

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within VendorAuthProvider');
  }
  return context;
};
