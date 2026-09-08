import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// =========================================================================
// VENDOR AUTHENTICATION & PROFILE
// =========================================================================

// @desc    Vendor Registration (Merchant Onboarding)
// @route   POST /vendor/register
// @access  Public
export const vendorRegister = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      storeName,
      storeDescription,
      storeLogo,
      storeBanner,
      taxId,
      address,
      bankDetails,
    } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and Store Name are required.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const vendor = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'vendor',
      vendorStatus: 'pending', // Requires Admin approval
      storeName: storeName.trim(),
      storeDescription: storeDescription || '',
      storeLogo: storeLogo || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=200&auto=format&fit=crop&q=80',
      storeBanner: storeBanner || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=1200&auto=format&fit=crop&q=80',
      businessEmail: email.toLowerCase(),
      businessPhone: phone || '',
      taxId: taxId || '',
      commissionRate: 10,
      address: address || {
        street: 'Plot 18, Commercial Hub, Scheme 54',
        city: 'Indore',
        state: 'Madhya Pradesh',
        postalCode: '452010',
        country: 'India',
      },
      bankDetails: bankDetails || {
        accountHolderName: storeName,
        accountNumber: '',
        bankName: '',
        routingOrIfsc: '',
      },
      vendorEarnings: { pending: 0, withdrawn: 0, total: 0 },
    });

    // Notify Admin in Real-Time
    if (global.io) {
      global.io.to('admin_room').emit('new_vendor_registered', {
        vendor: {
          _id: vendor._id,
          name: vendor.name,
          email: vendor.email,
          storeName: vendor.storeName,
          phone: vendor.phone,
          vendorStatus: 'pending',
          createdAt: vendor.createdAt,
        },
      });
    }

    res.status(201).json({
      success: true,
      isPendingApproval: true,
      message: 'Merchant registration submitted! Your account is pending Admin approval. You can log in once approved.',
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        vendorStatus: vendor.vendorStatus,
        storeName: vendor.storeName,
        storeDescription: vendor.storeDescription,
        phone: vendor.phone,
      },
    });
  } catch (error) {
    console.error('[vendorRegister Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vendor Login
// @route   POST /vendor/login
// @access  Public
export const vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or vendor not found' });
    }

    if (user.role !== 'vendor' && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Account is not a registered vendor' });
    }

    // Check Vendor Approval Status (Admins bypass)
    if (user.role === 'vendor' && user.vendorStatus === 'pending') {
      return res.status(403).json({
        success: false,
        isPendingApproval: true,
        message: 'Your merchant registration is currently pending Admin approval. You will receive access once approved by Admin.',
      });
    }

    if (user.role === 'vendor' && user.vendorStatus === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your vendor account application was rejected or suspended. Please contact Admin support.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      vendor: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vendorStatus: user.vendorStatus || 'approved',
        storeName: user.storeName || user.name,
        storeDescription: user.storeDescription || '',
        storeLogo: user.storeLogo,
        storeBanner: user.storeBanner,
        address: user.address,
        taxId: user.taxId,
        commissionRate: user.commissionRate || 10,
        vendorEarnings: user.vendorEarnings || { pending: 0, withdrawn: 0, total: 0 },
        bankDetails: user.bankDetails,
      },
    });
  } catch (error) {
    console.error('[vendorLogin Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current Vendor Profile
// @route   GET /vendor/profile
// @access  Private (Vendor)
export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({
      success: true,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        role: vendor.role,
        vendorStatus: vendor.vendorStatus,
        storeName: vendor.storeName,
        storeDescription: vendor.storeDescription,
        storeLogo: vendor.storeLogo,
        storeBanner: vendor.storeBanner,
        businessEmail: vendor.businessEmail,
        businessPhone: vendor.businessPhone,
        taxId: vendor.taxId,
        commissionRate: vendor.commissionRate,
        vendorEarnings: vendor.vendorEarnings,
        bankDetails: vendor.bankDetails,
        address: vendor.address,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Vendor Profile & Store Settings
// @route   PUT /vendor/profile
// @access  Private (Vendor)
export const updateVendorProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const {
      name,
      phone,
      storeName,
      storeDescription,
      storeLogo,
      storeBanner,
      businessEmail,
      businessPhone,
      taxId,
      address,
      bankDetails,
    } = req.body;

    if (name) vendor.name = name;
    if (phone) vendor.phone = phone;
    if (storeName) vendor.storeName = storeName;
    if (storeDescription !== undefined) vendor.storeDescription = storeDescription;
    if (storeLogo) vendor.storeLogo = storeLogo;
    if (storeBanner) vendor.storeBanner = storeBanner;
    if (businessEmail) vendor.businessEmail = businessEmail;
    if (businessPhone) vendor.businessPhone = businessPhone;
    if (taxId !== undefined) vendor.taxId = taxId;
    if (address) vendor.address = { ...vendor.address, ...address };
    if (bankDetails) vendor.bankDetails = { ...vendor.bankDetails, ...bankDetails };

    await vendor.save();

    res.json({
      success: true,
      message: 'Store settings updated successfully',
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// VENDOR DASHBOARD & KPI ANALYTICS
// =========================================================================

// @desc    Get Vendor Dashboard Stats with Rich Order & Product Analytics
// @route   GET /vendor/dashboard/stats
// @access  Private (Vendor)
export const getVendorDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const commissionRate = req.user.commissionRate || 10;

    // 1. Fetch vendor's orders
    const orders = await Order.find({
      'orderItems.vendor': vendorId,
    }).sort({ createdAt: -1 }).lean();

    // 2. Fetch vendor's products
    const products = await Product.find({ vendor: vendorId }).lean();

    let totalGrossSales = 0;
    let totalRevenue = 0;
    let pendingOrdersCount = 0;
    let confirmedOrdersCount = 0;
    let packedOrdersCount = 0;
    let readyForPickupOrdersCount = 0;
    let inTransitOrdersCount = 0;
    let completedOrdersCount = 0;
    let cancelledOrdersCount = 0;

    // Daily Sales Timeline (Last 14 Days)
    const daysMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[key] = { date: label, fullDate: key, revenue: 0, orders: 0, units: 0 };
    }

    // Payment Methods Split
    const paymentMethods = {
      Prepaid: { count: 0, revenue: 0 },
      'Cash on Delivery': { count: 0, revenue: 0 },
      'Credit/Debit Card': { count: 0, revenue: 0 },
    };

    // Product Sales Map from actual orders
    const productSalesMap = {};

    orders.forEach((order) => {
      const vendorItems = order.orderItems.filter(
        (i) => i.vendor && i.vendor.toString() === vendorId.toString()
      );

      const itemsTotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemsUnits = vendorItems.reduce((sum, item) => sum + item.quantity, 0);

      // Deduct platform commission
      const commission = (itemsTotal * commissionRate) / 100;
      const netEarnings = itemsTotal - commission;

      totalGrossSales += itemsTotal;
      totalRevenue += netEarnings;

      // Track item sales
      vendorItems.forEach((item) => {
        const prodId = item.product ? item.product.toString() : item.name;
        if (!productSalesMap[prodId]) {
          productSalesMap[prodId] = { unitsSold: 0, revenue: 0 };
        }
        productSalesMap[prodId].unitsSold += item.quantity;
        productSalesMap[prodId].revenue += item.price * item.quantity;
      });

      // Daily trend mapping
      const orderDateKey = new Date(order.createdAt).toISOString().split('T')[0];
      if (daysMap[orderDateKey]) {
        daysMap[orderDateKey].revenue += Math.round(netEarnings);
        daysMap[orderDateKey].orders += 1;
        daysMap[orderDateKey].units += itemsUnits;
      }

      // Payment mode split
      const pMethod = order.paymentMethod === 'Cash on Delivery' ? 'Cash on Delivery' : (order.paymentMethod === 'Credit/Debit Card' ? 'Credit/Debit Card' : 'Prepaid');
      if (!paymentMethods[pMethod]) {
        paymentMethods[pMethod] = { count: 0, revenue: 0 };
      }
      paymentMethods[pMethod].count += 1;
      paymentMethods[pMethod].revenue += Math.round(netEarnings);

      // Sub-order status
      const subStatus = order.vendors?.find(
        (v) => v.vendor && v.vendor.toString() === vendorId.toString()
      )?.status || order.status;

      if (subStatus === 'Pending') pendingOrdersCount++;
      else if (subStatus === 'Confirmed') confirmedOrdersCount++;
      else if (subStatus === 'Packed') packedOrdersCount++;
      else if (subStatus === 'Ready for Pickup') readyForPickupOrdersCount++;
      else if (subStatus === 'Picked Up' || subStatus === 'Out for Delivery') inTransitOrdersCount++;
      else if (subStatus === 'Delivered') completedOrdersCount++;
      else if (subStatus === 'Cancelled' || subStatus === 'Rejected') cancelledOrdersCount++;
      else completedOrdersCount++;
    });

    const dailySales = Object.values(daysMap);

    // Product Analytics calculations
    let totalStockUnits = 0;
    let totalCatalogValuation = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalRatingsSum = 0;
    let totalReviewsCount = 0;
    const categoryBreakdownMap = {};

    const enrichedProducts = products.map((p) => {
      totalStockUnits += p.countInStock || 0;
      totalCatalogValuation += (p.price || 0) * (p.countInStock || 0);

      if ((p.countInStock || 0) <= 0) outOfStockCount++;
      else if ((p.countInStock || 0) <= 5) lowStockCount++;
      else inStockCount++;

      totalRatingsSum += p.rating || 0;
      totalReviewsCount += p.numReviews || 0;

      const catName = p.categoryName || 'General';
      if (!categoryBreakdownMap[catName]) {
        categoryBreakdownMap[catName] = { name: catName, count: 0, value: 0 };
      }
      categoryBreakdownMap[catName].count += 1;
      categoryBreakdownMap[catName].value += (p.price || 0) * (p.countInStock || 0);

      const salesData = productSalesMap[p._id.toString()] || { unitsSold: p.soldCount || 0, revenue: (p.soldCount || 0) * p.price };

      return {
        _id: p._id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        image: p.images?.[0] || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?w=100',
        categoryName: p.categoryName,
        countInStock: p.countInStock,
        rating: p.rating,
        numReviews: p.numReviews,
        unitsSold: Math.max(p.soldCount || 0, salesData.unitsSold),
        revenue: salesData.revenue || (p.soldCount || 0) * p.price,
      };
    });

    // Top Selling Products
    const topSellingProducts = [...enrichedProducts]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Low Stock Alert Products
    const lowStockProducts = enrichedProducts
      .filter((p) => p.countInStock <= 5)
      .sort((a, b) => a.countInStock - b.countInStock);

    const averageRating = products.length > 0 ? (totalRatingsSum / products.length).toFixed(1) : 0;
    const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    res.json({
      success: true,
      stats: {
        // High-level KPI metrics
        totalGrossSales: Math.round(totalGrossSales),
        totalRevenue: Math.round(totalRevenue),
        totalOrders: orders.length,
        averageOrderValue,
        commissionRate,

        // Order Pipeline & Analytics
        orderStatusCounts: {
          pending: pendingOrdersCount,
          confirmed: confirmedOrdersCount,
          packed: packedOrdersCount,
          readyForPickup: readyForPickupOrdersCount,
          inTransit: inTransitOrdersCount,
          delivered: completedOrdersCount,
          cancelled: cancelledOrdersCount,
        },
        pendingOrdersCount,
        confirmedOrdersCount,
        packedOrdersCount,
        readyForPickupOrdersCount,
        inTransitOrdersCount,
        completedOrdersCount,
        dailySales,
        paymentMethodsBreakdown: Object.entries(paymentMethods).map(([name, val]) => ({
          name,
          count: val.count,
          revenue: val.revenue,
        })),

        // Product Analytics
        productsCount: products.length,
        totalStockUnits,
        totalCatalogValuation: Math.round(totalCatalogValuation),
        inStockCount,
        lowStockCount,
        outOfStockCount,
        averageRating: Number(averageRating),
        totalReviewsCount,
        categoryBreakdown: Object.values(categoryBreakdownMap),
        topSellingProducts,
        lowStockProducts,

        // Recent Orders
        recentOrders: orders.slice(0, 6),
      },
    });
  } catch (error) {
    console.error('[getVendorDashboardStats Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// VENDOR PRODUCT MANAGEMENT (OWN PRODUCTS ONLY)
// =========================================================================

// @desc    Get All Products Owned by Current Vendor
// @route   GET /vendor/products
// @access  Private (Vendor)
export const getVendorProducts = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { page = 1, limit = 20, search = '', category = '' } = req.query;

    const query = { vendor: vendorId };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { brand: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a New Product for Vendor Store
// @route   POST /vendor/products
// @access  Private (Vendor)
export const createVendorProduct = async (req, res) => {
  try {
    const vendor = req.user;
    const {
      name,
      price,
      originalPrice,
      category,
      subcategory,
      brand,
      countInStock,
      description,
      images,
      isFeatured,
      isTrending,
      isNewArrival,
      isFlashDeal,
      specifications,
      tags,
    } = req.body;

    if (!name || !price || !category || !description) {
      return res.status(400).json({ success: false, message: 'Please provide all required product details.' });
    }

    const categoryObj = await Category.findById(category);
    if (!categoryObj) {
      return res.status(400).json({ success: false, message: 'Invalid category specified' });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      name,
      slug,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      category: categoryObj._id,
      categoryName: categoryObj.name,
      subcategory: subcategory || '',
      brand: brand || vendor.storeName || 'Vendor Brand',
      vendor: vendor._id,
      vendorName: vendor.name,
      vendorStoreName: vendor.storeName || vendor.name,
      approvalStatus: 'pending',
      countInStock: countInStock !== undefined ? Number(countInStock) : 10,
      description,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800'],
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      isFlashDeal: Boolean(isFlashDeal),
      specifications: specifications || [],
      tags: tags || [],
    });

    await Category.findByIdAndUpdate(categoryObj._id, { $inc: { itemCount: 1 } });

    // Notify Admin in Real Time that a Vendor submitted a new product for approval
    if (global.io) {
      global.io.emit('admin_notification', {
        id: Date.now() + Math.random(),
        title: 'New Product Submitted for Approval',
        message: `Vendor "${vendor.storeName || vendor.name}" submitted "${product.name}" (₹${product.price.toLocaleString('en-IN')}) for approval.`,
        time: 'Just now',
        timestamp: new Date().toISOString(),
        unread: true,
        type: 'product',
        link: '/products',
        productId: product._id,
        vendorName: vendor.storeName || vendor.name,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product submitted successfully! It is currently under review by Admin.',
      product,
    });
  } catch (error) {
    console.error('[createVendorProduct Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Vendor Product (Ownership Guarded)
// @route   PUT /vendor/products/:id
// @access  Private (Vendor)
export const updateVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Guard: Ensure current vendor owns this product (unless admin)
    if (req.user.role !== 'admin' && product.vendor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this product' });
    }

    const fields = [
      'name', 'price', 'originalPrice', 'category', 'subcategory', 'brand',
      'countInStock', 'description', 'images', 'isFeatured', 'isTrending',
      'isNewArrival', 'isFlashDeal', 'specifications', 'tags'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    if (req.body.category) {
      const cat = await Category.findById(req.body.category);
      if (cat) {
        product.category = cat._id;
        product.categoryName = cat.name;
      }
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Vendor Product (Ownership Guarded)
// @route   DELETE /vendor/products/:id
// @access  Private (Vendor)
export const deleteVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role !== 'admin' && product.vendor?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied: You do not own this product' });
    }

    await Product.findByIdAndDelete(product._id);
    await Category.findByIdAndUpdate(product.category, { $inc: { itemCount: -1 } });

    res.json({ success: true, message: 'Product deleted successfully from store' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =========================================================================
// VENDOR ORDER FULFILLMENT WORKFLOW
// =========================================================================

// @desc    Get All Orders Containing Current Vendor's Items
// @route   GET /vendor/orders
// @access  Private (Vendor)
export const getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { status = 'ALL' } = req.query;

    const query = {
      'orderItems.vendor': vendorId,
    };

    const orders = await Order.find(query)
      .populate('user', 'name email phone avatar')
      .populate('deliveryPartner', 'name phone vehicleType vehicleNumber')
      .sort({ createdAt: -1 })
      .lean();

    // Filter to present vendor-specific items and mask customer personal details for buyer privacy
    const tailoredOrders = orders.map((order) => {
      const myItems = order.orderItems.filter(
        (item) => item.vendor && item.vendor.toString() === vendorId.toString()
      );

      const vendorSub = order.vendors?.find(
        (v) => v.vendor && v.vendor.toString() === vendorId.toString()
      );

      const subStatus = vendorSub?.status || order.status;
      const myItemsTotal = myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // Provide Name and Address for package labeling, but keep Phone Number strictly masked to prevent vendor calling
      const safeUser = {
        name: order.user?.name || order.shippingAddress?.fullName || 'Customer',
        email: order.user?.email || '',
        phone: '🔒 Phone Protected',
        avatar: order.user?.avatar || '',
      };

      const safeShippingAddress = {
        fullName: order.shippingAddress?.fullName || order.user?.name || 'Customer',
        phone: '🔒 Phone Protected',
        street: order.shippingAddress?.street || order.shippingAddress?.address || '',
        address: order.shippingAddress?.address || order.shippingAddress?.street || '',
        city: order.shippingAddress?.city || 'Indore',
        state: order.shippingAddress?.state || 'Madhya Pradesh',
        postalCode: order.shippingAddress?.postalCode || '452001',
        country: order.shippingAddress?.country || 'India',
      };

      return {
        ...order,
        user: safeUser,
        shippingAddress: safeShippingAddress,
        orderItems: myItems,
        vendorSubStatus: subStatus,
        vendorItemsTotal: myItemsTotal,
        vendorSubDetails: vendorSub,
      };
    });

    const filtered = status === 'ALL'
      ? tailoredOrders
      : tailoredOrders.filter((o) => o.vendorSubStatus === status);

    res.json({
      success: true,
      count: filtered.length,
      orders: filtered,
    });
  } catch (error) {
    console.error('[getVendorOrders Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Order Detail for Vendor
// @route   GET /vendor/orders/:id
// @access  Private (Vendor)
export const getVendorOrderById = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('deliveryPartner', 'name phone vehicleType vehicleNumber')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const myItems = order.orderItems.filter(
      (item) => item.vendor && item.vendor.toString() === vendorId.toString()
    );

    if (myItems.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Order does not contain products from your store' });
    }

    const vendorSub = order.vendors?.find(
      (v) => v.vendor && v.vendor.toString() === vendorId.toString()
    );

    // Provide Name and Address for package labeling, but keep Phone Number strictly masked to prevent vendor calling
    const safeUser = {
      name: order.user?.name || order.shippingAddress?.fullName || 'Customer',
      email: order.user?.email || '',
      phone: '🔒 Phone Protected',
      avatar: order.user?.avatar || '',
    };

    const safeShippingAddress = {
      fullName: order.shippingAddress?.fullName || order.user?.name || 'Customer',
      phone: '🔒 Phone Protected',
      street: order.shippingAddress?.street || order.shippingAddress?.address || '',
      address: order.shippingAddress?.address || order.shippingAddress?.street || '',
      city: order.shippingAddress?.city || 'Indore',
      state: order.shippingAddress?.state || 'Madhya Pradesh',
      postalCode: order.shippingAddress?.postalCode || '452001',
      country: order.shippingAddress?.country || 'India',
    };

    res.json({
      success: true,
      order: {
        ...order,
        user: safeUser,
        shippingAddress: safeShippingAddress,
        orderItems: myItems,
        vendorSubStatus: vendorSub?.status || order.status,
        vendorSubDetails: vendorSub,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Vendor Order Status (Confirm -> Pack -> Ready for Pickup -> Notify Riders)
// @route   PUT /vendor/orders/:id/status
// @access  Private (Vendor)
export const updateVendorOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const orderId = req.params.id;
    const vendorId = req.user._id;

    const validStatuses = ['Confirmed', 'Packed', 'Ready for Pickup', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid action. Valid status updates: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(orderId).populate('user', 'name email phone avatar');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update items belonging to this vendor
    let matchedItemCount = 0;
    order.orderItems.forEach((item) => {
      if (item.vendor && item.vendor.toString() === vendorId.toString()) {
        item.itemStatus = status;
        matchedItemCount++;
      }
    });

    if (matchedItemCount === 0 && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Order has no items from your store' });
    }

    // Ensure all unique vendors from orderItems exist in order.vendors
    const uniqueVendorIds = [...new Set(order.orderItems.map((it) => it.vendor?.toString()).filter(Boolean))];
    if (uniqueVendorIds.length > 0 && order.vendors.length < uniqueVendorIds.length) {
      for (const uvId of uniqueVendorIds) {
        if (!order.vendors.some((v) => v.vendor && v.vendor.toString() === uvId)) {
          const sampleItem = order.orderItems.find((it) => it.vendor && it.vendor.toString() === uvId);
          order.vendors.push({
            vendor: uvId,
            storeName: sampleItem?.vendorStoreName || sampleItem?.vendorName || 'Nexus Merchant Store',
            vendorPhone: '',
            vendorAddress: {
              street: 'Plot 18, Commercial Hub, Scheme 54',
              city: 'Indore',
              state: 'Madhya Pradesh',
              postalCode: '452010',
            },
            status: sampleItem?.itemStatus || 'Pending',
          });
        }
      }
    }

    // Update or add sub-order entry in order.vendors
    let vendorSub = order.vendors.find(
      (v) => v.vendor && v.vendor.toString() === vendorId.toString()
    );

    if (!vendorSub) {
      order.vendors.push({
        vendor: vendorId,
        storeName: req.user.storeName || req.user.name,
        vendorPhone: req.user.phone || req.user.businessPhone || '',
        vendorAddress: req.user.address || {
          street: 'Plot 18, Commercial Hub, Scheme 54',
          city: 'Indore',
          state: 'Madhya Pradesh',
          postalCode: '452010',
        },
        status,
      });
      vendorSub = order.vendors[order.vendors.length - 1];
    }

    vendorSub.status = status;
    const now = new Date();

    if (status === 'Confirmed') {
      vendorSub.confirmedAt = now;
      if (order.status === 'Pending') {
        order.status = 'Confirmed';
        order.confirmedAt = now;
      }
    } else if (status === 'Packed') {
      vendorSub.packedAt = now;
      if (order.status === 'Confirmed' || order.status === 'Pending') {
        order.status = 'Packed';
        order.packedAt = now;
      }
    } else if (status === 'Ready for Pickup') {
      vendorSub.readyForPickupAt = now;

      // Check if ALL vendors in this order are now Ready for Pickup
      const totalVendors = order.vendors.length;
      const readyVendors = order.vendors.filter((v) =>
        ['Ready for Pickup', 'Picked Up', 'Out for Delivery', 'Delivered'].includes(v.status)
      ).length;

      const allVendorsReady = totalVendors > 0 && readyVendors === totalVendors;

      if (allVendorsReady) {
        order.status = 'Ready for Pickup';
        order.readyForPickupAt = now;
        order.deliveryStatus = 'UNASSIGNED';

        // ================================================================
        // REAL-TIME SOCKET.IO DISPATCH TO AVAILABLE DELIVERY RIDERS
        // ================================================================
        if (global.io) {
          const pickupCity = req.user.address?.city || 'Indore';
          const room = `city_${pickupCity.toLowerCase().trim()}`;

          const pickupPayload = {
            orderId: order._id,
            orderNumber: order.orderNumber,
            totalPrice: order.totalPrice,
            paymentMethod: order.paymentMethod,
            isPaid: order.isPaid,
            deliveryFee: order.deliveryFee || 40,
            vendorsCount: 1,
            vendors: (order.vendors && order.vendors.length > 0)
              ? order.vendors.map((v) => ({
                  _id: v.vendor,
                  storeName: v.storeName || order.vendorStoreName || req.user.storeName || 'Merchant Store',
                  phone: v.vendorPhone || order.vendorAddress?.phone || req.user.phone || '',
                  address: v.vendorAddress || order.vendorAddress || req.user.address,
                }))
              : [{
                  _id: order.vendor || req.user._id,
                  storeName: order.vendorStoreName || req.user.storeName || req.user.name || 'Merchant Store',
                  phone: order.vendorAddress?.phone || req.user.phone || '',
                  address: order.vendorAddress || req.user.address,
                }],
            destination: {
              fullName: order.shippingAddress.fullName,
              phone: order.shippingAddress.phone,
              street: order.shippingAddress.street,
              city: order.shippingAddress.city,
              state: order.shippingAddress.state,
              postalCode: order.shippingAddress.postalCode,
            },
            readyAt: now,
          };

          // Broadcast to city room & globally to all connected active riders
          global.io.to(room).emit('order_ready_for_pickup', pickupPayload);
          global.io.emit('order_ready_for_pickup', pickupPayload);
          global.io.emit('order_status_updated', {
            orderId: order._id,
            status: 'Ready for Pickup',
            deliveryStatus: 'UNASSIGNED',
            readyForPickupAt: now,
          });

          console.log(`[Socket.IO] All ${totalVendors} vendors ready! Broadcasted order_ready_for_pickup for order #${order.orderNumber}`);
        }
      } else {
        // Multi-Vendor partial readiness: Only some vendors are ready, awaiting others
        order.status = 'Partially Ready';
        order.deliveryStatus = 'PENDING_VENDOR_PACKING';

        if (global.io) {
          global.io.emit('order_status_updated', {
            orderId: order._id,
            status: 'Partially Ready',
            readyVendorsCount: readyVendors,
            totalVendorsCount: totalVendors,
            message: `${readyVendors} of ${totalVendors} vendors marked ready for pickup. Waiting for remaining vendors.`,
          });
        }
        console.log(`[Multi-Vendor] Order #${order.orderNumber}: ${readyVendors}/${totalVendors} vendors ready. Waiting for other vendors.`);
      }
    } else if (status === 'Rejected') {
      vendorSub.status = 'Rejected';
    }

    if (notes) {
      order.notes = notes;
    }

    await order.save();

    res.json({
      success: true,
      message: `Order milestone updated to: ${status}`,
      order,
    });
  } catch (error) {
    console.error('[updateVendorOrderStatus Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
