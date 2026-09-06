import React, { useState } from 'react';
import {
  FiX,
  FiCheck,
  FiPackage,
  FiTruck,
  FiClock,
  FiUser,
  FiMapPin,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
} from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export const VendorOrderDetailModal = ({ isOpen, onClose, order, onUpdated }) => {
  const { addToast } = useToast();
  const [loadingAction, setLoadingAction] = useState(false);
  const [notes, setNotes] = useState(order?.notes || '');

  if (!isOpen || !order) return null;

  const currentStatus = order.vendorSubStatus || order.status || 'Pending';

  const handleUpdateStatus = async (nextStatus) => {
    setLoadingAction(true);
    try {
      const res = await api.put(`/vendor/orders/${order._id}/status`, {
        status: nextStatus,
        notes,
      });

      if (nextStatus === 'Ready for Pickup') {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        addToast('🚀 Package marked Ready for Pickup! Real-time dispatch broadcasted to delivery riders.', 'success');
      } else {
        addToast(`Order milestone updated to: ${nextStatus}!`, 'success');
      }

      onUpdated();
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update order status', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const getStepNumber = (st) => {
    switch (st) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Packed': return 3;
      case 'Ready for Pickup': return 4;
      case 'Out for Delivery':
      case 'Picked Up': return 5;
      case 'Delivered': return 6;
      default: return 1;
    }
  };

  const currentStep = getStepNumber(currentStatus);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 space-y-6 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <FiPackage className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Order Fulfillment</div>
                <h2 className="text-xl font-black text-slate-900 font-mono">
                  #{order.orderNumber}
                </h2>
              </div>
            </div>

            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Timeline */}
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Live Fulfillment & Delivery Pipeline
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center text-[9px] font-black">
              <div className={`py-2 px-1 rounded-xl border transition-all ${currentStep >= 1 ? 'bg-orange-500 text-white border-orange-600 shadow-xs' : 'bg-white text-slate-400 border-slate-200'}`}>
                1. Received
              </div>
              <div className={`py-2 px-1 rounded-xl border transition-all ${currentStep >= 2 ? 'bg-orange-500 text-white border-orange-600 shadow-xs' : 'bg-white text-slate-400 border-slate-200'}`}>
                2. Confirmed
              </div>
              <div className={`py-2 px-1 rounded-xl border transition-all ${currentStep >= 3 ? 'bg-orange-500 text-white border-orange-600 shadow-xs' : 'bg-white text-slate-400 border-slate-200'}`}>
                3. Packed
              </div>
              <div className={`py-2 px-1 rounded-xl border transition-all ${currentStep >= 4 ? 'bg-blue-600 text-white border-blue-700 shadow-xs' : 'bg-white text-slate-400 border-slate-200'}`}>
                4. Ready
              </div>
              <div className={`py-2 px-1 rounded-xl border transition-all ${currentStep >= 5 ? 'bg-sky-600 text-white border-sky-700 shadow-xs' : 'bg-white text-slate-400 border-slate-200'}`}>
                5. Out for Delivery
              </div>
              <div className={`py-2 px-1 rounded-xl border transition-all ${currentStep >= 6 ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-white text-slate-400 border-slate-200'}`}>
                6. Delivered
              </div>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <FiUser className="text-orange-500" />
                <span>Customer Information</span>
              </div>
              <div className="font-extrabold text-slate-900">{order.shippingAddress?.fullName || order.user?.name}</div>
              <div className="text-slate-500">{order.shippingAddress?.phone || 'No phone provided'}</div>
              <div className="text-slate-600 text-[11px]">{order.user?.email}</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                <FiMapPin className="text-orange-500" />
                <span>Delivery Address (Indore)</span>
              </div>
              <div className="font-semibold text-slate-900">{order.shippingAddress?.street}</div>
              <div className="text-slate-500 text-[11px]">{order.shippingAddress?.city}, {order.shippingAddress?.state} ({order.shippingAddress?.postalCode})</div>
            </div>
          </div>

          {/* Store Line Items */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">
              Items from Your Store ({order.orderItems?.length || 0})
            </div>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto bg-slate-50/60">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shadow-2xs shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 truncate max-w-sm">{item.name}</div>
                      <span className="text-slate-500 text-[11px]">Qty: {item.quantity} &times; ₹{item.price?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <span className="font-black text-slate-900 font-mono">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Workflow Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Current Sub-Order Status:</span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-orange-100 text-orange-800 border border-orange-200">
                {currentStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentStatus === 'Pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('Confirmed')}
                    disabled={loadingAction}
                    className="py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Confirm Order</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('Rejected')}
                    disabled={loadingAction}
                    className="py-3 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer disabled:opacity-50"
                  >
                    <span>Decline / Out of Stock</span>
                  </button>
                </>
              )}

              {currentStatus === 'Confirmed' && (
                <button
                  onClick={() => handleUpdateStatus('Packed')}
                  disabled={loadingAction}
                  className="sm:col-span-3 py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FiPackage className="w-4 h-4" />
                  <span>Mark as Packed & Box Sealed</span>
                </button>
              )}

              {currentStatus === 'Packed' && (
                <button
                  onClick={() => handleUpdateStatus('Ready for Pickup')}
                  disabled={loadingAction}
                  className="sm:col-span-3 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transform hover:-translate-y-0.5 transition-all"
                >
                  <FiSend className="w-4 h-4" />
                  <span>Mark Ready for Pickup (Broadcast to Delivery Fleet)</span>
                </button>
              )}

              {currentStatus === 'Ready for Pickup' && (
                <div className="sm:col-span-3 p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-2">
                  <FiClock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Order is broadcasted to delivery riders. Waiting for courier to start delivery.</span>
                </div>
              )}

              {(currentStatus === 'Out for Delivery' || currentStatus === 'Picked Up') && (
                <div className="sm:col-span-3 p-3 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl text-xs font-bold flex items-center gap-2">
                  <FiTruck className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Package is out for delivery to customer ({order.shippingAddress?.fullName || 'Customer'}).</span>
                </div>
              )}

              {currentStatus === 'Delivered' && (
                <div className="sm:col-span-3 space-y-3">
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>🎉 Package successfully delivered to customer! Your earnings have been credited.</span>
                  </div>

                  {/* Return Request Review Section if active */}
                  {order.returnRequest?.isRequested && (
                    <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-purple-900 flex items-center gap-1.5">
                          <FiAlertCircle className="w-4 h-4 text-purple-600" />
                          <span>Customer Return Request ({order.returnRequest.returnType})</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-200 text-purple-900">
                          {order.returnRequest.status}
                        </span>
                      </div>

                      <div className="text-slate-700">
                        <strong>Reason:</strong> {order.returnRequest.reason}
                      </div>
                      {order.returnRequest.comments && (
                        <div className="text-slate-600 italic">"{order.returnRequest.comments}"</div>
                      )}

                      {order.returnRequest.status === 'REQUESTED' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={async () => {
                              try {
                                setLoadingAction(true);
                                await api.put(`/orders/${order._id}/return/review`, {
                                  action: 'APPROVE',
                                  adminComments: 'Return approved by store vendor. Reverse pickup scheduled.',
                                });
                                addToast('Return request approved!', 'success');
                                onUpdated();
                                onClose();
                              } catch (err) {
                                addToast(err.response?.data?.message || 'Failed to approve return', 'error');
                              } finally {
                                setLoadingAction(false);
                              }
                            }}
                            disabled={loadingAction}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                          >
                            Approve Return
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                setLoadingAction(true);
                                await api.put(`/orders/${order._id}/return/review`, {
                                  action: 'REJECT',
                                  adminComments: 'Return declined per store warranty policy.',
                                });
                                addToast('Return request declined', 'info');
                                onUpdated();
                                onClose();
                              } catch (err) {
                                addToast(err.response?.data?.message || 'Failed to reject return', 'error');
                              } finally {
                                setLoadingAction(false);
                              }
                            }}
                            disabled={loadingAction}
                            className="flex-1 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                          >
                            Decline Return
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
