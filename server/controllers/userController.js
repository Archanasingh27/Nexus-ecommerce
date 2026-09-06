import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    
    // Safely aggregate order counts in 1 fast query instead of N queries
    const orderCountMap = {};
    try {
      const orderCounts = await Order.aggregate([
        { $group: { _id: '$user', count: { $sum: 1 } } }
      ]);
      orderCounts.forEach((oc) => {
        if (oc._id) {
          orderCountMap[oc._id.toString()] = oc.count;
        }
      });
    } catch (aggErr) {
      console.warn('[getAllUsers] Order count aggregation fallback:', aggErr.message);
    }

    const usersWithStats = users.map((u) => ({
      _id: u._id,
      name: u.name || 'Anonymous User',
      email: u.email || '',
      role: u.role || 'user',
      avatar: u.avatar || '',
      phone: u.phone || '',
      address: u.address || {},
      orderCount: orderCountMap[u._id.toString()] || 0,
      createdAt: u.createdAt || new Date(),
    }));

    res.json({ success: true, users: usersWithStats });
  } catch (error) {
    console.error('[getAllUsers Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
  }
};


// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 });
      res.json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
          createdAt: user.createdAt,
          orders,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.email === 'admin@nexus.com' && role !== 'admin') {
        return res.status(400).json({ success: false, message: 'Primary admin role cannot be revoked' });
      }

      user.role = role || user.role;
      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.email === 'admin@nexus.com' && role && role !== 'admin') {
        return res.status(400).json({ success: false, message: 'Primary admin role cannot be revoked' });
      }

      user.name = name || user.name;
      user.email = email || user.email;
      if (phone !== undefined) user.phone = phone;
      if (role) user.role = role;

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      if (user.role === 'admin' && user.email === 'admin@nexus.com') {
        return res.status(400).json({ success: false, message: 'Cannot delete default admin account' });
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

