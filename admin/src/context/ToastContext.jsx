import React, { createContext, useContext, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-xl backdrop-blur-xl border transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-white/95 text-emerald-900 border-emerald-300 ring-2 ring-emerald-500/20'
                : toast.type === 'error'
                ? 'bg-white/95 text-red-900 border-red-300 ring-2 ring-red-500/20'
                : 'bg-white/95 text-slate-900 border-orange-200 ring-2 ring-orange-500/20'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
              {toast.type === 'error' && <FiAlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
              {toast.type === 'info' && <FiInfo className="w-5 h-5 text-blue-600 shrink-0" />}
              <span className="text-xs font-black">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors ml-3 cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
