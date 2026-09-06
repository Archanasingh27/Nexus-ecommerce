import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from './ToastContext';
import { io } from 'socket.io-client';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    // Connect to real-time socket server
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '')
      : 'http://localhost:5000';

    const socketInstance = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_admin_info');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === 'admin') {
          setAdmin(parsed);
        } else {
          localStorage.removeItem('nexus_admin_info');
        }
      } catch (e) {
        localStorage.removeItem('nexus_admin_info');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user.role !== 'admin') {
        addToast('Access Denied: Requires Administrator Account', 'error');
        return { success: false, message: 'Not an admin account' };
      }

      setAdmin(data.user);
      localStorage.setItem('nexus_admin_info', JSON.stringify(data.user));
      addToast(`Welcome back Administrator, ${data.user.name}!`, 'success');
      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Invalid credentials.';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setAdmin(null);
    localStorage.removeItem('nexus_admin_info');
    addToast('Admin logged out safely.', 'info');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        socket,
        login,
        logout,
        isAuthenticated: !!admin && admin.role === 'admin',
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
