import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Setting from '../models/Setting.js';

// @desc    Get complete admin dashboard analytics and KPI summaries
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getDashboardAnalytics = async (req, res) => {
  try {
    // 1. Core KPIs
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({});
    const totalCategories = await Category.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const totalRiders = await User.countDocuments({ role: 'delivery' });
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    const pendingVendors = await User.countDocuments({ role: 'vendor', vendorStatus: 'pending' });

    // 2. Revenue calculation
    const revenueAggregation = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

    // 3. Pending & Processing orders count
    const pendingOrders = await Order.countDocuments({ status: { $in: ['Pending', 'Processing', 'Confirmed', 'Packed', 'Ready for Pickup'] } });

    // 4. Low stock products (countInStock <= 5)
    const lowStockProducts = await Product.find({ countInStock: { $lte: 5 } })
      .select('name price countInStock images categoryName brand vendorStoreName')
      .limit(6);

    // 5. Top 5 selling products
    const topProducts = await Product.find({})
      .sort({ soldCount: -1, rating: -1 })
      .select('name price soldCount countInStock images categoryName rating vendorStoreName')
      .limit(5);

    // 6. Recent 6 orders
    const recentOrders = await Order.find({})
      .populate('user', 'name email avatar')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 })
      .limit(6);

    // 7. Monthly/Daily Revenue Trend Data (Past 7 periods / days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

    const salesTrend = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format sales trend nicely for Recharts
    const chartData = salesTrend.map((item) => {
      const dateObj = new Date(item._id);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return {
        date: formattedDate,
        rawDate: item._id,
        revenue: Math.round(item.revenue),
        orders: item.orders,
      };
    });

    // 8. Category Distribution
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$categoryName',
          count: { $sum: 1 },
          totalStock: { $sum: '$countInStock' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalProducts,
        totalUsers,
        totalCategories,
        totalRiders,
        totalVendors,
        pendingVendors,
        pendingOrders,
      },
      lowStockProducts,
      topProducts,
      recentOrders,
      chartData,
      categoryStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get All Registered Vendors (Admin)
// @route   GET /admin/vendors
// @access  Private/Admin
export const getAllVendors = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { role: 'vendor' };

    if (status && status !== 'ALL') {
      query.vendorStatus = status.toLowerCase();
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { storeName: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const vendors = await User.find(query).sort({ createdAt: -1 }).lean();

    const vendorsWithStats = await Promise.all(
      vendors.map(async (v) => {
        const productCount = await Product.countDocuments({ vendor: v._id });
        const ordersCount = await Order.countDocuments({ 'orderItems.vendor': v._id });
        return {
          ...v,
          productCount,
          ordersCount,
        };
      })
    );

    res.json({
      success: true,
      count: vendorsWithStats.length,
      vendors: vendorsWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve / Reject / Update Vendor Status (Admin)
// @route   PUT /admin/vendors/:id/status
// @access  Private/Admin
export const updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid vendor status' });
    }

    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    vendor.vendorStatus = status;
    await vendor.save();

    res.json({
      success: true,
      message: `Vendor '${vendor.storeName || vendor.name}' status updated to ${status}!`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Vendor Details & Commission Rate (Admin)
// @route   PUT /admin/vendors/:id
// @access  Private/Admin
export const updateVendorByAdmin = async (req, res) => {
  try {
    const { storeName, commissionRate, vendorStatus, phone, businessEmail, taxId, bankDetails } = req.body;
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (storeName) vendor.storeName = storeName;
    if (commissionRate !== undefined) vendor.commissionRate = Number(commissionRate);
    if (vendorStatus) vendor.vendorStatus = vendorStatus;
    if (phone) vendor.phone = phone;
    if (businessEmail) vendor.businessEmail = businessEmail;
    if (taxId !== undefined) vendor.taxId = taxId;
    if (bankDetails) vendor.bankDetails = { ...vendor.bankDetails, ...bankDetails };

    await vendor.save();

    res.json({
      success: true,
      message: 'Vendor settings updated successfully by Admin',
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Vendor Account (Admin)
// @route   DELETE /admin/vendors/:id
// @access  Private/Admin
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await User.findById(req.params.id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    await User.findByIdAndDelete(vendor._id);
    // Unassign or delete vendor products
    await Product.deleteMany({ vendor: vendor._id });

    res.json({
      success: true,
      message: `Vendor '${vendor.storeName || vendor.name}' and all associated products deleted.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get flash sale deal & announcement bar configuration
// @route   GET /api/admin/flash-sale
// @access  Private/Admin
export const getFlashSaleConfig = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'flashSale' });
    if (!setting) {
      const defaultEndTime = new Date(Date.now() + 8 * 60 * 60 * 1000 + 42 * 60 * 1000);
      setting = await Setting.create({
        key: 'flashSale',
        value: {
          title: 'Flash Sales & Hot Deals',
          tag: 'Limited-Time Deals',
          announcementBadge: 'FLASH SALE',
          announcementText: 'Use code NEXUS20 for 20% OFF on all orders over ₹999!',
          couponCode: 'NEXUS20',
          discountPercent: 20,
          minOrderAmount: 999,
          endTime: defaultEndTime.toISOString(),
          isActive: true,
          showAnnouncementBar: true,
        },
      });
    }
    res.json({ success: true, flashSale: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update flash sale deal & announcement configuration
// @route   PUT /api/admin/flash-sale
// @access  Private/Admin
export const updateFlashSaleConfig = async (req, res) => {
  try {
    const {
      title,
      tag,
      announcementBadge,
      announcementText,
      couponCode,
      discountPercent,
      minOrderAmount,
      endTime,
      isActive,
      showAnnouncementBar,
    } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key: 'flashSale' },
      {
        key: 'flashSale',
        value: {
          title: title || 'Flash Sales & Hot Deals',
          tag: tag || 'Limited-Time Deals',
          announcementBadge: announcementBadge || 'FLASH SALE',
          announcementText: announcementText || 'Use code NEXUS20 for 20% OFF on all orders over ₹999!',
          couponCode: couponCode || 'NEXUS20',
          discountPercent: Number(discountPercent) || 20,
          minOrderAmount: Number(minOrderAmount) || 999,
          endTime: endTime || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          isActive: isActive !== undefined ? isActive : true,
          showAnnouncementBar: showAnnouncementBar !== undefined ? showAnnouncementBar : true,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Flash sale deal & announcement bar settings updated successfully',
      flashSale: setting.value,
    });
  } catch (error) {
    console.error('[updateFlashSaleConfig Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product approval status (Approve / Reject)
// @route   PUT /api/admin/products/:id/approval
// @access  Private/Admin
export const updateProductApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected.',
      });
    }

    const product = await Product.findById(req.params.id).populate('vendor', 'name storeName email');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.approvalStatus = status;
    await product.save();

    // Real-time socket notification to vendor
    if (global.io && product.vendor) {
      const vendorId = product.vendor._id ? product.vendor._id.toString() : product.vendor.toString();
      global.io.emit('vendor_notification', {
        vendorId,
        id: Date.now() + Math.random(),
        title: status === 'approved' ? 'Product Approved! 🎉' : 'Product Rejected',
        message: `Your product "${product.name}" has been ${status === 'approved' ? 'approved and is now live on the store!' : 'rejected by Admin.'}`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        unread: true,
        type: 'product',
        productId: product._id,
      });
    }

    res.json({
      success: true,
      message: `Product "${product.name}" marked as ${status} successfully.`,
      product,
    });
  } catch (error) {
    console.error('[updateProductApprovalStatus Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get delivery & logistics settings
// @route   GET /api/admin/delivery-settings
const DEFAULT_DELIVERY_OPTIONS = [
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
];

// @desc    Get delivery & logistics settings
// @route   GET /api/admin/delivery-settings
// @access  Private/Admin
export const getDeliverySettings = async (req, res) => {
  try {
    let setting = await Setting.findOne({ key: 'deliveryConfig' });
    if (!setting) {
      setting = await Setting.create({
        key: 'deliveryConfig',
        value: {
          payoutPerTrip: 40,
          coverageRadiusKm: 5.0,
          customerDeliveryFee: 40,
          freeDeliveryThreshold: 999,
          serviceCity: 'Indore',
          autoAssignEnabled: true,
          deliveryOptions: DEFAULT_DELIVERY_OPTIONS,
        },
      });
    } else if (!setting.value.deliveryOptions || !Array.isArray(setting.value.deliveryOptions)) {
      setting.value.deliveryOptions = DEFAULT_DELIVERY_OPTIONS;
      await Setting.findOneAndUpdate(
        { key: 'deliveryConfig' },
        { value: setting.value },
        { new: true }
      );
    }
    res.json({ success: true, settings: setting.value });
  } catch (error) {
    console.error('[getDeliverySettings Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update delivery & logistics settings
// @route   PUT /api/admin/delivery-settings
// @access  Private/Admin
export const updateDeliverySettings = async (req, res) => {
  try {
    const {
      payoutPerTrip,
      coverageRadiusKm,
      customerDeliveryFee,
      freeDeliveryThreshold,
      serviceCity,
      autoAssignEnabled,
      deliveryOptions,
    } = req.body;

    let sanitizedOptions = DEFAULT_DELIVERY_OPTIONS;
    if (Array.isArray(deliveryOptions) && deliveryOptions.length > 0) {
      sanitizedOptions = deliveryOptions.map((opt, idx) => ({
        id: (opt.id || opt.name || `opt_${idx}`).toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: opt.name?.trim() || `Option ${idx + 1}`,
        time: opt.time?.trim() || 'Standard Delivery',
        icon: opt.icon?.trim() || '🚚',
        description: opt.description?.trim() || '',
        badge: opt.badge?.trim() || '',
        price: Number(opt.price) >= 0 ? Number(opt.price) : 0,
        discountedPrice: Number(opt.discountedPrice) >= 0 ? Number(opt.discountedPrice) : 0,
        freeAbove: Number(opt.freeAbove) >= 0 ? Number(opt.freeAbove) : 0,
        isActive: opt.isActive !== undefined ? Boolean(opt.isActive) : true,
        isDefault: Boolean(opt.isDefault),
      }));
    }

    const newConfig = {
      payoutPerTrip: Number(payoutPerTrip) >= 0 ? Number(payoutPerTrip) : 40,
      coverageRadiusKm: Number(coverageRadiusKm) > 0 ? Number(coverageRadiusKm) : 5.0,
      customerDeliveryFee: Number(customerDeliveryFee) >= 0 ? Number(customerDeliveryFee) : 40,
      freeDeliveryThreshold: Number(freeDeliveryThreshold) >= 0 ? Number(freeDeliveryThreshold) : 999,
      serviceCity: serviceCity ? serviceCity.trim() : 'Indore',
      autoAssignEnabled: autoAssignEnabled !== undefined ? autoAssignEnabled : true,
      deliveryOptions: sanitizedOptions,
    };

    const setting = await Setting.findOneAndUpdate(
      { key: 'deliveryConfig' },
      { key: 'deliveryConfig', value: newConfig },
      { upsert: true, new: true }
    );

    // Broadcast real-time config change to delivery fleet, client & admin
    if (global.io) {
      global.io.emit('delivery_config_updated', setting.value);
    }

    res.json({
      success: true,
      message: 'Delivery payout and logistics settings updated successfully',
      settings: setting.value,
    });
  } catch (error) {
    console.error('[updateDeliverySettings Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};


