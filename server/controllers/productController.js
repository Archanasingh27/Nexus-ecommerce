import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';

// @desc    Fetch all products with rich filtering, search, sorting & pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;

    const query = {};

    // Keyword Search
    if (req.query.keyword) {
      query.$or = [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } },
        { brand: { $regex: req.query.keyword, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.keyword, 'i')] } },
      ];
    }

    // Category Filter
    if (req.query.category && req.query.category !== 'all') {
      const categoryDoc = await Category.findOne({
        $or: [{ _id: req.query.category.match(/^[0-9a-fA-F]{24}$/) ? req.query.category : null }, { slug: req.query.category }],
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      }
    }

    // Subcategory Filter
    if (req.query.subcategory && req.query.subcategory !== 'all') {
      const subRegex = new RegExp(req.query.subcategory.replace(/-/g, ' '), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { subcategory: subRegex },
          { name: subRegex },
          { description: subRegex },
          { tags: { $in: [subRegex] } },
        ],
      });
    }

    // Price Range Filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // Rating Filter
    if (req.query.minRating) {
      query.rating = { $gte: Number(req.query.minRating) };
    }

    // In Stock Only Filter
    if (req.query.inStock === 'true') {
      query.countInStock = { $gt: 0 };
    }

    // Special collections
    if (req.query.isFeatured === 'true') query.isFeatured = true;
    if (req.query.isTrending === 'true') query.isTrending = true;
    if (req.query.isNewArrival === 'true') query.isNewArrival = true;
    if (req.query.isFlashDeal === 'true') query.isFlashDeal = true;

    // Approval Status Filter
    if (req.query.approvalStatus) {
      if (req.query.approvalStatus !== 'all') {
        query.approvalStatus = req.query.approvalStatus;
      }
    } else {
      // By default for customer storefront, only show approved products
      query.approvalStatus = 'approved';
    }

    // Vendor / Seller Filter
    if (req.query.vendor) {
      if (req.query.vendor === 'direct' || req.query.vendor === 'nexus') {
        query.vendor = null;
      } else if (req.query.vendor !== 'all') {
        query.vendor = req.query.vendor;
      }
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sortBy === 'price-low') sort = { price: 1 };
    else if (req.query.sortBy === 'price-high') sort = { price: -1 };
    else if (req.query.sortBy === 'rating') sort = { rating: -1 };
    else if (req.query.sortBy === 'popular') sort = { soldCount: -1 };
    else if (req.query.sortBy === 'oldest') sort = { createdAt: 1 };

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug icon')
      .populate('vendor', 'name storeName storeLogo vendorStatus rating')
      .sort(sort)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      success: true,
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get top featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, approvalStatus: 'approved' })
      .populate('category', 'name slug')
      .populate('vendor', 'name storeName storeLogo vendorStatus')
      .limit(8);
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending & flash deal products
// @route   GET /api/products/deals
// @access  Public
export const getDealsAndTrending = async (req, res) => {
  try {
    const flashDeals = await Product.find({ isFlashDeal: true, approvalStatus: 'approved' })
      .populate('vendor', 'name storeName storeLogo vendorStatus')
      .limit(6);
    const trending = await Product.find({ isTrending: true, approvalStatus: 'approved' })
      .populate('vendor', 'name storeName storeLogo vendorStatus')
      .limit(8);
    const newArrivals = await Product.find({ isNewArrival: true, approvalStatus: 'approved' })
      .populate('vendor', 'name storeName storeLogo vendorStatus')
      .sort({ createdAt: -1 })
      .limit(8);

    let setting = await Setting.findOne({ key: 'flashSale' });
    if (!setting) {
      const defaultEndTime = new Date(Date.now() + 8 * 60 * 60 * 1000 + 42 * 60 * 1000);
      setting = {
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
      };
    }

    res.json({
      success: true,
      flashDeals,
      trending,
      newArrivals,
      flashSaleConfig: setting.value,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Fetch single product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    let product;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(req.params.id)
        .populate('category', 'name slug')
        .populate('vendor', 'name email phone storeName storeDescription storeLogo storeBanner vendorStatus commissionRate');
    }

    if (!product) {
      product = await Product.findOne({ slug: req.params.id })
        .populate('category', 'name slug')
        .populate('vendor', 'name email phone storeName storeDescription storeLogo storeBanner vendorStatus commissionRate');
    }

    if (product) {
      // Find related products in same category
      const relatedProducts = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
        approvalStatus: 'approved',
      })
        .populate('vendor', 'name storeName storeLogo vendorStatus')
        .limit(4);

      res.json({ success: true, product, relatedProducts });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      originalPrice,
      description,
      images,
      brand,
      category,
      countInStock,
      isFeatured,
      isTrending,
      isNewArrival,
      isFlashDeal,
      specifications,
      tags,
    } = req.body;

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Invalid category specified' });
    }

    const slug = name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);

    let vendorId = null;
    let vendorName = '';
    let vendorStoreName = '';

    if (req.body.vendor) {
      const vendorDoc = await User.findById(req.body.vendor);
      if (vendorDoc && vendorDoc.role === 'vendor') {
        vendorId = vendorDoc._id;
        vendorName = vendorDoc.name;
        vendorStoreName = vendorDoc.storeName || vendorDoc.name;
      }
    }

    // Fallback: If no vendor provided, find first approved vendor
    if (!vendorId) {
      const fallbackVendor = await User.findOne({ role: 'vendor', vendorStatus: 'approved' }) || await User.findOne({ role: 'vendor' });
      if (fallbackVendor) {
        vendorId = fallbackVendor._id;
        vendorName = fallbackVendor.name;
        vendorStoreName = fallbackVendor.storeName || fallbackVendor.name;
      } else {
        return res.status(400).json({ success: false, message: 'A valid vendor is required to list a product.' });
      }
    }

    const product = new Product({
      name,
      slug,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : Number(price),
      description,
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
      brand: brand || 'Nexus Premium',
      category: categoryDoc._id,
      categoryName: categoryDoc.name,
      countInStock: Number(countInStock) || 0,
      isFeatured: Boolean(isFeatured),
      isTrending: Boolean(isTrending),
      isNewArrival: Boolean(isNewArrival),
      isFlashDeal: Boolean(isFlashDeal),
      specifications: specifications || [],
      tags: tags || [],
      vendor: vendorId,
      vendorName,
      vendorStoreName,
      approvalStatus: 'approved',
    });

    const createdProduct = await product.save();

    // Update category item count
    await Category.findByIdAndUpdate(categoryDoc._id, { $inc: { itemCount: 1 } });

    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      if (req.body.price !== undefined) product.price = Number(req.body.price);
      if (req.body.originalPrice !== undefined) product.originalPrice = Number(req.body.originalPrice);
      if (req.body.description !== undefined) product.description = req.body.description;
      if (req.body.brand !== undefined) product.brand = req.body.brand;
      if (req.body.countInStock !== undefined) product.countInStock = Number(req.body.countInStock);
      if (req.body.images && req.body.images.length > 0) product.images = req.body.images;
      if (req.body.isFeatured !== undefined) product.isFeatured = Boolean(req.body.isFeatured);
      if (req.body.isTrending !== undefined) product.isTrending = Boolean(req.body.isTrending);
      if (req.body.isNewArrival !== undefined) product.isNewArrival = Boolean(req.body.isNewArrival);
      if (req.body.isFlashDeal !== undefined) product.isFlashDeal = Boolean(req.body.isFlashDeal);
      if (req.body.specifications !== undefined) product.specifications = req.body.specifications;
      if (req.body.tags !== undefined) product.tags = req.body.tags;

      if (req.body.vendor) {
        const vendorDoc = await User.findById(req.body.vendor);
        if (vendorDoc && vendorDoc.role === 'vendor') {
          product.vendor = vendorDoc._id;
          product.vendorName = vendorDoc.name;
          product.vendorStoreName = vendorDoc.storeName || vendorDoc.name;
        }
      }

      if (req.body.category && req.body.category !== product.category.toString()) {
        const newCat = await Category.findById(req.body.category);
        if (newCat) {
          await Category.findByIdAndUpdate(product.category, { $inc: { itemCount: -1 } });
          product.category = newCat._id;
          product.categoryName = newCat.name;
          await Category.findByIdAndUpdate(newCat._id, { $inc: { itemCount: 1 } });
        }
      }

      const updatedProduct = await product.save();
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Category.findByIdAndUpdate(product.category, { $inc: { itemCount: -1 } });
      await Product.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Product successfully removed' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
      }

      const review = {
        name: req.user.name,
        userName: req.user.name,
        userAvatar: req.user.avatar,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ success: true, message: 'Review added successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
