import User from '../models/User.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2026_modern_ecommerce',
    { expiresIn: '30d' }
  );
};

// =========================================================================
// DELIVERY PARTNER APP CONTROLLERS
// =========================================================================

// @desc    Get current active delivery configuration (payout, radius, city)
// @route   GET /delivery/config
// @access  Public / Private
export const getDeliveryPublicConfig = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: 'deliveryConfig' });
    const config = setting?.value || {
      payoutPerTrip: 40,
      coverageRadiusKm: 5.0,
      customerDeliveryFee: 40,
      freeDeliveryThreshold: 999,
      serviceCity: 'Indore',
      deliveryOptions: [
        {
          id: 'instant',
          name: 'Instant Delivery',
          time: '30 - 45 Mins',
          icon: '⚡',
          description: 'Direct hyper-local courier from nearest merchant hub',
          badge: 'Fastest Delivery',
          price: 49,
          discountedPrice: 49,
          freeAbove: 0,
          isActive: true,
          isDefault: false,
        },
        {
          id: '4hour',
          name: '4-Hour Express',
          time: 'Within 4 Hours',
          icon: '🕒',
          description: 'Standard same-day fast fulfillment across Indore',
          badge: 'Most Popular',
          price: 39,
          discountedPrice: 0,
          freeAbove: 999,
          isActive: true,
          isDefault: true,
        },
        {
          id: 'nextday',
          name: 'Next Day Delivery',
          time: 'Tomorrow by 2:00 PM',
          icon: '🚚',
          description: 'Scheduled next-day eco delivery slot',
          badge: 'Free Delivery',
          price: 0,
          discountedPrice: 0,
          freeAbove: 0,
          isActive: true,
          isDefault: false,
        },
      ],
    };
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delivery Partner Login
// @route   POST /delivery/login
// @access  Public
export const deliveryLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or rider account not found' });
    }

    if (user.role !== 'delivery' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Account is not registered as a delivery partner' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isAvailable: user.isAvailable !== false,
        vehicleType: user.vehicleType || 'Bike',
        vehicleNumber: user.vehicleNumber || '',
        serviceCity: user.serviceCity || '',
        servicePincodes: user.servicePincodes || [],
        earnings: user.earnings || { today: 0, total: 0 },
      },
    });
  } catch (error) {
    console.error('[deliveryLogin Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Rider Profile & Live Stats
// @route   GET /delivery/profile
// @access  Private (Delivery)
export const getDeliveryProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    const activeDeliveriesCount = await Order.countDocuments({
      deliveryPartner: user._id,
      deliveryStatus: { $in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
    });

    const completedDeliveriesCount = await Order.countDocuments({
      deliveryPartner: user._id,
      deliveryStatus: 'DELIVERED',
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isAvailable: user.isAvailable !== false,
        vehicleType: user.vehicleType || 'Bike',
        vehicleNumber: user.vehicleNumber || '',
        serviceCity: user.serviceCity || '',
        servicePincodes: user.servicePincodes || [],
        earnings: user.earnings || { today: 0, total: 0 },
        activeDeliveriesCount,
        completedDeliveriesCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Rider Online / Offline Availability
// @route   PUT /delivery/toggle-availability
// @access  Private (Delivery)
export const toggleAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Rider not found' });
    }

    user.isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : !user.isAvailable;
    await user.save();

    res.json({
      success: true,
      isAvailable: user.isAvailable,
      message: user.isAvailable ? 'You are now ONLINE & ready for orders' : 'You are now OFFLINE',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Available Orders for Rider (Location & Pincode Matched)
// @route   GET /delivery/available-orders
// @access  Private (Delivery)
export const getAvailableOrders = async (req, res) => {
  try {
    const rider = req.user;

    const query = {
      deliveryStatus: 'UNASSIGNED',
      status: 'Ready for Pickup',
      rejectedBy: { $ne: rider._id },
    };

    // Location matching if rider has specified service city or pincodes
    if (rider.serviceCity && rider.serviceCity.trim() !== '') {
      query['shippingAddress.city'] = new RegExp(rider.serviceCity.trim(), 'i');
    }
    if (rider.servicePincodes && rider.servicePincodes.length > 0) {
      query['shippingAddress.postalCode'] = { $in: rider.servicePincodes };
    }

    let orders = await Order.find(query)
      .populate('user', 'name email phone avatar')
      .populate('vendors.vendor', 'name storeName phone address storeLogo')
      .sort({ createdAt: -1 })
      .lean();

    // Fallback: If no location-strict matches, return any open ready for pickup orders
    if (orders.length === 0) {
      orders = await Order.find({
        deliveryStatus: 'UNASSIGNED',
        status: 'Ready for Pickup',
        rejectedBy: { $ne: rider._id },
      })
        .populate('user', 'name email phone avatar')
        .populate('vendors.vendor', 'name storeName phone address storeLogo')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
    }

    // Fetch live delivery config
    const setting = await Setting.findOne({ key: 'deliveryConfig' });
    const deliveryConfig = setting?.value || {
      payoutPerTrip: 40,
      coverageRadiusKm: 5.0,
      serviceCity: rider.serviceCity || 'Indore',
    };

    res.json({ success: true, count: orders.length, orders, deliveryConfig });
  } catch (error) {
    console.error('[getAvailableOrders Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Active Assigned Deliveries for Rider
// @route   GET /delivery/active-orders
// @access  Private (Delivery)
export const getMyActiveDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPartner: req.user._id,
      deliveryStatus: { $in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
    })
      .populate('user', 'name email phone avatar')
      .populate('vendors.vendor', 'name storeName phone address storeLogo')
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Completed Delivery History
// @route   GET /delivery/history
// @access  Private (Delivery)
export const getMyDeliveryHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPartner: req.user._id,
      deliveryStatus: 'DELIVERED',
    })
      .populate('user', 'name email phone avatar')
      .sort({ deliveredAt: -1, createdAt: -1 })
      .lean();

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Accept an Available Order (Atomic Lock)
// @route   PUT /delivery/orders/:id/accept
// @access  Private (Delivery)
export const acceptOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const riderId = req.user._id;

    // ATOMIC CONCURRENCY LOCK: Ensures only 1 rider can claim the order
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        deliveryPartner: null,
        deliveryStatus: 'UNASSIGNED',
      },
      {
        $set: {
          deliveryPartner: riderId,
          deliveryStatus: 'ASSIGNED',
          status: 'Assigned',
          assignedAt: new Date(),
        },
      },
      { new: true }
    ).populate('user', 'name email phone avatar');

    if (!order) {
      return res.status(409).json({
        success: false,
        message: 'Order already accepted by another rider or no longer available',
      });
    }

    // Emit Real-Time Socket.IO Updates
    if (global.io) {
      global.io.emit('order_claimed', { orderId: order._id, riderId });
      global.io.emit('order_status_updated', {
        orderId: order._id,
        status: 'Assigned',
        deliveryStatus: 'ASSIGNED',
        deliveryPartner: {
          _id: req.user._id,
          name: req.user.name,
          phone: req.user.phone,
          vehicleType: req.user.vehicleType,
          vehicleNumber: req.user.vehicleNumber,
        },
      });
    }

    res.json({
      success: true,
      message: 'Order accepted successfully! Proceed to pickup.',
      order,
    });
  } catch (error) {
    console.error('[acceptOrder Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject an Order from Rider feed
// @route   PUT /delivery/orders/:id/reject
// @access  Private (Delivery)
export const rejectOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const riderId = req.user._id;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $addToSet: { rejectedBy: riderId },
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order rejected from your feed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Delivery Status (PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED)
// @route   PUT /delivery/orders/:id/status
// @access  Private (Delivery)
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const orderId = req.params.id;
    const riderId = req.user._id;

    const validStatuses = ['PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid delivery status provided' });
    }

    const order = await Order.findOne({
      _id: orderId,
      deliveryPartner: riderId,
    }).populate('user', 'name email phone avatar');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Assigned order not found' });
    }

    order.deliveryStatus = status;
    if (notes) order.deliveryNotes = notes;
    const now = new Date();

    if (status === 'PICKED_UP') {
      order.status = 'Picked Up';
      order.pickedUpAt = now;

      // Synchronize vendor sub-orders and items
      if (order.vendors && order.vendors.length > 0) {
        order.vendors.forEach((v) => {
          v.status = 'Picked Up';
          v.pickedUpAt = now;
        });
      }
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item) => {
          item.itemStatus = 'Picked Up';
        });
      }
    } else if (status === 'OUT_FOR_DELIVERY') {
      order.status = 'Out for Delivery';
      order.outForDeliveryAt = now;
      if (!order.pickedUpAt) order.pickedUpAt = now;

      if (order.vendors && order.vendors.length > 0) {
        order.vendors.forEach((v) => {
          v.status = 'Out for Delivery';
          if (!v.pickedUpAt) v.pickedUpAt = now;
        });
      }
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item) => {
          item.itemStatus = 'Out for Delivery';
        });
      }
    } else if (status === 'DELIVERED') {
      // Security Handover OTP Verification
      if (order.deliveryOtp) {
        const providedOtp = (req.body.otp || '').toString().trim();
        if (!providedOtp) {
          return res.status(400).json({
            success: false,
            message: 'Delivery OTP is required. Please ask the customer for their 4-digit security code.',
          });
        }

        if (providedOtp !== order.deliveryOtp.toString().trim()) {
          return res.status(400).json({
            success: false,
            message: 'Invalid OTP. Please verify the 4-digit code displayed on the customer\'s order tracking screen.',
          });
        }

        order.otpVerifiedAt = now;
      }

      order.status = 'Delivered';
      order.deliveredAt = now;
      if (order.paymentMethod === 'Cash on Delivery') {
        order.isPaid = true;
        order.paidAt = now;
      }

      // Synchronize vendor sub-orders and items to Delivered
      if (order.vendors && order.vendors.length > 0) {
        order.vendors.forEach((v) => {
          v.status = 'Delivered';
          v.deliveredAt = now;
        });
      }
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach((item) => {
          item.itemStatus = 'Delivered';
        });
      }

      // Credit rider payout
      const fee = order.deliveryFee || 40;
      await User.findByIdAndUpdate(riderId, {
        $inc: {
          'earnings.today': fee,
          'earnings.total': fee,
        },
      });

      // Credit each vendor's earnings upon successful delivery
      if (order.vendors && order.vendors.length > 0) {
        for (const vSub of order.vendors) {
          const vId = vSub.vendor ? (vSub.vendor._id || vSub.vendor) : null;
          if (vId) {
            const vendorUser = await User.findById(vId);
            const commRate = vendorUser?.commissionRate || 10;
            const vendorItems = order.orderItems.filter(
              (it) => it.vendor && it.vendor.toString() === vId.toString()
            );
            const subTotal = vendorItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
            const netEarnings = Math.round(subTotal - (subTotal * commRate) / 100);

            if (netEarnings > 0) {
              await User.findByIdAndUpdate(vId, {
                $inc: {
                  'vendorEarnings.total': netEarnings,
                  'vendorEarnings.pending': netEarnings,
                },
              });
            }
          }
        }
      }
    }

    await order.save();

    // Broadcast Real-Time updates to Vendors, Admin, Client and Delivery fleet
    if (global.io) {
      const updatePayload = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        deliveryStatus: order.deliveryStatus,
        deliveredAt: order.deliveredAt,
        riderName: req.user.name || 'Courier Rider',
      };

      // 1. General status update event
      global.io.emit('order_status_updated', updatePayload);

      // 2. Real-time targeted alerts for each involved Vendor
      if (order.vendors && order.vendors.length > 0) {
        order.vendors.forEach((vSub) => {
          const vId = vSub.vendor ? (vSub.vendor._id || vSub.vendor).toString() : null;
          if (vId) {
            let notifTitle = `Order #${order.orderNumber} Status: ${order.status}`;
            let notifMsg = `Order #${order.orderNumber} milestone updated to ${order.status}.`;

            if (order.status === 'Picked Up') {
              notifTitle = `Package Picked Up from Store`;
              notifMsg = `Rider ${req.user.name || ''} picked up Order #${order.orderNumber} from your store.`;
            } else if (order.status === 'Out for Delivery') {
              notifTitle = `Order Out for Delivery`;
              notifMsg = `Order #${order.orderNumber} is on the way to the customer.`;
            } else if (order.status === 'Delivered') {
              notifTitle = `🎉 Order Delivered Successfully!`;
              notifMsg = `Order #${order.orderNumber} containing your products has been delivered to the customer. Earnings credited!`;
            }

            const vendorAlertPayload = {
              orderId: order._id,
              orderNumber: order.orderNumber,
              status: order.status,
              title: notifTitle,
              message: notifMsg,
              type: order.status === 'Delivered' ? 'delivered' : 'transit',
              time: 'Just now',
            };

            global.io.emit(`vendor_order_status_${vId}`, vendorAlertPayload);
            global.io.to(`vendor_${vId}`).emit('vendor_order_status', vendorAlertPayload);
          }
        });
      }

      // 3. Admin Notification on Delivery Completion
      if (order.status === 'Delivered') {
        global.io.emit('admin_notification', {
          id: Date.now() + Math.random(),
          title: `Order #${order.orderNumber} Delivered`,
          message: `Rider ${req.user.name || 'Courier'} successfully delivered Order #${order.orderNumber} to ${order.shippingAddress?.fullName || 'Customer'}.`,
          time: 'Just now',
          unread: true,
          type: 'order',
          link: '/orders',
          orderId: order._id,
        });
      }
    }

    res.json({
      success: true,
      message: `Order marked as ${order.status}`,
      order,
    });
  } catch (error) {
    console.error('[updateDeliveryStatus Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// ADMIN FLEET MANAGEMENT CONTROLLERS
// =========================================================================

// @desc    Get All Delivery Partners (Admin)
// @route   GET /delivery/admin/riders
// @access  Private (Admin)
export const adminGetDeliveryPartners = async (req, res) => {
  try {
    const riders = await User.find({ role: 'delivery' }).sort({ createdAt: -1 }).lean();

    const ridersWithStats = await Promise.all(
      riders.map(async (r) => {
        const activeOrders = await Order.countDocuments({
          deliveryPartner: r._id,
          deliveryStatus: { $in: ['ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY'] },
        });
        const completedOrders = await Order.countDocuments({
          deliveryPartner: r._id,
          deliveryStatus: 'DELIVERED',
        });
        return {
          ...r,
          activeOrders,
          completedOrders,
        };
      })
    );

    res.json({ success: true, count: ridersWithStats.length, riders: ridersWithStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create New Delivery Partner (Admin)
// @route   POST /delivery/admin/riders
// @access  Private (Admin)
export const adminCreateDeliveryPartner = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType, vehicleNumber, serviceCity, servicePincodes } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const rider = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'delivery',
      vehicleType: vehicleType || 'Bike',
      vehicleNumber: vehicleNumber || '',
      serviceCity: serviceCity || '',
      servicePincodes: Array.isArray(servicePincodes) ? servicePincodes : (servicePincodes ? servicePincodes.split(',').map(s => s.trim()) : []),
      isAvailable: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    });

    res.status(201).json({
      success: true,
      message: 'Delivery partner registered successfully',
      rider: {
        _id: rider._id,
        name: rider.name,
        email: rider.email,
        phone: rider.phone,
        role: rider.role,
        vehicleType: rider.vehicleType,
        vehicleNumber: rider.vehicleNumber,
        serviceCity: rider.serviceCity,
        servicePincodes: rider.servicePincodes,
        isAvailable: rider.isAvailable,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Delivery Partner (Admin)
// @route   PUT /delivery/admin/riders/:id
// @access  Private (Admin)
export const adminUpdateDeliveryPartner = async (req, res) => {
  try {
    const { name, email, phone, vehicleType, vehicleNumber, serviceCity, servicePincodes, isAvailable } = req.body;

    const rider = await User.findById(req.params.id);
    if (!rider || rider.role !== 'delivery') {
      return res.status(404).json({ success: false, message: 'Delivery partner not found' });
    }

    rider.name = name || rider.name;
    rider.email = email ? email.toLowerCase() : rider.email;
    if (phone !== undefined) rider.phone = phone;
    if (vehicleType) rider.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) rider.vehicleNumber = vehicleNumber;
    if (serviceCity !== undefined) rider.serviceCity = serviceCity;
    if (servicePincodes !== undefined) {
      rider.servicePincodes = Array.isArray(servicePincodes) ? servicePincodes : servicePincodes.split(',').map(s => s.trim());
    }
    if (isAvailable !== undefined) rider.isAvailable = isAvailable;

    await rider.save();

    res.json({
      success: true,
      message: 'Delivery partner updated successfully',
      rider,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Delivery Partner (Admin)
// @route   DELETE /delivery/admin/riders/:id
// @access  Private (Admin)
export const adminDeleteDeliveryPartner = async (req, res) => {
  try {
    const rider = await User.findById(req.params.id);
    if (!rider || rider.role !== 'delivery') {
      return res.status(404).json({ success: false, message: 'Delivery partner not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Delivery partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
