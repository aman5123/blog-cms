import { Comment } from '../models/Comment.js';
import { isInMemoryFallback } from '../config/db.js';
import { mockComments } from '../config/mockStore.js';

// @desc Get comments with filters (postId, status)
// @route GET /api/comments
export const getComments = async (req, res) => {
  try {
    const { postId, status } = req.query;

    if (isInMemoryFallback) {
      let filtered = [...mockComments];
      if (postId) filtered = filtered.filter((c) => c.post === postId);
      if (status) filtered = filtered.filter((c) => c.status === status);
      return res.json(filtered);
    }

    let query = {};
    if (postId) query.post = postId;
    if (status) query.status = status;

    const comments = await Comment.find(query).populate('post', 'title slug').sort({ createdAt: -1 });
    if (comments.length === 0) return res.json(mockComments);

    const formatted = comments.map(c => ({
      id: c._id,
      _id: c._id,
      postId: c.post?._id || c.post,
      postTitle: c.post?.title || 'Article',
      author: c.author,
      email: c.email,
      content: c.content,
      status: c.status,
      date: c.date,
      createdAt: c.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    res.json(mockComments);
  }
};

// @desc Create comment
// @route POST /api/comments
export const createComment = async (req, res) => {
  try {
    const { postId, author, email, content } = req.body;

    if (isInMemoryFallback) {
      const newCom = {
        _id: 'com_' + Date.now(),
        id: 'com_' + Date.now(),
        post: postId,
        postTitle: 'Article',
        author: author || 'Guest',
        email: email || 'guest@example.com',
        content,
        status: 'approved',
        createdAt: new Date(),
      };
      mockComments.unshift(newCom);
      return res.status(201).json(newCom);
    }

    const comment = await Comment.create({
      post: postId,
      author,
      email,
      content,
      status: 'approved',
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Moderate comment status
// @route PUT /api/comments/:id/status
export const updateCommentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (isInMemoryFallback) {
      const com = mockComments.find((c) => c.id === req.params.id || c._id === req.params.id);
      if (com) {
        com.status = status;
        return res.json(com);
      }
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    comment.status = status;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete comment
// @route DELETE /api/comments/:id
export const deleteComment = async (req, res) => {
  try {
    if (isInMemoryFallback) {
      const idx = mockComments.findIndex((c) => c.id === req.params.id || c._id === req.params.id);
      if (idx !== -1) mockComments.splice(idx, 1);
      return res.json({ message: 'Comment deleted successfully' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
