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
  FiShoppingBag,
  FiPackage,
  FiShield,
  FiHeadphones,
} from 'react-icons/fi';

export const SupportChatModal = ({
  isOpen,
  onClose,
  order = null,
  product = null,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'call'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch central admin support info
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen]);

  const targetAdminId = adminUser?._id || 'admin';
  const supportName = 'Nexus Support Desk';
  const supportPhone = '1800-419-6398'; // Toll free support
  const supportEmail = 'support@nexuscommerce.in';

  const quickPrompts = order
    ? [
        `When will Order #${order.orderNumber} be delivered?`,
        `I need assistance with delivery timing for Order #${order.orderNumber}.`,
        `Can you help me update the address for Order #${order.orderNumber}?`,
      ]
    : product
    ? [
        `Is "${product.name?.slice(0, 32)}..." in stock for express delivery?`,
        `Can you provide bulk contractor pricing for this item?`,
        `What is the warranty and installation support for this product?`,
      ]
    : [
        'Hi, I have a question about products and express delivery in Indore.',
        'How can I get contractor discounts for bulk orders?',
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
  }, [isOpen, isAuthenticated, user?._id, targetAdminId]);

  // Fetch Message History with Admin
  useEffect(() => {
    if (!isOpen || !isAuthenticated || !targetAdminId || targetAdminId === 'admin') return;

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
  }, [isOpen, targetAdminId, isAuthenticated]);

  // Auto scroll to bottom of chat container
  useEffect(() => {
    if (activeTab === 'chat' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;
    if (!isAuthenticated) {
      addToast('Please login to chat with Nexus Support', 'error');
      return;
    }

    setSending(true);
    try {
      const payload = {
        recipientId: targetAdminId,
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

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden h-[540px] max-h-[82vh] animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="shrink-0 px-4 py-3 bg-gradient-to-r from-[#0f766e] via-[#0d9488] to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#fae125] border border-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-xs shrink-0">
              <FiHeadphones className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-sm text-white">{supportName}</h3>
                <span className="bg-[#fae125] text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs border border-yellow-400">
                  <FiShield className="w-2.5 h-2.5 text-black" /> Official Support
                </span>
              </div>
              <p className="text-[11px] text-teal-100 font-medium">Direct Admin & Customer Helpdesk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="shrink-0 flex border-b border-slate-100 bg-slate-50/70 p-1.5 gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-teal-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <FiMessageSquare className="w-3.5 h-3.5" /> Live Support Chat
          </button>
          <button
            onClick={() => setActiveTab('call')}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'call'
                ? 'bg-white text-teal-700 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <FiPhone className="w-3.5 h-3.5" /> Support Helpline
          </button>
        </div>

        {/* Context Banner (Order or Product if provided) */}
        {(order || product) && (
          <div className="shrink-0 bg-teal-50 border-b border-teal-100 px-3.5 py-1.5 text-xs flex items-center justify-between text-teal-950">
            <div className="flex items-center gap-2 truncate">
              {order ? (
                <>
                  <FiPackage className="text-teal-700 shrink-0 w-3.5 h-3.5" />
                  <span className="font-bold truncate">Order #{order.orderNumber}</span>
                  <span className="text-slate-500 font-medium hidden sm:inline">
                    (₹{order.totalPrice?.toLocaleString('en-IN')})
                  </span>
                </>
              ) : (
                <>
                  <FiShoppingBag className="text-teal-700 shrink-0 w-3.5 h-3.5" />
                  <span className="font-bold truncate">Inquiry: {product.name}</span>
                </>
              )}
            </div>
            <span className="text-[9px] bg-teal-200/70 text-teal-950 font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">
              Attached to Ticket
            </span>
          </div>
        )}

        {/* TAB 1: LIVE IN-APP CHAT WITH ADMIN */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
            {/* Messages Body */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-5 px-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
                    <FiMessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs">Chat with Nexus Central Support Desk</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs mx-auto">
                    Ask questions regarding product specifications, delivery tracking, bulk rates, or order assistance.
                  </p>

                  {/* Quick Prompts */}
                  <div className="mt-3 flex flex-col gap-1.5 max-w-xs mx-auto">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[11px] bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium transition-all shadow-2xs text-left cursor-pointer truncate"
                      >
                        &bull; {prompt}
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
                      {msg.orderNumber && (
                        <div className="text-[9px] text-slate-400 font-semibold mb-0.5 flex items-center gap-1">
                          <FiPackage className="w-2.5 h-2.5" /> Order #{msg.orderNumber}
                        </div>
                      )}
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-xs font-medium ${
                          isMine
                            ? 'bg-gradient-to-r from-teal-700 to-teal-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium mt-0.5 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isMine && (
                          <span className="ml-1 text-teal-600 font-bold">
                            {msg.read ? '• Seen' : '• Sent to Admin'}
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
            <div className="shrink-0 p-2.5 bg-white border-t border-slate-200">
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
                  placeholder="Ask Nexus Support anything..."
                  className="flex-1 bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="w-9 h-9 rounded-xl bg-[#fae125] hover:bg-yellow-300 text-slate-950 font-black disabled:opacity-50 flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer border border-yellow-400"
                >
                  <FiSend className="w-3.5 h-3.5 text-black" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: SUPPORT HELPLINE */}
        {activeTab === 'call' && (
          <div className="p-5 text-center space-y-4 overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center mx-auto shadow-xs">
              <FiHeadphones className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">Nexus Official Helpline & Support</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs mx-auto">
                Connect directly with the Platform Support Desk for order tracking, express dispatch, and technical queries.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-xs mx-auto space-y-1.5 text-left text-xs">
              <div>
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Toll-Free Customer Care</div>
                <div className="text-base font-mono font-black text-slate-900">{supportPhone}</div>
              </div>
              <div className="pt-1.5 border-t border-slate-200">
                <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Support Email</div>
                <div className="text-[11px] font-bold text-teal-700 font-mono">{supportEmail}</div>
              </div>
              <div className="text-[9px] text-slate-500 font-medium pt-0.5">
                ⏰ 24x7 Support Active for Indore Delivery Zone.
              </div>
            </div>

            <a
              href={`tel:${supportPhone.replace(/\D/g, '')}`}
              className="inline-flex items-center justify-center gap-1.5 w-full max-w-xs py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition-all transform active:scale-98 cursor-pointer"
            >
              <FiPhone className="w-3.5 h-3.5" /> Call Helpline Now
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChatModal;
