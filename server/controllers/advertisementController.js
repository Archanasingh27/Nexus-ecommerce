import Advertisement from '../models/Advertisement.js';
import Category from '../models/Category.js';

// @desc    Get all active public ads
// @route   GET /api/advertisements
// @access  Public
export const getPublicAdvertisements = async (req, res) => {
  try {
    const { placement, category } = req.query;
    const filter = { isActive: true };

    if (placement && placement !== 'all') {
      filter.placement = placement;
    }

    if (category && category !== 'all') {
      filter.$or = [{ categorySlug: category }, { category: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }];
    }

    const ads = await Advertisement.find(filter)
      .populate('category', 'name slug')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, advertisements: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all ads for admin panel (including inactive)
// @route   GET /api/advertisements/admin
// @access  Private/Admin
export const getAdminAdvertisements = async (req, res) => {
  try {
    const { type, placement, search } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (placement && placement !== 'all') {
      filter.placement = placement;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { couponCode: { $regex: search, $options: 'i' } },
      ];
    }

    const ads = await Advertisement.find(filter)
      .populate('category', 'name slug')
      .sort({ order: 1, createdAt: -1 });

    res.json({ success: true, advertisements: ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single advertisement
// @route   GET /api/advertisements/:id
// @access  Public
export const getAdvertisementById = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id).populate('category', 'name slug');
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }
    res.json({ success: true, advertisement: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create advertisement
// @route   POST /api/advertisements
// @access  Private/Admin
export const createAdvertisement = async (req, res) => {
  try {
    const adData = { ...req.body };

    if (adData.category) {
      const catDoc = await Category.findById(adData.category);
      if (catDoc) {
        adData.categorySlug = catDoc.slug;
      }
    }

    const ad = await Advertisement.create(adData);
    res.status(201).json({ success: true, advertisement: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update advertisement
// @route   PUT /api/advertisements/:id
// @access  Private/Admin
export const updateAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    const adData = { ...req.body };
    if (adData.category && adData.category !== ad.category?.toString()) {
      const catDoc = await Category.findById(adData.category);
      if (catDoc) {
        adData.categorySlug = catDoc.slug;
      }
    }

    Object.assign(ad, adData);
    const updatedAd = await ad.save();

    res.json({ success: true, advertisement: updatedAd });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle advertisement active status
// @route   PATCH /api/advertisements/:id/toggle
// @access  Private/Admin
export const toggleAdvertisementStatus = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    ad.isActive = !ad.isActive;
    await ad.save();

    res.json({ success: true, advertisement: ad, message: `Ad ${ad.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private/Admin
export const deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    await Advertisement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Advertisement removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
