import React, { useState } from 'react';
import { FiX, FiMapPin, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

// Indore City & Belonging Localities / Postal Hubs
const indoreLocations = [
  { area: 'Vijay Nagar & Scheme 54 / 78', zip: '452010', city: 'Indore', state: 'MP', time: 'Express Dispatch (< 2 Hours)' },
  { area: 'Palasia (Old & New) / Manorama Ganj', zip: '452001', city: 'Indore', state: 'MP', time: 'Instant Delivery (< 2 Hours)' },
  { area: 'Rajwada / Sarafa / MG Road', zip: '452002', city: 'Indore', state: 'MP', time: 'Same-Day Express' },
  { area: 'Bhawarkua / Tower Square / Sapna Sangeeta', zip: '452014', city: 'Indore', state: 'MP', time: 'Instant Delivery (< 2 Hours)' },
  { area: 'Bengali Square / Pipliyahana / Kanadia', zip: '452016', city: 'Indore', state: 'MP', time: 'Same-Day Express' },
  { area: 'Annapurna / Sudama Nagar / Usha Nagar', zip: '452009', city: 'Indore', state: 'MP', time: 'Same-Day Express' },
  { area: 'MR 10 / Chandra Nagar / Sukhlia', zip: '452010', city: 'Indore', state: 'MP', time: 'Express Dispatch (< 2 Hours)' },
  { area: 'Super Corridor / TCS Square / Airport Road', zip: '452005', city: 'Indore', state: 'MP', time: 'Same-Day Express' },
  { area: 'AB Road / LIG Colony / Industry House', zip: '452008', city: 'Indore', state: 'MP', time: 'Instant Delivery (< 2 Hours)' },
  { area: 'Bypass / Nipania / Mahalaxmi Nagar', zip: '452010', city: 'Indore', state: 'MP', time: 'Express Dispatch (< 2 Hours)' },
  { area: 'Khandwa Naka / Limbodi / Tejaji Nagar', zip: '452020', city: 'Indore', state: 'MP', time: 'Same-Day Express' },
  { area: 'Rau / Silicon City / Emerald Heights', zip: '453331', city: 'Indore Suburb', state: 'MP', time: 'Standard Fast (Same-Day)' },
  { area: 'Pithampur Industrial Belt / SEZ', zip: '454775', city: 'Indore Suburb', state: 'MP', time: 'Standard Fast (Next-Day)' },
];

export const LocationModal = ({ isOpen, onClose, onSelectLocation }) => {
  const [customInput, setCustomInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const validateAndApply = (input) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Check if input matches Indore pincodes (452xxx, 453xxx, 454xxx) or contains Indore / Indore locality keywords
    const isPincode = /^\d{6}$/.test(trimmed);
    const validIndorePincode = /^(452\d{3}|453\d{3}|454\d{3})$/.test(trimmed);
    const hasIndoreKeyword = /indore|vijay|palasia|rajwada|bhawarkua|annapurna|sudama|bengali|pipliyahana|nipania|mahalaxmi|rau|silicon|super corridor|khandwa|mhow|pithampur|sukhlia|lig|geeta bhawan/i.test(trimmed);

    if (isPincode && !validIndorePincode) {
      setErrorMsg('Delivery is currently available exclusively in Indore city and its belonging zones (Pincodes 452001 - 452020, 453xxx, 454xxx).');
      return;
    }

    if (!isPincode && !hasIndoreKeyword) {
      setErrorMsg('Please enter an area or pincode located within Indore city or its surrounding districts.');
      return;
    }

    setErrorMsg('');
    const locString = isPincode
      ? `${trimmed}, Indore, MP`
      : `${trimmed}, Indore, MP`;

    localStorage.setItem('nexus_delivery_zip', locString);
    if (onSelectLocation) onSelectLocation(locString);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    validateAndApply(customInput);
  };

  const handlePresetSelect = (loc) => {
    setErrorMsg('');
    const locString = `${loc.area}, Indore (${loc.zip})`;
    localStorage.setItem('nexus_delivery_zip', locString);
    if (onSelectLocation) onSelectLocation(locString);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg glass-modal bg-white rounded-3xl p-5 sm:p-7 z-10 border-2 border-yellow-300 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-teal-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0d9488]">
                <FiMapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                  Indore Delivery Network
                </h3>
                <span className="text-[11px] font-bold text-[#0d9488]">
                  Exclusive Service for Indore City & Belonging Areas
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Info Notice */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#fffdf5] border border-yellow-200 my-4 text-xs text-slate-700">
            <FiInfo className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Orders and express dispatches are fulfilled strictly within <strong>Indore Municipal Corporation & Belonging Regional Hubs</strong>.
            </span>
          </div>

          {/* Custom Pincode / Area Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-2 mb-5">
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter Indore Pincode (e.g. 452010) or Area name..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#0d9488] focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#fae125] hover:bg-yellow-300 text-black text-xs font-black rounded-xl border border-yellow-400 shadow-sm transition-all cursor-pointer shrink-0"
              >
                Apply
              </button>
            </div>

            {errorMsg && (
              <div className="flex items-start gap-1.5 text-[11px] font-bold text-rose-600 animate-in fade-in">
                <FiAlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* Preset Locations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>Select Indore Delivery Hub</span>
              <span className="text-emerald-700 font-black">All Localities Active</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
              {indoreLocations.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(loc)}
                  className="w-full p-3 rounded-2xl border border-slate-200/80 hover:border-[#0d9488] hover:bg-[#e5f3f3]/50 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-black text-slate-900 group-hover:text-[#0d9488] truncate">
                      {loc.area}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-slate-500">
                        Indore, MP - {loc.zip}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-extrabold">
                        ⚡ {loc.time}
                      </span>
                    </div>
                  </div>
                  <FiCheck className="w-4 h-4 text-[#0d9488] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LocationModal;
