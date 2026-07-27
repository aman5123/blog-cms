import { Category } from '../models/Category.js';
import { Post } from '../models/Post.js';
import { isInMemoryFallback } from '../config/db.js';
import { mockCategories } from '../config/mockStore.js';

// @desc Get all categories with post counts
// @route GET /api/categories
export const getCategories = async (req, res) => {
  try {
    if (isInMemoryFallback) {
      return res.json(mockCategories);
    }

    const categories = await Category.find().sort({ name: 1 });
    if (categories.length === 0) return res.json(mockCategories);

    const categoriesWithCount = await Promise.all(
      categories.map(async (c) => {
        const postCount = await Post.countDocuments({ category: c._id, status: 'published' });
        return {
          id: c._id,
          _id: c._id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          postCount,
        };
      })
    );
    res.json(categoriesWithCount);
  } catch (error) {
    res.json(mockCategories);
  }
};

// @desc Create new category
// @route POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, slug: customSlug, description } = req.body;
    const slug = customSlug || name.toLowerCase().replace(/ +/g, '-');

    if (isInMemoryFallback) {
      const newCat = {
        _id: 'cat_' + Date.now(),
        id: 'cat_' + Date.now(),
        name,
        slug,
        description: description || '',
        postCount: 0,
      };
      mockCategories.push(newCat);
      return res.status(201).json(newCat);
    }

    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
    });

    res.status(201).json({
      id: category._id,
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      postCount: 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a category
// @route DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    if (isInMemoryFallback) {
      const idx = mockCategories.findIndex((c) => c.id === req.params.id || c._id === req.params.id);
      if (idx !== -1) mockCategories.splice(idx, 1);
      return res.json({ message: 'Category deleted' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    await category.deleteOne();
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
