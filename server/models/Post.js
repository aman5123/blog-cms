import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    default: '',
  },
  category: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Category',
    default: null,
  },
  categoryName: {
    type: String,
    default: 'General',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published',
  },
  views: {
    type: Number,
    default: 0,
  },
  readingTime: {
    type: String,
    default: '3 min read',
  },
  author: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    default: null,
  },
  authorName: {
    type: String,
    default: 'Author',
  },
  authorAvatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  },
  publishDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export const Post = mongoose.model('Post', postSchema);
