import Newsletter from '../models/Newsletter.js';

// @desc    Subscribe to email newsletter
// @route   POST /newsletter/subscribe
// @access  Public
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await Newsletter.findOne({ email: cleanEmail });

    if (existing) {
      if (existing.status === 'unsubscribed') {
        existing.status = 'active';
        await existing.save();
        return res.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.',
        });
      }
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: 'You are already subscribed to Nexus drops & flash deals!',
      });
    }

    await Newsletter.create({
      email: cleanEmail,
      status: 'active',
      source: 'footer_newsletter',
    });

    res.status(201).json({
      success: true,
      message: 'Thank you! You are now subscribed to exclusive Nexus drops & discounts.',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.json({
        success: true,
        alreadySubscribed: true,
        message: 'You are already subscribed to Nexus drops & flash deals!',
      });
    }
    res.status(500).json({ success: false, message: error.message || 'Subscription failed' });
  }
};

// @desc    Get all newsletter subscribers
// @route   GET /newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
    const count = await Newsletter.countDocuments({ status: 'active' });
    res.json({ success: true, count, subscribers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
