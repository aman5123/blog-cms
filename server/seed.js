import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { Post } from './models/Post.js';
import { Comment } from './models/Comment.js';

dotenv.config();

export const initialCategoriesData = [
  { name: 'Technology', slug: 'technology', description: 'Core software engineering, algorithms, and web tools.' },
  { name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'LLMs, machine learning models, and automation.' },
  { name: 'Web Design', slug: 'web-design', description: 'UI/UX layout strategies, glassmorphism, and responsive CSS.' },
  { name: 'SaaS Strategy', slug: 'saas-strategy', description: 'Growth metrics, platform architecture, and product management.' },
];

export const initialUsersData = [
  {
    username: 'aman',
    name: 'Aman (Lead Developer)',
    email: 'amanvrma089@gmail.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Full Stack MERN Developer & System Architect.',
    website: 'https://github.com/aman5123',
  },
  {
    username: 'jane_author',
    name: 'Jane Doe',
    email: 'author@cms.com',
    password: 'author123',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Lead technical writer focusing on modern JS frameworks and AI integrations.',
  },
  {
    username: 'john_doe',
    name: 'John Doe',
    email: 'user@cms.com',
    password: 'user123',
    role: 'subscriber',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Avid reader and tech enthusiast.',
  },
];

export const initialPostsData = (adminId, authorId, techCatId, aiCatId, designCatId) => [
  {
    title: 'Mastering Clean Code Architecture in MERN Applications',
    slug: 'mastering-clean-code-architecture-in-mern-applications',
    content: `
      <h2>The Core Pillars of Clean MERN Code</h2>
      <p>Building scalable web applications requires strict separation of concerns. In modern MERN stack projects, separating database models, API controllers, and presentation components guarantees maintainability over long lifecycles.</p>
      <h3>1. Controller Decoupling</h3>
      <p>Avoid placing heavy business logic or raw database queries inside Express route files. Route definitions should act as simple mappers between endpoints and controller handlers.</p>
      <h3>2. Async Handler Abstractions</h3>
      <p>Wrap standard Promises using try-catch blocks or custom middleware to ensure unhandled promise rejections never crash your server.</p>
      <pre><code>// Example Clean Controller Handler
export const getPosts = async (req, res) => {
  const posts = await Post.find().populate('category');
  res.json(posts);
};</code></pre>
    `,
    summary: 'Learn best practices for structuring models, routes, and controllers in production MERN stack projects.',
    category: techCatId,
    categoryName: 'Technology',
    tags: ['JavaScript', 'React', 'NodeJS', 'MongoDB'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    status: 'published',
    views: 1420,
    readingTime: '4 min read',
    author: adminId,
    authorName: 'Aman',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    publishDate: new Date('2026-06-15'),
  },
  {
    title: 'The Rise of Large Language Models in Content Strategy',
    slug: 'the-rise-of-large-language-models-in-content-strategy',
    content: `
      <h2>AI-Driven Publishing Workflows</h2>
      <p>Large Language Models are transforming how digital content is planned, created, and optimized. From automated tagging to real-time draft suggestions, AI tools provide immense leverage to modern editorial teams.</p>
      <h3>Contextual Summarization</h3>
      <p>By generating quick 2-sentence summaries from long-form technical articles, platforms can significantly improve reader engagement and click-through rates on search grids.</p>
    `,
    summary: 'How artificial intelligence and generative models are reshaping digital blogging ecosystems.',
    category: aiCatId,
    categoryName: 'Artificial Intelligence',
    tags: ['AI', 'LLM', 'ContentStrategy', 'Automation'],
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
    status: 'published',
    views: 980,
    readingTime: '3 min read',
    author: authorId,
    authorName: 'Jane Doe',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    publishDate: new Date('2026-06-18'),
  },
  {
    title: 'Designing the Perfect Light & Dark Theme Glassmorphism UI',
    slug: 'designing-the-perfect-light-dark-theme-glassmorphism-ui',
    content: `
      <h2>The Glassmorphism Visual System</h2>
      <p>Creating a seamless transition between light and dark modes requires more than just swapping background colors. Utilizing CSS custom properties and backdrop-filters delivers a futuristic glass appearance across all viewport sizes.</p>
      <h3>Backdrop Filter & CSS Variables</h3>
      <pre><code>:root {
  --surface: rgba(255, 255, 255, 0.7);
  --backdrop: blur(12px);
}
[data-theme="dark"] {
  --surface: rgba(15, 23, 42, 0.75);
}</code></pre>
    `,
    summary: 'A step-by-step design guide to implementing adaptive themes with CSS custom properties.',
    category: designCatId,
    categoryName: 'Web Design',
    tags: ['CSS', 'UI/UX', 'Glassmorphism', 'DesignSystem'],
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    status: 'published',
    views: 750,
    readingTime: '5 min read',
    author: adminId,
    authorName: 'Aman',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    publishDate: new Date('2026-06-20'),
  },
];

export const seedDatabase = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cms_blog';
    await mongoose.connect(connStr, { serverSelectionTimeoutMS: 3000 });
    console.log('Seed: Connected to MongoDB.');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    // Seed Categories
    const categories = await Category.insertMany(initialCategoriesData);
    console.log(`Seed: Created ${categories.length} categories.`);

    // Seed Users
    const users = [];
    for (const u of initialUsersData) {
      const user = await User.create(u);
      users.push(user);
    }
    console.log(`Seed: Created ${users.length} users.`);

    const admin = users.find((u) => u.role === 'admin');
    const author = users.find((u) => u.role === 'author');
    const techCat = categories.find((c) => c.slug === 'technology');
    const aiCat = categories.find((c) => c.slug === 'artificial-intelligence');
    const designCat = categories.find((c) => c.slug === 'web-design');

    // Seed Posts
    const postsData = initialPostsData(
      admin._id,
      author._id,
      techCat._id,
      aiCat._id,
      designCat._id
    );
    const posts = await Post.insertMany(postsData);
    console.log(`Seed: Created ${posts.length} articles.`);

    // Seed Comments
    await Comment.create({
      post: posts[0]._id,
      author: 'John Doe',
      email: 'user@cms.com',
      content: 'Fantastic article! Clean architecture makes long-term maintenance so much easier.',
      status: 'approved',
    });

    console.log('Seed: Database populated successfully!');
    if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seed Error:', error.message);
    if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
      process.exit(1);
    }
  }
};

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
