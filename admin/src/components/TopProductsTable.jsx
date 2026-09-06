import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiTrendingUp } from 'react-icons/fi';

export const TopProductsTable = ({ products = [] }) => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-900">Top Performing Products</h3>
          <p className="text-xs text-slate-500 font-medium">Ranked by volume sold & customer rating</p>
        </div>
        <Link to="/products" className="text-xs font-black text-orange-600 hover:text-orange-700 transition-colors">
          Catalog →
        </Link>
      </div>

      <div className="space-y-3">
        {products.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No top product metrics yet.</p>
        ) : (
          products.map((p, idx) => (
            <div
              key={p._id}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/70 border border-orange-200/60 hover:bg-white hover:border-orange-400 transition-all shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-5 text-center text-xs font-black text-orange-500">
                  #{idx + 1}
                </span>
                <img
                  src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=100'}
                  alt={p.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
                    {p.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span>{p.categoryName || 'Construction'}</span>
                    <span>•</span>
                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                      <FiStar className="w-3 h-3 fill-amber-400 text-amber-400" /> <span className="text-slate-700">{p.rating || 5}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-black text-slate-900">₹{p.price?.toLocaleString('en-IN')}</div>
                <div className="text-[10px] text-emerald-700 font-bold">
                  {p.soldCount || 0} units sold
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
