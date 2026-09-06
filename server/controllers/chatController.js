import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a chat message
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const {
      recipientId,
      message,
      orderId,
      orderNumber,
      productId,
      productName,
      productImage,
    } = req.body;

    if (!recipientId || !message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and message text are required' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const isSenderVendor = req.user.role === 'vendor';
    const customerId = isSenderVendor ? recipientId : req.user._id;
    const vendorId = isSenderVendor ? req.user._id : recipientId;

    const newMessage = new Message({
      sender: req.user._id,
      recipient: recipientId,
      customer: customerId,
      vendor: vendorId,
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
      global.io.to(`vendor_${recipientId}`).emit('new_chat_message', socketPayload);
      global.io.emit(`chat_${recipientId}`, socketPayload);

      // Emit back to sender confirmation
      global.io.to(`user_${req.user._id}`).emit('message_sent', socketPayload);
      global.io.to(`vendor_${req.user._id}`).emit('message_sent', socketPayload);
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

// @desc    Get all active conversation threads for logged-in user or vendor
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const isVendor = req.user.role === 'vendor';
    const matchField = isVendor ? { vendor: req.user._id } : { customer: req.user._id };
    const partnerField = isVendor ? '$customer' : '$vendor';

    // Aggregate conversation threads
    const conversations = await Message.aggregate([
      { $match: matchField },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: partnerField,
          lastMessage: { $first: '$message' },
          lastMessageAt: { $first: '$createdAt' },
          lastSenderRole: { $first: '$senderRole' },
          lastOrderId: { $first: '$orderId' },
          lastOrderNumber: { $first: '$orderNumber' },
          lastProductName: { $first: '$productName' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$read', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    // Populate partner details
    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const partner = await User.findById(conv._id).select(
          'name storeName avatar phone email role storeLogo businessPhone'
        );
        return {
          ...conv,
          partner: partner || {
            name: isVendor ? 'Customer' : 'Store Vendor',
            storeName: isVendor ? '' : 'Nexus Seller',
            avatar: '',
            phone: '',
          },
        };
      })
    );

    res.json({
      success: true,
      conversations: populated,
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
      global.io.to(`vendor_${partnerId}`).emit('messages_marked_read', { readBy: req.user._id });
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
