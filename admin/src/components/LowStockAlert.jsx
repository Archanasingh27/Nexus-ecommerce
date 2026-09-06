import React from 'react';
import { FiAlertTriangle, FiPlus, FiCheck } from 'react-icons/fi';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export const LowStockAlert = ({ lowStockProducts = [], onProductUpdated }) => {
  const { addToast } = useToast();

  const handleRestock = async (productId, currentStock) => {
    try {
      const newStock = currentStock + 25;
      await api.put(`/products/${productId}`, { countInStock: newStock });
      addToast(`Restocked product to ${newStock} units!`, 'success');
      if (onProductUpdated) onProductUpdated();
    } catch (err) {
      addToast('Failed to update stock', 'error');
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center border border-amber-300">
            <FiAlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Low Stock Alerts</h3>
            <p className="text-xs text-slate-500 font-medium">Inventory levels below threshold (&lt;= 5 units)</p>
          </div>
        </div>
        <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
          {lowStockProducts.length} Items Critical
        </span>
      </div>

      <div className="space-y-3">
        {lowStockProducts.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-xs text-emerald-800 font-bold">
            ✨ All product lines are adequately stocked!
          </div>
        ) : (
          lowStockProducts.map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/70 border border-orange-200/60 hover:bg-white hover:border-orange-400 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=100'}
                  alt={p.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                    {p.name}
                  </h4>
                  <span className="text-[11px] text-amber-700 font-bold block">
                    Only {p.countInStock} items left in stock
                  </span>
                </div>
              </div>

              {/* YELLOW BUTTON: Restock */}
              <button
                onClick={() => handleRestock(p._id, p.countInStock)}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-2xs border border-amber-300 flex items-center gap-1 shrink-0 transition-all cursor-pointer"
              >
                <FiPlus className="w-3.5 h-3.5 text-slate-950" />
                <span>+25 Restock</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
