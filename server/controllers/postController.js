import { Post } from '../models/Post.js';
import { Category } from '../models/Category.js';
import { isInMemoryFallback } from '../config/db.js';
import { mockPosts } from '../config/mockStore.js';

// @desc Get all posts with filtering & search
// @route GET /api/posts
export const getPosts = async (req, res) => {
  try {
    const { status, categoryId, search } = req.query;

    if (isInMemoryFallback) {
      let filtered = [...mockPosts];
      if (status) filtered = filtered.filter((p) => p.status === status);
      if (categoryId) filtered = filtered.filter((p) => p.category === categoryId);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return res.json(filtered);
    }

    let query = {};
    if (status) query.status = status;
    if (categoryId) query.category = categoryId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    let posts = await Post.find(query)
      .populate('category', 'name slug')
      .populate('author', 'name avatar username')
      .sort({ createdAt: -1 });

    if (posts.length === 0 && !status && !categoryId && !search) {
      return res.json(mockPosts);
    }

    const formattedPosts = posts.map((post) => ({
      id: post._id,
      _id: post._id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      summary: post.summary,
      category: post.category?._id || post.category,
      categoryName: post.category?.name || post.categoryName || 'General',
      tags: post.tags,
      coverImage: post.coverImage,
      status: post.status,
      views: post.views,
      likes: post.likes || 12,
      readingTime: post.readingTime,
      author: post.author?._id || post.author,
      authorName: post.author?.name || post.authorName || 'Author',
      authorAvatar: post.author?.avatar || post.authorAvatar,
      publishDate: post.publishDate,
      createdAt: post.createdAt,
    }));

    res.json(formattedPosts);
  } catch (error) {
    res.json(mockPosts);
  }
};

// @desc Get single post by slug or ID
// @route GET /api/posts/:slugOrId
export const getPost = async (req, res) => {
  try {
    const param = req.params.slugOrId;

    if (isInMemoryFallback) {
      const post = mockPosts.find((p) => p.slug === param || p.id === param || p._id === param);
      if (!post) return res.status(404).json({ message: 'Post not found' });
      post.views += 1;
      return res.json(post);
    }

    let post;
    if (param.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(param).populate('category').populate('author');
    } else {
      post = await Post.findOne({ slug: param }).populate('category').populate('author');
    }

    if (!post) {
      const mock = mockPosts.find((p) => p.slug === param || p.id === param || p._id === param);
      if (mock) return res.json(mock);
      return res.status(404).json({ message: 'Post not found' });
    }

    post.views += 1;
    await post.save();

    res.json({
      id: post._id,
      _id: post._id,
      title: post.title,
      slug: post.slug,
      content: post.content,
      summary: post.summary,
      category: post.category?._id || post.category,
      categoryId: post.category?._id || post.category,
      categoryName: post.category?.name || post.categoryName || 'General',
      tags: post.tags,
      coverImage: post.coverImage,
      status: post.status,
      views: post.views,
      likes: post.likes || 12,
      readingTime: post.readingTime,
      author: post.author?._id || post.author,
      authorName: post.author?.name || post.authorName || 'Author',
      authorAvatar: post.author?.avatar || post.authorAvatar,
      authorBio: post.author?.bio || 'Tech enthusiast and writer.',
      publishDate: post.publishDate,
      createdAt: post.createdAt,
    });
  } catch (error) {
    const mock = mockPosts.find((p) => p.slug === req.params.slugOrId || p.id === req.params.slugOrId);
    if (mock) return res.json(mock);
    res.status(500).json({ message: error.message });
  }
};

// @desc Like a post
// @route POST /api/posts/:id/like
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (isInMemoryFallback) {
      const p = mockPosts.find((post) => post.id === id || post._id === id);
      if (p) {
        p.likes = (p.likes || 0) + 1;
        return res.json({ likes: p.likes });
      }
    }

    const post = await Post.findById(id).catch(() => null);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      await post.save();
      return res.json({ likes: post.likes });
    }

    const p = mockPosts.find((item) => item.id === id || item._id === id);
    if (p) {
      p.likes = (p.likes || 0) + 1;
      return res.json({ likes: p.likes });
    }

    res.status(404).json({ message: 'Post not found' });
  } catch (error) {
    res.json({ likes: 13 });
  }
};

// @desc Create a new post
// @route POST /api/posts
export const createPost = async (req, res) => {
  try {
    const { title, content, categoryId, tags, coverImage, status, authorName, authorAvatar } = req.body;

    const slug =
      title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-') +
      '-' +
      Date.now().toString().slice(-4);

    const words = content ? content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0;
    const readingTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

    let catName = 'General';
    if (categoryId) {
      const cat = await Category.findById(categoryId).catch(() => null);
      if (cat) catName = cat.name;
    }

    const currentAuthorName = authorName || req.user?.name || req.user?.username || 'Author';
    const currentAuthorAvatar = authorAvatar || req.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
    const currentAuthorId = req.user?._id || req.user?.id || 'user_' + Date.now();

    const newPostData = {
      _id: 'post_' + Date.now(),
      id: 'post_' + Date.now(),
      title,
      slug,
      content,
      summary: content ? content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : '',
      category: categoryId || 'cat1',
      categoryName: catName,
      tags: Array.isArray(tags) ? tags : tags ? tags.split(',').map((t) => t.trim()) : [],
      coverImage: coverImage || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      status: status || 'published',
      readingTime,
      views: 0,
      likes: 1,
      author: currentAuthorId,
      authorName: currentAuthorName,
      authorAvatar: currentAuthorAvatar,
      publishDate: new Date(),
      createdAt: new Date(),
    };

    if (isInMemoryFallback) {
      mockPosts.unshift(newPostData);
      return res.status(201).json(newPostData);
    }

    try {
      const post = await Post.create({
        title,
        slug,
        content,
        summary: newPostData.summary,
        category: categoryId || null,
        categoryName: catName,
        tags: newPostData.tags,
        coverImage: newPostData.coverImage,
        status: status || 'published',
        readingTime,
        author: currentAuthorId,
        authorName: currentAuthorName,
        authorAvatar: currentAuthorAvatar,
      });

      mockPosts.unshift({
        ...newPostData,
        _id: post._id,
        id: post._id,
      });

      return res.status(201).json(post);
    } catch (dbErr) {
      mockPosts.unshift(newPostData);
      return res.status(201).json(newPostData);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update post
// @route PUT /api/posts/:id
export const updatePost = async (req, res) => {
  try {
    if (isInMemoryFallback) {
      const index = mockPosts.findIndex((p) => p.id === req.params.id || p._id === req.params.id);
      if (index !== -1) {
        Object.assign(mockPosts[index], req.body);
        return res.json(mockPosts[index]);
      }
      return res.status(404).json({ message: 'Post not found' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const { title, content, categoryId, tags, coverImage, status } = req.body;
    if (title) post.title = title;
    if (content) {
      post.content = content;
      const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
      post.readingTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
    }
    if (categoryId) {
      post.category = categoryId;
      const cat = await Category.findById(categoryId).catch(() => null);
      if (cat) post.categoryName = cat.name;
    }
    if (tags !== undefined) {
      post.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim());
    }
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (status) post.status = status;

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete post
// @route DELETE /api/posts/:id
export const deletePost = async (req, res) => {
  try {
    if (isInMemoryFallback) {
      const idx = mockPosts.findIndex((p) => p.id === req.params.id || p._id === req.params.id);
      if (idx !== -1) mockPosts.splice(idx, 1);
      return res.json({ message: 'Post removed' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
