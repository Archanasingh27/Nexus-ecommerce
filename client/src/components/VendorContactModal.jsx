import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiX,
  FiPhone,
  FiMessageSquare,
  FiSend,
  FiCheck,
  FiCheckCircle,
  FiShoppingBag,
  FiPackage,
  FiClock,
  FiShield,
  FiExternalLink,
} from 'react-icons/fi';
import { RiWhatsappLine } from 'react-icons/ri';
import { formatDate } from '../utils/helpers';

export const VendorContactModal = ({
  isOpen,
  onClose,
  vendor,
  order = null,
  product = null,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'call' | 'whatsapp'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const vendorId = vendor?._id || vendor?.vendor || (typeof vendor === 'string' ? vendor : null);
  const vendorName = vendor?.storeName || vendor?.name || 'Store Vendor';
  const vendorPhone = vendor?.phone || vendor?.vendorPhone || vendor?.businessPhone || '9876543210';
  const cleanPhone = vendorPhone.replace(/\D/g, '');

  const quickPrompts = order
    ? [
        `Hi, when will Order #${order.orderNumber} be packed?`,
        `Can you provide an update on delivery for Order #${order.orderNumber}?`,
        `I need assistance with items in Order #${order.orderNumber}.`,
      ]
    : product
    ? [
        `Is "${product.name}" in stock and ready to ship?`,
        `Can you provide more technical details for this product?`,
        `What is the warranty period for this item?`,
      ]
    : [
        'Hi, I have an inquiry regarding your store products.',
        'What are your estimated delivery times within Indore?',
      ];

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !user?._id) return;

    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:5000';

    const socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 2,
      timeout: 4000,
    });

    socket.on('connect_error', () => {
      // Graceful fallback for serverless hosting
    });
    socketRef.current = socket;

    socket.emit('join_user_room', user._id);

    socket.on('new_chat_message', (payload) => {
      const msg = payload.message || payload;
      if (
        (msg.sender?._id || msg.sender) === vendorId ||
        (msg.recipient?._id || msg.recipient) === vendorId
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, isAuthenticated, user?._id, vendorId]);

  // Fetch Message History
  useEffect(() => {
    if (!isOpen || !vendorId || !isAuthenticated) return;

    const fetchHistory = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await api.get(`/chat/messages/${vendorId}`);
        if (data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchHistory();
  }, [isOpen, vendorId, isAuthenticated]);

  // Auto scroll to bottom
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    if (!isAuthenticated) {
      addToast('Please login to send messages to the vendor', 'error');
      return;
    }
    if (!vendorId) {
      addToast('Vendor details unavailable for chat', 'error');
      return;
    }

    setSending(true);
    try {
      const payload = {
        recipientId: vendorId,
        message: text,
        orderId: order?._id || null,
        orderNumber: order?.orderNumber || '',
        productId: product?._id || null,
        productName: product?.name || '',
        productImage: (product?.images && product?.images[0]) || product?.image || '',
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

  if (!isOpen) return null;

  // WhatsApp Pre-filled text
  const waContextText = order
    ? `Hello ${vendorName}, I am contacting you regarding Order #${order.orderNumber} placed on NEXUS Commerce.`
    : product
    ? `Hello ${vendorName}, I have a question regarding "${product.name}" on NEXUS Commerce.`
    : `Hello ${vendorName}, I would like to inquire about products from your store on NEXUS Commerce.`;

  const waUrl = `https://wa.me/91${cleanPhone.length === 10 ? cleanPhone : '9876543210'}?text=${encodeURIComponent(
    waContextText
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden max-h-[90vh] sm:max-h-[640px]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-lg">
              {vendorName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-white">{vendorName}</h3>
                <span className="bg-teal-400/20 text-teal-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 border border-teal-400/30">
                  <FiCheckCircle className="w-2.5 h-2.5" /> Verified Seller
                </span>
              </div>
              <p className="text-xs text-teal-200/80 font-medium">Direct Store Support & Inquiries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1.5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'chat'
                ? 'bg-white text-teal-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <FiMessageSquare className="w-3.5 h-3.5" /> Live In-App Chat
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'call'
                ? 'bg-white text-teal-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <FiPhone className="w-3.5 h-3.5" /> Direct Call
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <RiWhatsappLine className="w-4 h-4 text-emerald-600" /> WhatsApp
          </button>
        </div>

        {/* Context Banner (Order or Product if provided) */}
        {(order || product) && (
          <div className="bg-amber-50/80 border-b border-amber-100 px-4 py-2 text-xs flex items-center justify-between text-amber-900">
            <div className="flex items-center gap-2 truncate">
              {order ? (
                <>
                  <FiPackage className="text-amber-600 shrink-0 w-3.5 h-3.5" />
                  <span className="font-bold">Inquiry for Order #{order.orderNumber}</span>
                  <span className="text-slate-500 font-medium hidden sm:inline">
                    (₹{order.totalPrice?.toLocaleString('en-IN')})
                  </span>
                </>
              ) : (
                <>
                  <FiShoppingBag className="text-amber-600 shrink-0 w-3.5 h-3.5" />
                  <span className="font-bold truncate">Product: {product.name}</span>
                </>
              )}
            </div>
            <span className="text-[10px] bg-amber-200/60 text-amber-950 font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
              Attached to Thread
            </span>
          </div>
        )}

        {/* TAB 1: LIVE IN-APP CHAT */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                    <FiMessageSquare className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Start a conversation with {vendorName}</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Ask questions regarding inventory, order fulfillment, delivery timings, or special requests.
                  </p>

                  {/* Quick Prompts */}
                  <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[11px] bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-600 font-medium transition-all shadow-2xs text-left"
                      >
                        "{prompt}"
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
                      {/* Context badge inside bubble if message references a specific order/product */}
                      {msg.orderNumber && (
                        <div className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                          <FiPackage className="w-2.5 h-2.5" /> Order #{msg.orderNumber}
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium ${
                          isMine
                            ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isMine && (
                          <span className="ml-1 text-teal-600">
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

            {/* Message Composer */}
            <div className="p-3 bg-white border-t border-slate-200">
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
                  placeholder={`Write a message to ${vendorName}...`}
                  className="flex-1 bg-slate-100/80 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="w-10 h-10 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
                >
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT PHONE CALL */}
        {activeTab === 'call' && (
          <div className="p-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto shadow-sm">
              <FiPhone className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-base">Direct Voice Call Support</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Connect directly with the store manager at <span className="font-semibold text-slate-700">{vendorName}</span> for immediate updates.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm mx-auto space-y-1">
              <div className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Verified Seller Hotline</div>
              <div className="text-lg font-mono font-black text-slate-900">+91 {cleanPhone || '9876543210'}</div>
              <div className="text-[10px] text-teal-700 font-semibold">Available Mon - Sat (10:00 AM - 8:00 PM)</div>
            </div>

            <a
              href={`tel:+91${cleanPhone || '9876543210'}`}
              className="inline-flex items-center justify-center gap-2 w-full max-w-sm py-3.5 bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-700/20 transition-all transform active:scale-98"
            >
              <FiPhone className="w-4 h-4" /> Call Seller Now
            </a>
          </div>
        )}

        {/* TAB 3: WHATSAPP CHAT */}
        {activeTab === 'whatsapp' && (
          <div className="p-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
              <RiWhatsappLine className="w-8 h-8" />
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-base">Instant WhatsApp Support</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Launch a direct WhatsApp chat thread with <span className="font-semibold text-slate-700">{vendorName}</span> with your order or product context pre-filled.
              </p>
            </div>

            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 max-w-sm mx-auto text-left text-xs text-emerald-950 font-medium">
              <div className="text-[10px] uppercase font-bold text-emerald-700 mb-1">Pre-filled Message Preview:</div>
              <p className="italic bg-white p-3 rounded-xl border border-emerald-100 text-slate-700">
                "{waContextText}"
              </p>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full max-w-sm py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 transition-all transform active:scale-98"
            >
              <RiWhatsappLine className="w-5 h-5" /> Open WhatsApp Chat <FiExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
