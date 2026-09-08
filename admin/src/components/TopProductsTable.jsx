import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiTrendingUp, FiChevronRight, FiAward } from 'react-icons/fi';

export const TopProductsTable = ({ products = [] }) => {
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <FiAward className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">Top Performing Products</h3>
              <p className="text-xs text-slate-500 font-medium">Ranked by customer orders & sales velocity</p>
            </div>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 transition-colors"
          >
            <span>Catalog</span>
            <FiChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5 mt-4">
          {products.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center font-bold">No top product sales recorded yet.</p>
          ) : (
            products.slice(0, 5).map((p, idx) => (
              <div
                key={p._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-orange-300 hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                    idx === 0 ? 'bg-amber-400 text-amber-950 shadow-2xs' :
                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                    idx === 2 ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <img
                    src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=100'}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                      <span className="text-slate-600 font-bold">{p.categoryName || 'General'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <FiStar className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-slate-700">{p.rating || 5}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-slate-900">₹{p.price?.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-0.5">
                    {p.soldCount || 0} sold
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TopProductsTable;
