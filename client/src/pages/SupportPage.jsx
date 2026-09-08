import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiHeadphones,
  FiShield,
  FiMessageSquare,
  FiPhone,
  FiMail,
  FiSend,
  FiArrowLeft,
  FiPackage,
  FiShoppingBag,
  FiClock,
  FiHelpCircle,
  FiChevronRight,
  FiExternalLink,
} from 'react-icons/fi';
import { formatPrice } from '../utils/helpers';

export const SupportPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Attached context passed via router state or query params
  const [attachedProduct, setAttachedProduct] = useState(location.state?.product || null);
  const [attachedOrder, setAttachedOrder] = useState(location.state?.order || null);
  const [loadingContext, setLoadingContext] = useState(false);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);

  const supportPhone = '1800-419-6398';
  const supportEmail = 'support@nexuscommerce.in';

  // Load context from query parameters if needed
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const productId = searchParams.get('productId');
    const orderId = searchParams.get('orderId');

    const loadParamsContext = async () => {
      if (productId && !attachedProduct) {
        setLoadingContext(true);
        try {
          const { data } = await api.get(`/products/${productId}`);
          if (data.product || data) {
            setAttachedProduct(data.product || data);
          }
        } catch (err) {
          console.error('Failed to load inquiry product:', err);
        } finally {
          setLoadingContext(false);
        }
      }

      if (orderId && !attachedOrder && isAuthenticated) {
        setLoadingContext(true);
        try {
          const { data } = await api.get(`/orders/${orderId}`);
          if (data.order || data) {
            setAttachedOrder(data.order || data);
          }
        } catch (err) {
          console.error('Failed to load inquiry order:', err);
        } finally {
          setLoadingContext(false);
        }
      }
    };

    loadParamsContext();
  }, [location.search, isAuthenticated]);

  // Fetch admin support info
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const { data } = await api.get('/chat/admin-info');
        if (data.admin) {
          setAdminUser(data.admin);
        }
      } catch (err) {
        console.error('Failed to load admin support info:', err);
      }
    };
    fetchAdminInfo();
  }, []);

  const targetAdminId = adminUser?._id || 'admin';

  // Quick prompt chips
  const quickPrompts = attachedOrder
    ? [
        `When will Order #${attachedOrder.orderNumber} be delivered?`,
        `I need delivery timing assistance for Order #${attachedOrder.orderNumber}.`,
        `Can you help me update the address for Order #${attachedOrder.orderNumber}?`,
      ]
    : attachedProduct
    ? [
        `Is "${attachedProduct.name?.slice(0, 28)}..." in stock for express delivery?`,
        `Can you provide bulk contractor pricing for this item?`,
        `What is the warranty and installation support for this product?`,
      ]
    : [
        'Hi, I have a question about express delivery in Indore.',
        'How can I get contractor discounts for bulk orders?',
        'What is your warranty and return policy?',
      ];

  // Socket.IO
  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socketRef.current = socket;
    socket.emit('join_user_room', user._id);

    const handleIncomingMessage = (payload) => {
      const msg = payload.message || payload;
      if (
        (msg.sender?._id || msg.sender) === targetAdminId ||
        (msg.recipient?._id || msg.recipient) === user._id
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('new_chat_message', handleIncomingMessage);

    return () => {
      socket.off('new_chat_message', handleIncomingMessage);
      socket.disconnect();
    };
  }, [isAuthenticated, user?._id, targetAdminId]);

  // Fetch History
  useEffect(() => {
    if (!isAuthenticated || !targetAdminId || targetAdminId === 'admin') return;

    const fetchHistory = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await api.get(`/chat/messages/${targetAdminId}`);
        if (data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load support chat history:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchHistory();
  }, [targetAdminId, isAuthenticated]);

  // Auto scroll chat messages container only (does not pull browser window to footer)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    if (!isAuthenticated) {
      addToast('Please log in to chat with Nexus Support', 'error');
      navigate('/auth?redirect=support');
      return;
    }

    setSending(true);
    try {
      const payload = {
        recipientId: targetAdminId,
        message: text,
        orderId: attachedOrder?._id || null,
        orderNumber: attachedOrder?.orderNumber || '',
        productId: attachedProduct?._id || null,
        productName: attachedProduct?.name || '',
        productImage:
          (attachedProduct?.images && attachedProduct?.images[0]) ||
          attachedProduct?.image ||
          '',
      };

      const { data } = await api.post('/chat/send', payload);
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const faqs = [
    {
      q: 'Express Delivery Time?',
      a: 'Same-day or next-morning fulfillment across Indore postal codes.',
    },
    {
      q: 'GST Invoices & Bulk Rates?',
      a: 'All products include genuine GST tax invoices. Ask desk for project rates.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 py-6">
      {/* Compact Centered Container (max-w-5xl) */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Compact Navigation & Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-700 transition-all shadow-2xs flex items-center gap-1 font-bold text-xs cursor-pointer"
            >
              <FiArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Nexus Support Desk
              </h1>
              <span className="bg-[#fae125] text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border border-yellow-400">
                <FiShield className="w-2.5 h-2.5 text-black" /> Official
              </span>
            </div>
          </div>

          {/* Helpline badge */}
          <a
            href={`tel:${supportPhone.replace(/\D/g, '')}`}
            className="flex items-center gap-1.5 bg-white hover:bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl shadow-2xs transition-all text-teal-800 text-xs font-bold"
          >
            <FiPhone className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Helpline:</span>
            <span className="font-mono font-black">{supportPhone}</span>
          </a>
        </div>

        {/* Compact 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          
          {/* LEFT COLUMN: 4 COLS (Context & Helpline Summary) */}
          <div className="md:col-span-4 space-y-3.5">
            
            {/* Attached Context Card */}
            {(attachedProduct || attachedOrder) && (
              <div className="bg-white rounded-2xl p-3.5 border border-teal-300 shadow-xs relative overflow-hidden">
                <div className="text-[10px] font-black text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                  {attachedOrder ? (
                    <>
                      <FiPackage className="w-3.5 h-3.5 text-teal-600" /> Attached Order
                    </>
                  ) : (
                    <>
                      <FiShoppingBag className="w-3.5 h-3.5 text-teal-600" /> Attached Product
                    </>
                  )}
                </div>

                {attachedProduct && (
                  <div className="flex items-center gap-2.5 bg-teal-50/60 p-2.5 rounded-xl border border-teal-100">
                    <img
                      src={
                        (attachedProduct.images && attachedProduct.images[0]) ||
                        attachedProduct.image ||
                        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=200'
                      }
                      alt={attachedProduct.name}
                      className="w-11 h-11 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-900 truncate leading-tight">
                        {attachedProduct.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-teal-700">
                          {formatPrice(attachedProduct.price)}
                        </span>
                        {attachedProduct.brand && (
                          <span className="text-[9px] bg-white px-1.5 py-0.2 rounded border border-slate-200 text-slate-600 font-semibold">
                            {attachedProduct.brand}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {attachedOrder && (
                  <div className="bg-teal-50/60 p-2.5 rounded-xl border border-teal-100 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Order:</span>
                      <span className="font-mono font-bold text-teal-800">#{attachedOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-black text-slate-900">{formatPrice(attachedOrder.totalPrice)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Helpline Contacts Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold shrink-0">
                  <FiPhone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-slate-900">Direct Platform Care</h3>
                  <p className="text-[10px] text-slate-400">24x7 Customer Support</p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <a
                  href={`tel:${supportPhone.replace(/\D/g, '')}`}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <FiPhone className="w-3.5 h-3.5 text-[#fae125]" /> Call {supportPhone}
                  </span>
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full uppercase">Free</span>
                </a>

                <a
                  href={`mailto:${supportEmail}`}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] transition-all"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <FiMail className="w-3.5 h-3.5 text-teal-600 shrink-0" /> {supportEmail}
                  </span>
                </a>
              </div>

              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-1.5 text-emerald-900 text-[10px] font-medium">
                <FiClock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Response time: <strong>&lt; 5 mins</strong></span>
              </div>
            </div>

            {/* Quick FAQ Section */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <FiHelpCircle className="w-3.5 h-3.5 text-teal-600" /> FAQs
              </h3>
              <div className="space-y-1.5 text-[11px]">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="font-bold text-slate-900 mb-0.5">{faq.q}</div>
                    <div className="text-slate-500 leading-snug">{faq.a}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: 8 COLS (Compact Live Chat Box) */}
          <div className="md:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col h-[520px] overflow-hidden">
              
              {/* Compact Chat Header */}
              <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-[#0f766e] via-[#0d9488] to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#fae125] flex items-center justify-center text-slate-950 font-black shadow-xs shrink-0">
                    <FiMessageSquare className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-sm text-white">Live Platform Support Desk</h2>
                      <span className="bg-emerald-400 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-slate-950 animate-pulse"></span> Online
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-100 font-medium">
                      Direct real-time messaging with Platform Admins
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Sub-Banner if Context Attached */}
              {(attachedProduct || attachedOrder) && (
                <div className="shrink-0 bg-teal-50 border-b border-teal-100 px-4 py-1.5 text-xs flex items-center justify-between text-teal-950">
                  <div className="flex items-center gap-1.5 truncate">
                    {attachedOrder ? (
                      <>
                        <FiPackage className="text-teal-700 shrink-0 w-3.5 h-3.5" />
                        <span className="font-bold truncate">Inquiry for Order #{attachedOrder.orderNumber}</span>
                      </>
                    ) : (
                      <>
                        <FiShoppingBag className="text-teal-700 shrink-0 w-3.5 h-3.5" />
                        <span className="font-bold truncate">Inquiry for: {attachedProduct.name}</span>
                      </>
                    )}
                  </div>
                  <span className="text-[9px] bg-teal-200 text-teal-950 font-bold px-2 py-0.2 rounded-full shrink-0">
                    Attached Context
                  </span>
                </div>
              )}

              {/* Messages Body Scroll Area */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center py-10">
                    <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : !isAuthenticated ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2.5">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
                      <FiMessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Log in to Chat with Support
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Sign in to send instant messages and receive real-time updates.
                    </p>
                    <Link
                      to="/auth?redirect=support"
                      className="px-4 py-2 bg-[#0d9488] hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      Log In / Sign Up
                    </Link>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-5 px-3 max-w-md mx-auto">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center mx-auto mb-2">
                      <FiMessageSquare className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Welcome to Nexus Support Desk!
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select a prompt below or type your inquiry.
                    </p>

                    {/* Quick Smart Inquiry Starters */}
                    <div className="mt-3.5 space-y-1.5 text-left">
                      {quickPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="w-full text-xs bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
                        >
                          <span className="truncate">&bull; {prompt}</span>
                          <FiSend className="w-3 h-3 text-slate-400 group-hover:text-teal-700 shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine =
                      (msg.sender?._id || msg.sender) === user?._id ||
                      msg.senderRole === 'user';

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        {(msg.productName || msg.orderNumber) && (
                          <div className="text-[9px] text-slate-500 font-bold mb-0.5 flex items-center gap-1 px-1">
                            {msg.orderNumber && (
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 flex items-center gap-1">
                                <FiPackage className="w-2.5 h-2.5 text-teal-600" /> Order #{msg.orderNumber}
                              </span>
                            )}
                            {msg.productName && (
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200 flex items-center gap-1 max-w-xs truncate">
                                <FiShoppingBag className="w-2.5 h-2.5 text-teal-600" /> {msg.productName}
                              </span>
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs font-medium ${
                            isMine
                              ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>

                        <span className="text-[9px] text-slate-400 font-medium mt-0.5 px-1 flex items-center gap-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {isMine && (
                            <span className="text-teal-600 font-bold ml-1">
                              {msg.read ? '• Seen' : '• Sent'}
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div className="shrink-0 p-3 bg-white border-t border-slate-200">
                {isAuthenticated ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Type your question here..."
                      className="flex-1 bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={sending || !inputText.trim()}
                      className="h-9 px-4 rounded-xl bg-[#fae125] hover:bg-yellow-300 text-slate-950 font-black text-xs disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer border border-yellow-400"
                    >
                      <span>Send</span>
                      <FiSend className="w-3.5 h-3.5 text-black" />
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-1 text-xs text-slate-500">
                    Please <Link to="/auth?redirect=support" className="text-teal-700 font-bold underline">log in</Link> to chat.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
