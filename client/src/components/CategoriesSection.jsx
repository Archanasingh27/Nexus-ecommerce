import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiGrid,
  FiZap,
  FiLayers,
  FiBox,
  FiShield,
  FiDroplet,
  FiSliders,
  FiLock,
  FiToggleRight,
  FiCpu,
  FiSun,
  FiDatabase,
  FiPackage,
  FiTool,
} from 'react-icons/fi';
import {
  RiHome4Line,
  RiToolsLine,
  RiFlashlightLine,
  RiDropLine,
  RiPaintBrushLine,
  RiDoorLockLine,
  RiAppsLine,
  RiContrastDropLine,
} from 'react-icons/ri';

const iconMap = {
  home: <RiHome4Line className="w-5 h-5" />,
  gamepad: <RiToolsLine className="w-5 h-5" />,
  smartphone: <RiFlashlightLine className="w-5 h-5" />,
  headphones: <RiDropLine className="w-5 h-5" />,
};

// High Quality Curated Images for Each Subcategory
const subcategoryImageMap = {
  // Civil & Interiors
  'cement': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=80',
  'tiling': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
  'plywood-mdf-hdhmr': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
  'fevicol': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80',
  'waterproofing': 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=400&auto=format&fit=crop&q=80',
  'painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&auto=format&fit=crop&q=80',

  // Furniture & Architectural Hardware
  'hinges-channels-handles': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&auto=format&fit=crop&q=80',
  'kitchen-systems-accessories': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
  'wardrobe-bed-fittings': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&auto=format&fit=crop&q=80',
  'door-locks-hardware': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400&auto=format&fit=crop&q=80',

  // Electrical
  'wires-mcb-distribution-boards': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
  'switches-sockets': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80',
  'electrical-conduits': 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=400&auto=format&fit=crop&q=80',
  'lighting': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&auto=format&fit=crop&q=80',

  // Plumbing, Sanitary & Bath
  'cpvc-pipes-overhead-tanks': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&auto=format&fit=crop&q=80',
  'sanitary-bath-fittings': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&auto=format&fit=crop&q=80',
  'overhead-tanks': 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=400&auto=format&fit=crop&q=80',
};

const getSubcategoryImage = (sub) => {
  return sub.image || subcategoryImageMap[sub.slug] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400';
};

export const CategoriesSection = ({
  categories = [],
  selectedCategory = 'all',
  selectedSubcategory = 'all',
  onSelectCategory,
  onSelectSubcategory,
}) => {
  const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory);

  return (
    <section className="w-full max-w-[1620px] mx-auto px-6 sm:px-8 lg:px-12 mt-4 sm:mt-5 mb-1 sm:mb-2 py-2 sm:py-3 bg-transparent">
      {/* 1. Main Category Navigation Strip */}
      <div className="flex items-start justify-start lg:justify-center gap-2 sm:gap-4 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-2 px-2 border-b border-yellow-300/40 w-full mx-auto pb-3">
        
        {/* 'For You / All' lead item */}
        <button
          type="button"
          onClick={() => {
            onSelectCategory && onSelectCategory('all');
            onSelectSubcategory && onSelectSubcategory('all');
          }}
          className="flex flex-col items-center gap-2 group w-[80px] sm:w-[96px] text-center shrink-0 transition-transform hover:scale-105 focus:outline-none cursor-pointer"
        >
          <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl shrink-0 flex items-center justify-center transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-[#fae125] text-slate-950 border-2 border-yellow-400 shadow-lg shadow-yellow-400/35 ring-2 ring-yellow-400/40 font-black scale-105'
              : 'bg-yellow-400/10 text-slate-800 border border-yellow-300/50 hover:bg-[#fae125] hover:text-black hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-400/25'
          }`}>
            <FiGrid className={`w-5 h-5 ${selectedCategory === 'all' ? 'text-black' : 'text-slate-900 group-hover:text-black'}`} />
          </div>
          <div className="flex flex-col items-center w-full min-h-[32px] sm:min-h-[36px] justify-start text-center">
            <span className={`text-xs font-black transition-colors ${
              selectedCategory === 'all' ? 'text-slate-950 font-black' : 'text-slate-700 group-hover:text-slate-950'
            }`}>
              For You
            </span>
            {selectedCategory === 'all' && <div className="w-5 h-0.5 bg-[#fae125] rounded-full mt-1 shrink-0"></div>}
          </div>
        </button>

        {/* Dynamic Category Items */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.slug;
          return (
            <button
              key={cat._id || cat.slug}
              type="button"
              onClick={() => {
                onSelectCategory && onSelectCategory(cat.slug);
                onSelectSubcategory && onSelectSubcategory('all');
              }}
              className="flex flex-col items-center gap-2 group w-[92px] sm:w-[110px] md:w-[125px] text-center shrink-0 transition-transform hover:scale-105 focus:outline-none cursor-pointer"
            >
              <div className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl shrink-0 flex items-center justify-center transition-all duration-300 ${
                isSelected
                  ? 'bg-[#fae125] text-slate-950 border-2 border-yellow-400 shadow-lg shadow-yellow-400/35 ring-2 ring-yellow-400/40 font-black scale-105'
                  : 'bg-yellow-400/10 text-slate-800 border border-yellow-300/50 hover:bg-[#fae125] hover:text-black hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-400/25'
              }`}>
                {iconMap[cat.icon] || <FiGrid className="w-5 h-5" />}
              </div>
              <div className="flex flex-col items-center w-full min-h-[34px] sm:min-h-[38px] justify-start text-center">
                <span className={`text-[10px] sm:text-[11px] md:text-xs font-black transition-colors text-center leading-tight line-clamp-2 w-full px-0.5 break-words hyphens-auto ${
                  isSelected ? 'text-slate-950 font-black' : 'text-slate-700 group-hover:text-slate-950'
                }`}>
                  {cat.name}
                </span>
                {isSelected && <div className="w-5 h-0.5 bg-[#fae125] rounded-full mt-1 shrink-0"></div>}
              </div>
            </button>
          );
        })}

        {/* View All Button item at end */}
        <Link
          to="/shop"
          className="flex flex-col items-center gap-2 group w-[80px] sm:w-[96px] text-center shrink-0 transition-transform hover:scale-105 cursor-pointer"
        >
          <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl shrink-0 bg-yellow-400/10 text-slate-800 border border-yellow-300/50 flex items-center justify-center group-hover:bg-[#fae125] group-hover:text-black group-hover:border-yellow-400 group-hover:shadow-md group-hover:shadow-yellow-400/25 transition-all duration-300">
            <FiGrid className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-center w-full min-h-[32px] sm:min-h-[36px] justify-start text-center">
            <span className="text-xs font-black text-slate-800 group-hover:text-black group-hover:underline">
              All
            </span>
          </div>
        </Link>
      </div>

      {/* 2. Subcategories Row - Sleek Product Images with Yellow Borders */}
      {selectedCategory !== 'all' && selectedCategoryObj?.subcategories && selectedCategoryObj.subcategories.length > 0 && (
        <div className="pt-3.5 mt-0.5 flex items-start justify-start lg:justify-center gap-3 sm:gap-5 lg:gap-6 overflow-x-auto no-scrollbar scroll-smooth animate-in fade-in slide-in-from-top-1 duration-200 w-full mx-auto px-2">
          
          {/* 'All Subcategory' item */}
          <button
            type="button"
            onClick={() => onSelectSubcategory && onSelectSubcategory('all')}
            className="flex flex-col items-center gap-2 group w-[80px] sm:w-[96px] text-center shrink-0 transition-transform hover:scale-105 focus:outline-none cursor-pointer"
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 flex flex-col items-center justify-center transition-all duration-300 ${
              selectedSubcategory === 'all'
                ? 'bg-[#fae125] text-slate-950 border-2 border-yellow-400 shadow-md shadow-yellow-400/30 ring-2 ring-yellow-400/40 scale-105'
                : 'bg-yellow-400/10 text-slate-800 border border-yellow-300/50 group-hover:border-[#fae125] group-hover:bg-[#fae125]/20 group-hover:shadow-md'
            }`}>
              <FiGrid className="w-4 h-4 text-slate-900" />
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-800 mt-0.5">All</span>
            </div>
            <div className="flex flex-col items-center w-full min-h-[30px] sm:min-h-[34px] justify-start text-center">
              <span className={`text-[11px] sm:text-xs font-black transition-colors ${
                selectedSubcategory === 'all' ? 'text-slate-950 font-black' : 'text-slate-600 group-hover:text-slate-950'
              }`}>
                All
              </span>
              {selectedSubcategory === 'all' && <div className="w-4 h-0.5 bg-[#fae125] rounded-full mt-1 shrink-0"></div>}
            </div>
          </button>

          {/* Subcategory items with Clean Product Photos */}
          {selectedCategoryObj.subcategories.map((sub) => {
            const isSubActive = selectedSubcategory === sub.slug;
            const subImgUrl = getSubcategoryImage(sub);

            return (
              <button
                key={sub.slug}
                type="button"
                onClick={() => onSelectSubcategory && onSelectSubcategory(sub.slug)}
                className="flex flex-col items-center gap-2 group w-[88px] sm:w-[105px] md:w-[115px] text-center shrink-0 transition-transform hover:scale-105 focus:outline-none cursor-pointer"
              >
                {/* Image Box with Yellow-Themed Border */}
                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 overflow-hidden shadow-xs transition-all duration-300 bg-white ${
                  isSubActive
                    ? 'border-2 border-[#fae125] ring-3 ring-yellow-400/40 shadow-lg shadow-yellow-400/25 scale-105'
                    : 'border border-yellow-300/60 group-hover:border-[#fae125] group-hover:shadow-md group-hover:shadow-yellow-400/20'
                }`}>
                  <img
                    src={subImgUrl}
                    alt={sub.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Subtle glass overlay gradient on hover */}
                  <div className={`absolute inset-0 transition-opacity ${
                    isSubActive ? 'bg-[#fae125]/15' : 'bg-black/0 group-hover:bg-[#fae125]/10'
                  }`} />
                </div>

                {/* Subcategory Label Below */}
                <div className="flex flex-col items-center w-full min-h-[32px] sm:min-h-[36px] justify-start text-center">
                  <span className={`text-[10px] sm:text-[11px] md:text-xs font-black transition-colors text-center leading-tight line-clamp-2 w-full px-0.5 break-words hyphens-auto ${
                    isSubActive ? 'text-slate-950 font-black' : 'text-slate-700 group-hover:text-slate-950'
                  }`}>
                    {sub.name}
                  </span>
                  {isSubActive && <div className="w-4 h-0.5 bg-[#fae125] rounded-full mt-1 shrink-0"></div>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
