import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiMapPin, FiPackage, FiDollarSign, FiClock, FiRadio, FiAlertTriangle } from 'react-icons/fi';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export const IncomingOrderModal = ({ onOrderAccepted }) => {
  const { incomingOrder, clearIncomingOrder } = useSocket();
  const { addToast } = useToast();
  const [timeLeft, setTimeLeft] = useState(30);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!incomingOrder) {
      setTimeLeft(30);
      return;
    }

    setTimeLeft(30);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          clearIncomingOrder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingOrder]);

  if (!incomingOrder) return null;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const { data } = await api.put(`/delivery/orders/${incomingOrder._id}/accept`);
      addToast('Order Claimed! Route added to your active trips.', 'success');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      clearIncomingOrder();
      if (onOrderAccepted) onOrderAccepted(data.order);
    } catch (err) {
      addToast(err.response?.data?.message || 'Order already claimed or unavailable', 'error');
      clearIncomingOrder();
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    try {
      await api.put(`/delivery/orders/${incomingOrder._id}/reject`);
    } catch (err) {
      // Ignore reject errors
    } finally {
      clearIncomingOrder();
    }
  };

  const payout = incomingOrder.deliveryFee || 40;
  const isCOD = incomingOrder.paymentMethod === 'Cash on Delivery';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-150">
      
      {/* Modal Container matching Admin Modals */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-orange-200/80 space-y-4 animate-in zoom-in-95 duration-150">
        
        {/* Top Header Badge & Countdown */}
        <div className="flex items-center justify-between pb-3 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-orange-700">
              New Delivery Request
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-black text-orange-700 bg-orange-100/90 border border-orange-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
            <FiClock className="w-3.5 h-3.5 text-orange-600" />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Payout & Order ID Box */}
        <div className="p-4 bg-orange-50/50 border border-orange-200/70 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Delivery Payout</div>
            <div className="text-2xl font-black text-slate-900 mt-0.5">₹{payout}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-500">#{incomingOrder.orderNumber}</div>
            <div className="text-[11px] font-black text-orange-700 mt-0.5">
              {isCOD ? '💵 Cash on Delivery' : '💳 Prepaid'}
            </div>
          </div>
        </div>

        {/* Destination Location Info */}
        <div className="p-3.5 bg-white/80 rounded-2xl border border-orange-100 space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <FiMapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-slate-900">
                {incomingOrder.shippingAddress?.fullName || 'Customer'}
              </div>
              <div className="text-slate-500 text-[11px] leading-relaxed">
                {incomingOrder.shippingAddress?.street}, {incomingOrder.shippingAddress?.city} ({incomingOrder.shippingAddress?.postalCode})
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-[11px] font-medium">
            <span>{incomingOrder.orderItems?.length || 1} item(s) in parcel</span>
            <span className="font-black text-slate-900">Value: ₹{incomingOrder.totalPrice}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleDecline}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 border border-slate-200"
          >
            <FiX className="w-4 h-4" />
            <span>Decline</span>
          </button>

          <button
            onClick={handleAccept}
            disabled={accepting}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-glow-orange transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 border border-orange-400"
          >
            <FiCheck className="w-4 h-4 stroke-[3]" />
            <span>{accepting ? 'Claiming...' : 'Accept Delivery'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
