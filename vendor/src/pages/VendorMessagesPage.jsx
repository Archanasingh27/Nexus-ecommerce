import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useVendorAuth } from '../context/VendorAuthContext';
import { useToast } from '../context/ToastContext';
import {
  FiMessageSquare,
  FiSend,
  FiPhone,
  FiPackage,
  FiUser,
  FiSearch,
  FiCheck,
  FiClock,
  FiExternalLink,
  FiInbox,
  FiShoppingBag,
} from 'react-icons/fi';

export const VendorMessagesPage = () => {
  const { vendor, socket } = useVendorAuth();
  const { addToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const quickReplies = [
    'Your order has been confirmed and packed. Ready for rider pickup!',
    'Hello! This product is in stock and available for express dispatch in Indore.',
    'Thank you for reaching out! We are checking this with our fulfillment team.',
    'Please allow 2-4 hours for courier pickup and doorstep delivery.',
  ];

  // Fetch Conversation Threads
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      if (data.success) {
        setConversations(data.conversations || []);
        if (data.conversations?.length > 0 && !selectedPartner) {
          setSelectedPartner(data.conversations[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket.IO Live Inquiries Listener
  useEffect(() => {
    if (!socket || !vendor?._id) return;

    const handleNewMessage = (payload) => {
      const msg = payload.message || payload;
      const partnerId =
        (msg.sender?._id || msg.sender) === vendor._id
          ? msg.recipient?._id || msg.recipient
          : msg.sender?._id || msg.sender;

      // Update active messages if chatting with this customer
      if (selectedPartner && (selectedPartner._id === partnerId || selectedPartner.partner?._id === partnerId)) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }

      // Refresh threads
      fetchConversations();

      if ((msg.sender?._id || msg.sender) !== vendor._id) {
        addToast(`💬 New message from ${msg.sender?.name || 'Customer'}!`, 'info');
      }
    };

    socket.on('new_chat_message', handleNewMessage);
    socket.on(`chat_${vendor._id}`, handleNewMessage);

    return () => {
      socket.off('new_chat_message', handleNewMessage);
      socket.off(`chat_${vendor._id}`, handleNewMessage);
    };
  }, [socket, vendor?._id, selectedPartner]);

  // Fetch Messages for Selected Customer
  useEffect(() => {
    if (!selectedPartner) return;
    const partnerId = selectedPartner._id || selectedPartner.partner?._id;
    if (!partnerId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await api.get(`/chat/messages/${partnerId}`);
        if (data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedPartner]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || !selectedPartner) return;

    const recipientId = selectedPartner._id || selectedPartner.partner?._id;
    if (!recipientId) return;

    setSending(true);
    try {
      const payload = {
        recipientId,
        message: text,
        orderId: selectedPartner.lastOrderId || null,
        orderNumber: selectedPartner.lastOrderNumber || '',
        productName: selectedPartner.lastProductName || '',
      };

      const { data } = await api.post('/chat/send', payload);
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
        fetchConversations();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.partner?.name || '';
    const order = c.lastOrderNumber || '';
    const query = searchTerm.toLowerCase();
    return name.toLowerCase().includes(query) || order.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Customer Inquiries & Chat</span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              Live Messaging
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Answer buyer questions, provide fulfillment updates, and manage customer support directly.
          </p>
        </div>
      </div>

      {/* Main Messaging Container */}
      <div className="glass-card overflow-hidden rounded-3xl border border-orange-200/80 shadow-xl grid grid-cols-1 lg:grid-cols-12 h-[680px]">
        {/* Left Column: Conversation Threads (4 cols) */}
        <div className="lg:col-span-4 border-r border-orange-100/80 flex flex-col bg-white/60">
          {/* Search Bar */}
          <div className="p-3.5 border-b border-orange-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers or order #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/30 transition-all placeholder:text-slate-400 font-medium"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-orange-50/60 p-1.5 space-y-1">
            {loadingConversations ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400 font-bold mt-2">Loading threads...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-16 text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-2">
                  <FiInbox className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-xs">No customer messages yet</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Inquiries from buyers on your products or orders will appear here.
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partnerId = conv._id || conv.partner?._id;
                const isSelected =
                  selectedPartner &&
                  (selectedPartner._id === partnerId || selectedPartner.partner?._id === partnerId);

                return (
                  <button
                    key={partnerId}
                    onClick={() => setSelectedPartner(conv)}
                    className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                        : 'hover:bg-orange-50/80 bg-white/70 text-slate-800 border border-slate-100'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isSelected
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-orange-100 text-orange-800 border-orange-200'
                      }`}
                    >
                      {(conv.partner?.name || 'Customer').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs truncate">
                          {conv.partner?.name || 'Customer'}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-orange-100' : 'text-slate-400'
                          } shrink-0 ml-1`}
                        >
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-white/90 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {conv.lastMessage}
                      </p>

                      {/* Order Context Pill */}
                      {conv.lastOrderNumber && (
                        <div className="mt-1 flex items-center gap-1">
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            📦 #{conv.lastOrderNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-50/40">
          {selectedPartner ? (
            <>
              {/* Active Header */}
              <div className="px-5 py-3.5 bg-white border-b border-orange-100 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 border border-orange-200 flex items-center justify-center font-bold text-sm">
                    {(selectedPartner.partner?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {selectedPartner.partner?.name || 'Customer'}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>Customer &bull; Verified Buyer</span>
                      {selectedPartner.partner?.phone && (
                        <span className="text-slate-500 font-mono">
                          +{selectedPartner.partner.phone}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Direct Call Customer button */}
                {selectedPartner.partner?.phone && (
                  <a
                    href={`tel:+91${selectedPartner.partner.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
                  >
                    <FiPhone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>
                )}
              </div>

              {/* Context Tag if inquiry is about an order/product */}
              {(selectedPartner.lastOrderNumber || selectedPartner.lastProductName) && (
                <div className="bg-amber-50/80 border-b border-amber-100 px-4 py-2 text-xs flex items-center justify-between text-amber-900">
                  <div className="flex items-center gap-2">
                    <FiPackage className="text-amber-600 w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold">
                      Thread regarding{' '}
                      {selectedPartner.lastOrderNumber
                        ? `Order #${selectedPartner.lastOrderNumber}`
                        : selectedPartner.lastProductName}
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                    Active Order
                  </span>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    No messages exchanged yet. Send a welcome message below.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isVendorMine =
                      (msg.sender?._id || msg.sender) === vendor._id ||
                      msg.senderRole === 'vendor';

                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isVendorMine ? 'items-end' : 'items-start'}`}
                      >
                        {msg.orderNumber && (
                          <span className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                            <FiPackage className="w-2.5 h-2.5" /> Order #{msg.orderNumber}
                          </span>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs font-medium ${
                            isVendorMine
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-xs shadow-xs'
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
                          {isVendorMine && (
                            <span className="ml-1 text-orange-600">
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

              {/* Quick Reply Prompts */}
              <div className="px-3 pt-2 bg-white/70 border-t border-slate-100 flex gap-1.5 overflow-x-auto pb-1">
                {quickReplies.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qr)}
                    className="text-[10px] bg-white hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 font-medium whitespace-nowrap shrink-0 transition-all"
                  >
                    "{qr}"
                  </button>
                ))}
              </div>

              {/* Composer */}
              <div className="p-3 bg-white border-t border-orange-100">
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
                    placeholder="Type your reply to the customer..."
                    className="flex-1 bg-slate-100/80 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
              <div className="w-14 h-14 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <FiMessageSquare className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-700 text-sm">Select a Conversation</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Pick a customer thread from the left pane to view message history and send replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
