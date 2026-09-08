import React from 'react';
import { FiAlertTriangle, FiPlus, FiCheckCircle } from 'react-icons/fi';
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
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <FiAlertTriangle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">Low Stock Inventory Alerts</h3>
              <p className="text-xs text-slate-500 font-medium">Items running low across stores (&lt;= 5 units remaining)</p>
            </div>
          </div>
          <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
            lowStockProducts.length > 0
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}>
            {lowStockProducts.length} Items Alert
          </span>
        </div>

        <div className="space-y-2.5 mt-4">
          {lowStockProducts.length === 0 ? (
            <div className="p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-1">
              <FiCheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
              <div className="text-xs font-black text-emerald-900">All Product Lines Fully Stocked</div>
              <p className="text-[11px] text-emerald-700">No inventory bottlenecks detected across merchant vendors.</p>
            </div>
          ) : (
            lowStockProducts.slice(0, 5).map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/30 border border-amber-200/60 hover:bg-white hover:border-amber-400 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=100'}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      {p.name}
                    </h4>
                    <span className="text-[11px] text-rose-600 font-bold block mt-0.5">
                      Only {p.countInStock} units remaining
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRestock(p._id, p.countInStock)}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-2xs border border-orange-500 flex items-center gap-1 shrink-0 transition-all cursor-pointer active:scale-95"
                >
                  <FiPlus className="w-3.5 h-3.5" />
                  <span>+25 Restock</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;
