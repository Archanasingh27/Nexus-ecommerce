import Coupon from '../models/Coupon.js';

// @desc    Validate a coupon code and calculate discount
// @route   POST /api/coupons/validate
// @access  Public / Private
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(orderAmount) || 0;

    const coupon = await Coupon.findOne({ code: cleanCode, isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: `Coupon code "${cleanCode}" is invalid or expired` });
    }

    // Check expiry
    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ success: false, message: `Coupon "${cleanCode}" has expired` });
    }

    // Check start date
    if (coupon.startDate && new Date() < new Date(coupon.startDate)) {
      return res.status(400).json({ success: false, message: `Coupon "${cleanCode}" is not active yet` });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: `Coupon "${cleanCode}" has reached its maximum usage limit` });
    }

    // Check minimum order amount
    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderAmount.toLocaleString('en-IN')} required for coupon "${cleanCode}". (Current: ₹${amount.toLocaleString('en-IN')})`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, amount);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalAmount = Math.max(0, amount - discountAmount);

    res.json({
      success: true,
      message: `🎉 Coupon "${coupon.code}" applied! You save ₹${discountAmount.toLocaleString('en-IN')}`,
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
    });
  } catch (error) {
    console.error('[validateCoupon Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (search) {
      query.code = { $regex: search, $options: 'i' };
    }
    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gte: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.expiryDate = { $lt: new Date() };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    console.error('[getCoupons Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Code, discount value, and expiry date are required' });
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Coupon with code "${code.trim().toUpperCase()}" already exists` });
    }

    const coupon = new Coupon({
      code: code.trim().toUpperCase(),
      description: description || '',
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate),
      usageLimit: Number(usageLimit) || 500,
      isActive: isActive !== undefined ? isActive : true,
    });

    const savedCoupon = await coupon.save();
    res.status(201).json({ success: true, message: 'Coupon created successfully', coupon: savedCoupon });
  } catch (error) {
    console.error('[createCoupon Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      startDate,
      expiryDate,
      usageLimit,
      isActive,
    } = req.body;

    if (code) coupon.code = code.trim().toUpperCase();
    if (description !== undefined) coupon.description = description;
    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (maxDiscountAmount !== undefined) coupon.maxDiscountAmount = maxDiscountAmount ? Number(maxDiscountAmount) : null;
    if (startDate) coupon.startDate = new Date(startDate);
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    if (usageLimit !== undefined) coupon.usageLimit = Number(usageLimit);
    if (isActive !== undefined) coupon.isActive = isActive;

    const updatedCoupon = await coupon.save();
    res.json({ success: true, message: 'Coupon updated successfully', coupon: updatedCoupon });
  } catch (error) {
    console.error('[updateCoupon Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle coupon active status (Admin)
// @route   PUT /api/coupons/:id/toggle
// @access  Private/Admin
export const toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    const updated = await coupon.save();

    res.json({
      success: true,
      message: `Coupon is now ${updated.isActive ? 'Active' : 'Inactive'}`,
      coupon: updated,
    });
  } catch (error) {
    console.error('[toggleCouponStatus Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('[deleteCoupon Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
