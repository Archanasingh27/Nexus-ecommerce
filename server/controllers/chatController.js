import User from '../models/User.js';
import Message from '../models/Message.js';

// @desc    Get Admin Support Desk contact info for customer chat
// @route   GET /api/chat/admin-info
// @access  Public / Authenticated
export const getAdminSupportInfo = async (req, res) => {
  try {
    let adminUser = await User.findOne({ role: 'admin' }).select('_id name email phone avatar');
    if (!adminUser) {
      adminUser = await User.findOne({ role: { $nin: ['vendor', 'delivery_boy', 'courier'] }, isAdmin: true }).select('_id name email phone avatar');
    }
    if (!adminUser) {
      adminUser = await User.findOne({ role: { $nin: ['vendor', 'delivery_boy', 'courier'] } }).select('_id name email phone avatar');
    }
    res.json({
      success: true,
      admin: adminUser || {
        _id: 'admin',
        name: 'Nexus Central Support Desk',
        email: 'support@nexus.com',
        phone: '1800-NEXUS-CARE',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a chat message
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    let {
      recipientId,
      message,
      orderId,
      orderNumber,
      productId,
      productName,
      productImage,
    } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    // Vendors do not participate in customer support chat
    if (req.user.role === 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendors do not participate in customer support chat' });
    }

    // If recipient is 'admin' or missing, route directly to Admin (never a vendor)
    let recipient = null;
    if (!recipientId || recipientId === 'admin') {
      recipient = await User.findOne({ role: 'admin' });
      if (!recipient) {
        recipient = await User.findOne({ role: { $nin: ['vendor', 'delivery_boy', 'courier'] }, isAdmin: true });
      }
      if (!recipient) {
        recipient = await User.findOne({ role: { $nin: ['vendor', 'delivery_boy', 'courier'] } });
      }
      recipientId = recipient?._id;
    } else {
      recipient = await User.findById(recipientId);
    }

    // If recipient is a vendor or invalid, redirect to central Admin
    if (!recipient || recipient.role === 'vendor') {
      recipient = await User.findOne({ role: 'admin' });
      recipientId = recipient?._id;
    }

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Support desk recipient not found' });
    }

    const isSenderAdmin = req.user.role === 'admin';

    const newMessage = new Message({
      sender: req.user._id,
      recipient: recipientId,
      customer: isSenderAdmin ? recipientId : req.user._id,
      vendor: null,
      senderRole: req.user.role,
      orderId: orderId || null,
      orderNumber: orderNumber || '',
      productId: productId || null,
      productName: productName || '',
      productImage: productImage || '',
      message: message.trim(),
      read: false,
    });

    const savedMessage = await newMessage.save();
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'name storeName avatar phone role')
      .populate('recipient', 'name storeName avatar phone role');

    // Real-Time Socket.IO Dispatch
    if (global.io) {
      const socketPayload = {
        message: populatedMessage,
        senderId: req.user._id.toString(),
        recipientId: recipientId.toString(),
      };

      // Emit to recipient's private rooms
      global.io.to(`user_${recipientId}`).emit('new_chat_message', socketPayload);
      global.io.to(`admin_room`).emit('new_chat_message', socketPayload);
      global.io.emit(`chat_${recipientId}`, socketPayload);

      // Emit back to sender confirmation
      global.io.to(`user_${req.user._id}`).emit('message_sent', socketPayload);
      global.io.to(`admin_room`).emit('message_sent', socketPayload);
    }

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error('[sendMessage Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all active conversation threads for logged-in user or admin
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    // Vendors do not have customer chats
    if (req.user.role === 'vendor') {
      return res.json({
        success: true,
        conversations: [],
      });
    }

    const isAdmin = req.user.role === 'admin';

    // If admin, find all conversations where sender or recipient is user
    let matchQuery = {
      $or: [
        { sender: req.user._id },
        { recipient: req.user._id },
      ],
    };

    if (isAdmin) {
      matchQuery = {}; // Admin can see all incoming user support inquiries
    }

    const messages = await Message.find(matchQuery)
      .populate('sender', 'name storeName avatar phone email role')
      .populate('recipient', 'name storeName avatar phone email role')
      .sort({ createdAt: -1 });

    const threadsMap = new Map();

    messages.forEach((msg) => {
      const partner = (msg.sender?._id?.toString() === req.user._id.toString())
        ? msg.recipient
        : msg.sender;

      if (!partner || !partner._id) return;

      const partnerIdStr = partner._id.toString();
      if (!threadsMap.has(partnerIdStr)) {
        threadsMap.set(partnerIdStr, {
          _id: partner._id,
          partner,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          lastSenderRole: msg.senderRole,
          lastOrderId: msg.orderId,
          lastOrderNumber: msg.orderNumber,
          lastProductName: msg.productName,
          unreadCount: (msg.recipient?._id?.toString() === req.user._id.toString() && !msg.read) ? 1 : 0,
        });
      } else {
        if (msg.recipient?._id?.toString() === req.user._id.toString() && !msg.read) {
          threadsMap.get(partnerIdStr).unreadCount += 1;
        }
      }
    });

    const conversations = Array.from(threadsMap.values());

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('[getConversations Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get message history between current user and partner
// @route   GET /api/chat/messages/:partnerId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    if (req.user.role === 'vendor') {
      return res.json({ success: true, messages: [] });
    }

    const { partnerId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: partnerId },
        { sender: partnerId, recipient: req.user._id },
      ],
    })
      .populate('sender', 'name storeName avatar phone role')
      .populate('recipient', 'name storeName avatar phone role')
      .sort({ createdAt: 1 });

    // Mark unread messages received by current user from this partner as read
    await Message.updateMany(
      { sender: partnerId, recipient: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    if (global.io) {
      global.io.to(`user_${partnerId}`).emit('messages_marked_read', { readBy: req.user._id });
    }

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('[getMessages Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:partnerId
// @access  Private
export const markMessagesAsRead = async (req, res) => {
  try {
    const { partnerId } = req.params;

    await Message.updateMany(
      { sender: partnerId, recipient: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    if (global.io) {
      global.io.to(`user_${partnerId}`).emit('messages_marked_read', { readBy: req.user._id });
      global.io.to(`vendor_${partnerId}`).emit('messages_marked_read', { readBy: req.user._id });
    }

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('[markMessagesAsRead Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
