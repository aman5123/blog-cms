// In-memory Mock Data Store for automatic fallback when MongoDB is offline

export const mockCategories = [
  { _id: 'cat1', id: 'cat1', name: 'Technology', slug: 'technology', description: 'Core software engineering, algorithms, and web tools.', postCount: 2 },
  { _id: 'cat2', id: 'cat2', name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'LLMs, machine learning models, and automation.', postCount: 1 },
  { _id: 'cat3', id: 'cat3', name: 'Web Design', slug: 'web-design', description: 'UI/UX layout strategies, glassmorphism, and responsive CSS.', postCount: 1 },
  { _id: 'cat4', id: 'cat4', name: 'SaaS Strategy', slug: 'saas-strategy', description: 'Growth metrics, platform architecture, and product management.', postCount: 0 },
];

export const mockUsers = [
  {
    _id: 'user1',
    id: 'user1',
    username: 'aman',
    name: 'Aman (Lead Developer)',
    email: 'amanvrma089@gmail.com',
    password: '$2a$10$YourHashedPasswordHereOrMatchPassword', // admin123
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Full Stack MERN Developer & System Architect.',
    website: 'https://github.com/aman5123',
    bookmarks: [],
    createdAt: new Date(),
  },
  {
    _id: 'user1_alt',
    id: 'user1_alt',
    username: 'admin',
    name: 'Aman (Admin)',
    email: 'admin@cms.com',
    password: '$2a$10$YourHashedPasswordHereOrMatchPassword', // admin123
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Full Stack MERN Developer & System Architect.',
    website: 'https://github.com/aman5123',
    bookmarks: [],
    createdAt: new Date(),
  },
  {
    _id: 'user2',
    id: 'user2',
    username: 'jane_author',
    name: 'Jane Doe',
    email: 'author@cms.com',
    password: 'author123',
    role: 'author',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Lead technical writer focusing on JS frameworks.',
    website: '',
    bookmarks: [],
    createdAt: new Date(),
  },
];

export const mockPosts = [
  {
    _id: 'post1',
    id: 'post1',
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
    category: 'cat1',
    categoryName: 'Technology',
    tags: ['JavaScript', 'React', 'NodeJS', 'MongoDB'],
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
    status: 'published',
    views: 1420,
    readingTime: '4 min read',
    author: 'user1',
    authorName: 'Aman',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    publishDate: new Date('2026-06-15'),
    createdAt: new Date('2026-06-15'),
  },
  {
    _id: 'post2',
    id: 'post2',
    title: 'The Rise of Large Language Models in Content Strategy',
    slug: 'the-rise-of-large-language-models-in-content-strategy',
    content: `
      <h2>AI-Driven Publishing Workflows</h2>
      <p>Large Language Models are transforming how digital content is planned, created, and optimized. From automated tagging to real-time draft suggestions, AI tools provide immense leverage to modern editorial teams.</p>
      <h3>Contextual Summarization</h3>
      <p>By generating quick 2-sentence summaries from long-form technical articles, platforms can significantly improve reader engagement and click-through rates on search grids.</p>
    `,
    summary: 'How artificial intelligence and generative models are reshaping digital blogging ecosystems.',
    category: 'cat2',
    categoryName: 'Artificial Intelligence',
    tags: ['AI', 'LLM', 'ContentStrategy', 'Automation'],
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
    status: 'published',
    views: 980,
    readingTime: '3 min read',
    author: 'user2',
    authorName: 'Jane Doe',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    publishDate: new Date('2026-06-18'),
    createdAt: new Date('2026-06-18'),
  },
  {
    _id: 'post3',
    id: 'post3',
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
    category: 'cat3',
    categoryName: 'Web Design',
    tags: ['CSS', 'UI/UX', 'Glassmorphism', 'DesignSystem'],
    coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    status: 'published',
    views: 750,
    readingTime: '5 min read',
    author: 'user1',
    authorName: 'Aman',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    publishDate: new Date('2026-06-20'),
    createdAt: new Date('2026-06-20'),
  },
];

export const mockComments = [
  {
    _id: 'com1',
    id: 'com1',
    post: 'post1',
    postTitle: 'Mastering Clean Code Architecture in MERN Applications',
    author: 'John Doe',
    email: 'user@cms.com',
    content: 'Fantastic article by Aman! Clean architecture makes long-term maintenance so much easier.',
    status: 'approved',
    createdAt: new Date(),
  },
];
