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

// @desc    Get flash sale deal configuration
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
          endTime: defaultEndTime.toISOString(),
          isActive: true,
        },
      });
    }
    res.json({ success: true, flashSale: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update flash sale deal configuration
// @route   PUT /api/admin/flash-sale
// @access  Private/Admin
export const updateFlashSaleConfig = async (req, res) => {
  try {
    const { title, tag, endTime, isActive } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key: 'flashSale' },
      {
        key: 'flashSale',
        value: {
          title: title || 'Flash Sales & Hot Deals',
          tag: tag || 'Limited-Time Deals',
          endTime: endTime || new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
          isActive: isActive !== undefined ? isActive : true,
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Flash sale deal timer updated successfully',
      flashSale: setting.value,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


