import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from './ToastContext';

const DeliveryAuthContext = createContext(null);

export const DeliveryAuthProvider = ({ children }) => {
  const { addToast } = useToast();
  const [rider, setRider] = useState(() => {
    const saved = localStorage.getItem('nexus_delivery_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    const token = localStorage.getItem('nexus_delivery_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/delivery/profile');
      setRider(data.user);
      localStorage.setItem('nexus_delivery_user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Delivery auth error:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/delivery/login', { email, password });
      localStorage.setItem('nexus_delivery_token', data.token);
      localStorage.setItem('nexus_delivery_user', JSON.stringify(data.user));
      setRider(data.user);
      addToast(`Welcome back, ${data.user.name}!`, 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      addToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const toggleDuty = async () => {
    if (!rider) return;
    try {
      const { data } = await api.put('/delivery/toggle-availability');
      const updated = { ...rider, isAvailable: data.isAvailable };
      setRider(updated);
      localStorage.setItem('nexus_delivery_user', JSON.stringify(updated));
      addToast(data.message, data.isAvailable ? 'success' : 'info');
    } catch (err) {
      addToast('Failed to toggle duty', 'error');
    }
  };

  const logout = () => {
    localStorage.removeItem('nexus_delivery_token');
    localStorage.removeItem('nexus_delivery_user');
    setRider(null);
  };

  return (
    <DeliveryAuthContext.Provider
      value={{
        rider,
        isAuthenticated: Boolean(rider),
        loading,
        login,
        logout,
        toggleDuty,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </DeliveryAuthContext.Provider>
  );
};

export const useDeliveryAuth = () => {
  const context = useContext(DeliveryAuthContext);
  if (!context) {
    throw new Error('useDeliveryAuth must be used within DeliveryAuthProvider');
  }
  return context;
};
