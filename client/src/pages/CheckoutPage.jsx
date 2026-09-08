import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiCheckCircle,
  FiCreditCard,
  FiTruck,
  FiShield,
  FiShoppingBag,
  FiArrowRight,
  FiLock,
  FiZap,
  FiX,
  FiCheck,
  FiSmartphone,
  FiGlobe,
  FiTag,
} from 'react-icons/fi';
import { RiPaypalLine, RiAppleLine, RiQrCodeLine } from 'react-icons/ri';
import { formatPrice } from '../utils/helpers';

const INDORE_AREAS = [
  { name: 'Vijay Nagar & Scheme 54 / 78', zip: '452010' },
  { name: 'Palasia (Old & New) / Manorama Ganj', zip: '452001' },
  { name: 'Rajwada / Sarafa / MG Road', zip: '452002' },
  { name: 'Bhawarkua / Tower Square / Sapna Sangeeta', zip: '452014' },
  { name: 'Bengali Square / Pipliyahana / Kanadia', zip: '452016' },
  { name: 'Annapurna / Sudama Nagar / Usha Nagar', zip: '452009' },
  { name: 'MR 10 / Chandra Nagar / Sukhlia', zip: '452010' },
  { name: 'Super Corridor / TCS Square / Airport Road', zip: '452005' },
  { name: 'AB Road / LIG Colony / Industry House', zip: '452008' },
  { name: 'Bypass / Nipania / Mahalaxmi Nagar', zip: '452010' },
  { name: 'Khandwa Naka / Limbodi / Tejaji Nagar', zip: '452020' },
  { name: 'Rau / Silicon City / Emerald Heights', zip: '453331' },
  { name: 'Pithampur Industrial Belt / SEZ', zip: '454775' },
  { name: 'Other Indore Locality', zip: '452001' },
];

export const CheckoutPage = () => {
  const {
    cartItems,
    itemsPrice,
    discountPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    deliveryOption,
    setDeliveryOption,
    selectedDeliveryOptionObj,
    deliveryOptions,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [selectedIndoreArea, setSelectedIndoreArea] = useState('Vijay Nagar & Scheme 54 / 78');
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');

  // Razorpay Sandbox Modal State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [rzpActiveTab, setRzpActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [rzpPendingData, setRzpPendingData] = useState(null); // { order, rzpData }
  const [processingRzpPayment, setProcessingRzpPayment] = useState(false);
  const [upiIdInput, setUpiIdInput] = useState('customer@okaxis');

  // Shipping Form State (Exclusively Indore, MP)
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    postalCode: user?.address?.postalCode || '452010',
    country: 'India',
  });

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    expDate: '12/28',
    cvv: '888',
    cardName: user?.name || 'Alex Rivera',
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAreaChange = (e) => {
    const areaName = e.target.value;
    setSelectedIndoreArea(areaName);
    const found = INDORE_AREAS.find((a) => a.name === areaName);
    if (found && found.zip) {
      setFormData((prev) => ({
        ...prev,
        postalCode: found.zip,
        city: 'Indore',
        state: 'Madhya Pradesh',
      }));
    }
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.street || !formData.city || !formData.postalCode) {
      addToast('Please complete all shipping address fields', 'error');
      return;
    }

    const pin = (formData.postalCode || '').trim();
    const validIndorePin = /^(452\d{3}|453\d{3}|454\d{3})$/.test(pin);
    const isIndoreCity = (formData.city || '').toLowerCase().includes('indore');

    if (!isIndoreCity && !validIndorePin) {
      addToast('Delivery is currently restricted to Indore city and its belonging areas (Pincodes 452xxx, 453xxx, 454xxx)', 'error');
      return;
    }

    setStep(2);
  };

  // Load Razorpay script helper
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Confirm Razorpay Payment (both for Official SDK callback and in-app Sandbox)
  const completeRazorpayPayment = async (payInfo) => {
    setProcessingRzpPayment(true);
    try {
      const orderId = payInfo.orderId || rzpPendingData?.order?._id;
      const { data: verifyData } = await api.post('/orders/razorpay/verify', {
        razorpay_order_id: payInfo.razorpay_order_id || rzpPendingData?.rzpData?.orderId || `order_${Date.now()}`,
        razorpay_payment_id: payInfo.razorpay_payment_id || `pay_${Date.now()}`,
        razorpay_signature: payInfo.razorpay_signature || 'demo_sig_verified_success',
        orderId,
      });

      setShowRazorpayModal(false);
      setCreatedOrder(verifyData.order || { ...(rzpPendingData?.order || {}), isPaid: true });
      setStep(3);
      clearCart();
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      addToast('Payment verified successfully via Razorpay!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Payment verification failed', 'error');
    } finally {
      setProcessingRzpPayment(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in or continue as demo account to complete order', 'error');
      navigate('/auth?redirect=checkout');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice,
        totalPrice,
        deliveryOption,
        deliveryOptionName: selectedDeliveryOptionObj?.name || '4-Hour Express',
        estimatedDeliveryTime: selectedDeliveryOptionObj?.time || 'Within 4 Hours',
      };

      // 1. Create order in database
      const { data: orderResponse } = await api.post('/orders', orderPayload);
      const newOrder = orderResponse.order;

      // 2. If Razorpay / Online payment selected
      if (paymentMethod === 'Razorpay' || paymentMethod === 'Credit/Debit Card' || paymentMethod === 'UPI / NetBanking') {
        const { data: rzpData } = await api.post('/orders/razorpay/create-order', {
          amount: totalPrice,
          orderId: newOrder._id,
          currency: 'INR',
          receipt: `rcpt_${newOrder.orderNumber}`,
        });

        const isRealKey =
          rzpData.keyId &&
          !rzpData.keyId.includes('Demo') &&
          !rzpData.keyId.includes('placeholder') &&
          !rzpData.keyId.includes('your_') &&
          !rzpData.isDemo;

        if (isRealKey) {
          const isScriptLoaded = await loadRazorpayScript();
          if (isScriptLoaded && window.Razorpay) {
            const options = {
              key: rzpData.keyId,
              amount: rzpData.amount,
              currency: rzpData.currency || 'INR',
              name: 'NEXUS Multi-Vendor Platform',
              description: `Payment for Order #${newOrder.orderNumber}`,
              image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&auto=format&fit=crop&q=80',
              order_id: rzpData.orderId,
              prefill: {
                name: formData.fullName,
                email: formData.email,
                contact: formData.phone,
              },
              theme: { color: '#0d9488' },
              handler: (response) => {
                completeRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: newOrder._id,
                });
              },
              modal: {
                ondismiss: () => {
                  setLoading(false);
                  addToast('Payment cancelled. Track order in My Orders.', 'info');
                  setCreatedOrder(newOrder);
                  setStep(3);
                  clearCart();
                },
              },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => {
              // Open in-app sandbox if live network fails
              setRzpPendingData({ order: newOrder, rzpData });
              setShowRazorpayModal(true);
            });
            rzp.open();
            setLoading(false);
            return;
          }
        }

        // Open in-app interactive Razorpay Sandbox Checkout Modal
        setRzpPendingData({ order: newOrder, rzpData });
        setShowRazorpayModal(true);
        setLoading(false);
        return;
      }

      // Default COD or direct orders
      setCreatedOrder(newOrder);
      setStep(3);
      clearCart();

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });
      addToast('Order placed successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Your bag is empty</h2>
        <Link to="/shop" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  // STEP 3: Order Success Screen
  if (step === 3 && createdOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-xl border border-emerald-200">
          <FiCheckCircle />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Order Confirmed & Processing
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Thank you, {formData.fullName}!
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Your order <strong>{createdOrder.orderNumber}</strong> has been received and dispatched to our logistics hub.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-left max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold">
            <span className="text-slate-500">Tracking Code:</span>
            <span className="text-brand-600 font-mono">{createdOrder.trackingNumber}</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold">
            <span className="text-slate-500">Delivery Speed:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200 text-[11px] font-black">
              {createdOrder.deliveryOptionName ||
                (createdOrder.deliveryOption === 'instant'
                  ? '⚡ Instant Delivery (30-45 mins)'
                  : createdOrder.deliveryOption === 'nextday'
                  ? '🚚 Next Day Delivery'
                  : '🕒 4-Hour Express Delivery')}
            </span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold">
            <span className="text-slate-500">Estimated Arrival:</span>
            <span className="text-emerald-700 font-extrabold">
              {createdOrder.estimatedDeliveryTime || (createdOrder.deliveryOption === 'instant' ? '30 - 45 Mins' : 'Within 4 Hours')}
            </span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold">
            <span className="text-slate-500">Delivery Address:</span>
            <span className="text-slate-900 text-right">
              {createdOrder.shippingAddress.street}, {createdOrder.shippingAddress.city}, {createdOrder.shippingAddress.postalCode}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm font-extrabold">
            <span>Total Paid:</span>
            <span className="text-brand-600 text-lg">{formatPrice(createdOrder.totalPrice)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/orders"
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Track Order in My Orders
          </Link>
          <Link
            to="/shop"
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Checkout Step Breadcrumbs */}
      <div className="flex items-center justify-center gap-4 mb-10 text-xs font-bold">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>
            1
          </span>
          <span>Shipping Address</span>
        </div>
        <div className="w-8 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200'}`}>
            2
          </span>
          <span>Payment & Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Step 1: Shipping Form (7 cols) */}
        {step === 1 && (
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Delivery & Contact Information</h2>
                <p className="text-xs text-slate-400 mt-0.5">Enter the recipient address for parcel dispatch.</p>
              </div>
              {user?.address?.street ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
                  ✓ Saved Address Loaded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-fit">
                  📍 Enter Delivery Address
                </span>
              )}
            </div>

            <form onSubmit={handleShippingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Recipient Name</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-brand-500 font-semibold"
                  />
                </div>
              </div>

              {/* Indore Locality Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Indore Delivery Zone / Locality
                </label>
                <select
                  value={selectedIndoreArea}
                  onChange={handleAreaChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-[#0d9488] focus:bg-white transition-all cursor-pointer"
                >
                  {INDORE_AREAS.map((area, idx) => (
                    <option key={idx} value={area.name}>
                      {area.name} (PIN: {area.zip})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Street Address / House / Flat No.
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="e.g. 104, Scheme No 54, Near Meghdoot Garden, Vijay Nagar"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0d9488] focus:bg-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">City (Locked)</label>
                  <input
                    type="text"
                    name="city"
                    readOnly
                    value={formData.city}
                    className="w-full px-3 py-2.5 bg-teal-50 border border-teal-200 text-teal-900 font-black rounded-xl text-xs outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    readOnly
                    value={formData.state}
                    className="w-full px-3 py-2.5 bg-teal-50 border border-teal-200 text-teal-900 font-black rounded-xl text-xs outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Indore Pincode</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="452010"
                    maxLength={6}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#0d9488] focus:bg-white font-semibold"
                  />
                </div>
              </div>

              {/* Delivery Speed Options (Instant, 4-Hour, Next Day) */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <span>⚡ Choose Delivery Speed</span>
                  </label>
                  <span className="text-[11px] text-orange-600 font-bold">Fast Indore Dispatch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {deliveryOptions.map((opt) => {
                    const isSelected = deliveryOption === opt.id;
                    const price =
                      opt.freeAbove > 0 && itemsPrice >= opt.freeAbove
                        ? opt.discountedPrice !== undefined
                          ? opt.discountedPrice
                          : 0
                        : opt.price !== undefined
                        ? opt.price
                        : 0;
                    const badgeClass =
                      opt.badgeColor ||
                      (opt.badge === 'Fastest Delivery'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : opt.badge === 'Most Popular'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-blue-100 text-blue-900 border-blue-300');

                    return (
                      <div
                        key={opt.id}
                        onClick={() => setDeliveryOption(opt.id)}
                        className={`relative p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/40 shadow-sm ring-2 ring-orange-500/10'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        {/* Top Badge */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          {opt.badge ? (
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badgeClass}`}>
                              {opt.badge}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">Delivery Tier</span>
                          )}
                          <span className="text-base">{opt.icon || '🚚'}</span>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-900">{opt.name}</h4>
                          <p className="text-[11px] font-bold text-orange-600 mt-0.5">{opt.time}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-snug">{opt.description}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium text-[10px]">Delivery Fee:</span>
                          <span className="font-black text-slate-900">
                            {price === 0 ? <span className="text-emerald-600 font-black">FREE</span> : `₹${price}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Hyperlocal Indore Notice */}
              <div className="p-3 bg-[#e5f3f3]/70 rounded-xl border border-teal-200 text-[11px] font-bold text-teal-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>📍 Hyperlocal Dispatch: Dedicated courier fleet active across Indore City & Suburbs.</span>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Continue to Payment Method</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Payment Method (7 cols) */}
        {step === 2 && (
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Payment Simulation</h2>
                <p className="text-xs text-slate-400 mt-1">Select your preferred payment gateway.</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-brand-600 font-bold hover:underline"
              >
                Edit Address
              </button>
            </div>

            {/* Payment Options */}
            <div className="space-y-3">
              {[
                {
                  id: 'Razorpay',
                  badge: 'Fast & Secure (Recommended)',
                  icon: (
                    <div className="flex items-center gap-1 font-black text-xs text-blue-700">
                      <FiZap className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Razorpay</span>
                    </div>
                  ),
                  desc: 'UPI (GPay / PhonePe / Paytm), Credit / Debit Cards & NetBanking',
                  tags: ['UPI', 'Cards', 'NetBanking', 'Wallets'],
                },
                {
                  id: 'Cash on Delivery',
                  badge: null,
                  icon: <FiTruck className="w-5 h-5 text-emerald-600" />,
                  desc: 'Pay with cash or UPI QR upon package arrival at your doorstep',
                  tags: ['Pay at Doorstep'],
                },
                {
                  id: 'PayPal',
                  badge: 'International',
                  icon: <RiPaypalLine className="w-5 h-5 text-blue-600" />,
                  desc: 'Fast checkout with standard PayPal gateway',
                  tags: ['PayPal Wallet'],
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all gap-3 ${
                    paymentMethod === opt.id
                      ? 'border-brand-600 bg-brand-50/50 shadow-sm ring-1 ring-brand-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={paymentMethod === opt.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-brand-600 accent-brand-600 w-4 h-4 mt-1 sm:mt-0"
                    />
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shrink-0">{opt.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{opt.id}</span>
                        {opt.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {opt.tags.map((tag) => (
                          <span key={tag} className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {paymentMethod === opt.id && (
                    <span className="text-brand-600 font-bold text-xs shrink-0 self-end sm:self-center">✓ Selected</span>
                  )}
                </label>
              ))}
            </div>

            {/* Simulated Card Form if Card selected */}
            {paymentMethod === 'Credit/Debit Card' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 font-bold block mb-1">Simulated Card Number</label>
                  <input
                    type="text"
                    disabled
                    value={cardDetails.cardNumber}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-700"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Expiry</label>
                    <input
                      type="text"
                      disabled
                      value={cardDetails.expDate}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Security Code</label>
                    <input
                      type="text"
                      disabled
                      value={cardDetails.cvv}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-700"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs"
              >
                Back
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <FiLock className="w-4 h-4" />
                <span>{loading ? 'Processing Order...' : `Authorize & Pay ${formatPrice(totalPrice)}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Order Items Preview (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-28">
          <h3 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            Order Review ({cartItems.length} items)
          </h3>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product} className="py-3 flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                  <span className="text-[11px] text-slate-400">Qty: {item.quantity}</span>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Code Box */}
          <div className="pt-2">
            {coupon ? (
              <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-300 rounded-2xl">
                <div className="flex items-center gap-2">
                  <FiTag className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-black text-emerald-950">{coupon.code} Applied</span>
                    <span className="text-[10px] text-emerald-700 block font-semibold">
                      Save ₹{discountPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
                  title="Remove Coupon"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (checkoutCouponCode.trim()) {
                    applyCoupon(checkoutCouponCode);
                    setCheckoutCouponCode('');
                  }
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={checkoutCouponCode}
                  onChange={(e) => setCheckoutCouponCode(e.target.value.toUpperCase())}
                  placeholder="Promo Code (e.g. INDORE50)"
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:bg-white focus:border-brand-500 outline-hidden"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Items Total</span>
              <span className="font-bold text-slate-900">{formatPrice(itemsPrice)}</span>
            </div>
            {discountPrice > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount ({coupon?.code || 'PROMO'})</span>
                <span>-{formatPrice(discountPrice)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span className="flex items-center gap-1">
                <span>Shipping:</span>
                <span className="text-slate-800 font-bold">
                  {selectedDeliveryOptionObj ? `${selectedDeliveryOptionObj.icon} ${selectedDeliveryOptionObj.name}` : 'Standard'}
                </span>
              </span>
              <span className="font-bold text-slate-900">{shippingPrice === 0 ? <span className="text-emerald-600 font-black">FREE</span> : formatPrice(shippingPrice)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span className="font-bold text-slate-900">{formatPrice(taxPrice)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-brand-600 text-base">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* RAZORPAY SECURE PAYMENT MODAL */}
      {showRazorpayModal && rzpPendingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
            {/* Razorpay Brand Header */}
            <div className="bg-gradient-to-r from-[#0C2340] to-[#1a365d] p-6 text-white relative">
              <button
                onClick={() => {
                  setShowRazorpayModal(false);
                  addToast('Payment cancelled. Track order in My Orders.', 'info');
                  setCreatedOrder(rzpPendingData.order);
                  setStep(3);
                  clearCart();
                }}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
              >
                <FiX className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-[#3395FF] flex items-center justify-center text-white font-black text-xs shadow-md">
                  R
                </div>
                <div className="flex items-center gap-1.5 font-extrabold text-sm tracking-wide text-white">
                  <span>Razorpay</span>
                  <span className="text-[10px] uppercase font-bold bg-[#3395FF]/30 text-[#3395FF] px-2 py-0.5 rounded-full">
                    Trusted Secure
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className="text-[11px] text-slate-300">Amount Payable</div>
                  <div className="text-2xl font-black text-white">
                    {formatPrice(rzpPendingData.order?.totalPrice || totalPrice)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-300">Order Ref</div>
                  <div className="text-xs font-mono font-bold text-teal-300">
                    {rzpPendingData.order?.orderNumber}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 text-xs font-bold">
              {[
                { id: 'upi', label: 'UPI / QR', icon: <RiQrCodeLine className="w-4 h-4" /> },
                { id: 'card', label: 'Cards', icon: <FiCreditCard className="w-4 h-4" /> },
                { id: 'netbanking', label: 'NetBanking', icon: <FiGlobe className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRzpActiveTab(tab.id)}
                  className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition-all border-b-2 ${
                    rzpActiveTab === tab.id
                      ? 'border-[#0C2340] text-[#0C2340] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* TAB 1: UPI */}
              {rzpActiveTab === 'upi' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-blue-600 font-black text-sm">
                        UPI
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Instant UPI Apps</div>
                        <div className="text-[10px] text-slate-500">GPay, PhonePe, Paytm, BHIM</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                      0% Fee
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Enter UPI ID / VPA</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        placeholder="yourname@okaxis"
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#0C2340]"
                      />
                      <button
                        onClick={() => setUpiIdInput('demo.buyer@okaxis')}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>

                  {/* Popular UPI Apps Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-700">
                    <div className="p-2.5 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl cursor-pointer">
                      Google Pay
                    </div>
                    <div className="p-2.5 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-xl cursor-pointer">
                      PhonePe
                    </div>
                    <div className="p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl cursor-pointer">
                      Paytm UPI
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CARDS */}
              {rzpActiveTab === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Card Number</label>
                    <input
                      type="text"
                      readOnly
                      value="4111 •••• •••• 1111"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Valid Thru</label>
                      <input
                        type="text"
                        readOnly
                        value="12 / 29"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">CVV</label>
                      <input
                        type="text"
                        readOnly
                        value="888"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                    <FiShield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Test Sandbox Visa Card pre-filled for 1-click verification</span>
                  </div>
                </div>
              )}

              {/* TAB 3: NETBANKING */}
              {rzpActiveTab === 'netbanking' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">Popular Banks</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                      <button
                        key={bank}
                        onClick={() => addToast(`Selected ${bank}`, 'info')}
                        className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left"
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Authorize & Pay Button */}
              <button
                onClick={() =>
                  completeRazorpayPayment({
                    orderId: rzpPendingData.order?._id,
                    razorpay_order_id: rzpPendingData.rzpData?.orderId || `order_${Date.now()}`,
                    razorpay_payment_id: `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
                    razorpay_signature: 'demo_sig_approved',
                  })
                }
                disabled={processingRzpPayment}
                className="w-full py-4 bg-[#0C2340] hover:bg-[#1a365d] text-white font-extrabold text-xs rounded-2xl shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <FiLock className="w-4 h-4 text-emerald-400" />
                <span>
                  {processingRzpPayment
                    ? 'Verifying Payment...'
                    : `Pay ${formatPrice(rzpPendingData.order?.totalPrice || totalPrice)} via Razorpay`}
                </span>
              </button>

              <div className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <FiShield className="w-3 h-3 text-emerald-600" />
                <span>Secured by 256-bit Razorpay PCI-DSS Level 1 Encryption</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
