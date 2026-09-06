import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { categoriesData } from '../seed/seedData.js';

// @desc    Get all categories with subcategories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    let categories = await Category.find({}).sort({ name: 1 });

    // Ensure subcategories are populated if empty
    for (const cat of categories) {
      if (!cat.subcategories || cat.subcategories.length === 0) {
        const foundData = categoriesData.find(
          (c) => c.slug === cat.slug || c.name.toLowerCase() === cat.name.toLowerCase()
        );
        if (foundData && foundData.subcategories && foundData.subcategories.length > 0) {
          cat.subcategories = foundData.subcategories;
          await cat.save();
        }
      }
    }

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    let category;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(req.params.id);
    }
    if (!category) {
      category = await Category.findOne({ slug: req.params.id });
    }

    if (category) {
      if (!category.subcategories || category.subcategories.length === 0) {
        const foundData = categoriesData.find(
          (c) => c.slug === category.slug || c.name.toLowerCase() === category.name.toLowerCase()
        );
        if (foundData && foundData.subcategories && foundData.subcategories.length > 0) {
          category.subcategories = foundData.subcategories;
          await category.save();
        }
      }
      res.json({ success: true, category });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, icon, isFeatured, subcategories } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');

    const categoryExists = await Category.findOne({ $or: [{ name }, { slug }] });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image: image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80',
      icon: icon || 'grid',
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      subcategories: Array.isArray(subcategories) ? subcategories : [],
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      if (req.body.name) {
        category.slug = req.body.name
          .toLowerCase()
          .replace(/[^\w ]+/g, '')
          .replace(/ +/g, '-');
      }
      category.description = req.body.description !== undefined ? req.body.description : category.description;
      category.image = req.body.image || category.image;
      category.icon = req.body.icon || category.icon;
      if (req.body.isFeatured !== undefined) category.isFeatured = Boolean(req.body.isFeatured);
      if (req.body.subcategories) category.subcategories = req.body.subcategories;

      const updatedCategory = await category.save();
      res.json({ success: true, category: updatedCategory });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      // Check if products exist in category
      const productCount = await Product.countDocuments({ category: category._id });
      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category. It contains ${productCount} active products.`,
        });
      }

      await Category.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Category removed' });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
