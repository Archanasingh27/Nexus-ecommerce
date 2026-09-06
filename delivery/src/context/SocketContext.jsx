import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDeliveryAuth } from './DeliveryAuthContext';
import { useToast } from './ToastContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { rider, isAuthenticated } = useDeliveryAuth();
  const { addToast } = useToast();
  const [socket, setSocket] = useState(null);
  const [incomingOrder, setIncomingOrder] = useState(null);
  const audioRef = useRef(null);

  // Play audio notification chime using Web Audio API synthesis
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Bell Tone 1
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Bell Tone 2
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.2); // A5
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6
      gain2.gain.setValueAtTime(0.4, now + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.7);
    } catch (err) {
      console.warn('Audio playback restricted:', err.message);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !rider) {
      if (socket) socket.disconnect();
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/+$/, '')
      : 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('[Delivery Socket.IO] Connected as rider:', rider.name);
      newSocket.emit('join_rider_room', rider._id);
      if (rider.serviceCity) {
        newSocket.emit('join_city_room', rider.serviceCity);
      }
    });

    // Real-Time New Order Dispatch Listener
    newSocket.on('new_order_available', (data) => {
      if (rider.isAvailable) {
        playAlertSound();
        setIncomingOrder(data.order);
        addToast(`🚨 New Delivery Available: Order #${data.order.orderNumber}`, 'info', 6000);
      }
    });

    // If another rider accepts an order, dismiss modal if open
    newSocket.on('order_claimed', ({ orderId }) => {
      setIncomingOrder((prev) => (prev && prev._id === orderId ? null : prev));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, rider?._id, rider?.isAvailable]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        incomingOrder,
        clearIncomingOrder: () => setIncomingOrder(null),
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
