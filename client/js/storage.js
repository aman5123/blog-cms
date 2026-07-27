// storage.js - LocalStorage Repository Layer

const DEFAULT_USERS = [
  {
    id: 1,
    username: "admin",
    email: "admin@cms.com",
    password: "admin123", // In a real app, this would be hashed
    name: "Alex Rivera",
    role: "admin",
    status: "active",
    bio: "Lead developer and platform architect. Enjoys deep dives into design systems and database architecture.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    username: "jane_author",
    email: "author@cms.com",
    password: "author123",
    name: "Jane Doe",
    role: "author",
    status: "active",
    bio: "Content strategist and tech journalist. Writing about the future of AI, web experiences, and product design.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    username: "john_doe",
    email: "user@cms.com",
    password: "user123",
    name: "John Reader",
    role: "user",
    status: "active",
    bio: "Avid tech reader and UI reviewer.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  }
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Technology", slug: "technology" },
  { id: 2, name: "Artificial Intelligence", slug: "ai" },
  { id: 3, name: "Web Design", slug: "web-design" },
  { id: 4, name: "Lifestyle", slug: "lifestyle" }
];

const DEFAULT_POSTS = [
  {
    id: 1,
    title: "Designing the Perfect Light & Dark Theme System",
    slug: "designing-perfect-theme-system",
    content: `<p>Creating a seamless transition between light and dark modes requires more than just swapping background colors. A successful design system carefully balances contrast, reduces eye strain, and maintains visual hierarchy across both states.</p>
    <h3>1. The Contrast Equation</h3>
    <p>When swapping variables, pure black (#000) or pure white (#fff) can create harsh contrast. Instead, try utilizing slate tones like #090d16 or off-whites like #f8fafc. These softer tones reduce user fatigue during long reading sessions.</p>
    <p>Using CSS variables, we can construct customizable themes that adapt dynamically to user preferences:</p>
    <pre><code>:root {
  --background: #f8fafc;
  --surface: #ffffff;
  --text: #0f172a;
}
.dark-theme {
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f8fafc;
}</code></pre>
    <h3>2. Image Contrast & Saturation</h3>
    <p>In dark mode, vibrant colors appear brighter. It's often helpful to dim images slightly using CSS filters to prevent them from blinding users:</p>
    <pre><code>.dark-theme img {
  filter: brightness(0.85) contrast(1.1);
}</code></pre>
    <p>This subtle adjustment makes the reading experience much more unified and premium. Experiment with gradients, micro-interactions, and custom borders to truly elevate your application.</p>`,
    categoryId: 3,
    tags: ["CSS", "Design Systems", "WebDev"],
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    authorId: 1,
    publishDate: "2026-06-01T10:00:00.000Z",
    readingTime: "4 min read",
    status: "published",
    views: 1245
  },
  {
    id: 2,
    title: "The Rise of Large Language Models in Content Strategy",
    slug: "rise-llm-content-strategy",
    content: `<p>Large Language Models (LLMs) are transforming how digital content is planned, created, and optimized. Rather than replacing writers, these tools act as powerful creative partners, accelerating research and editing workflows.</p>
    <h3>Co-Writing and Dynamic Ideation</h3>
    <p>By leveraging structured prompts, content creators can brainstorm hundreds of angles for a single story in seconds. The trick lies in feeding the LLM unique context and specific brand guidelines to maintain a signature human voice.</p>
    <blockquote>"The goal is not to write faster, but to explore deeper angles and produce higher-quality insights for the reader."</blockquote>
    <p>In the coming years, we will see CMS engines integrating contextual assistance directly into editor screens, making drafting interactive and automated.</p>`,
    categoryId: 2,
    tags: ["AI", "Writing", "FutureTech"],
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    authorId: 2,
    publishDate: "2026-06-03T14:30:00.000Z",
    readingTime: "6 min read",
    status: "published",
    views: 890
  },
  {
    id: 3,
    title: "Mastering Clean Code in Vanilla JavaScript Applications",
    slug: "clean-code-vanilla-javascript",
    content: `<p>Frameworks come and go, but the core fundamentals of JavaScript remain. Writing maintainable, modular vanilla JS code is a superpower that guarantees fast load times and minimal library overhead.</p>
    <h3>Avoid Global Polluted Scope</h3>
    <p>By leveraging ES6 modules or immediately invoked functions, you isolate your variables and prevent side effects. Let's look at how modules keep namespaces clean:</p>
    <pre><code>// mathUtils.js
export const sum = (a, b) => a + b;

// main.js
import { sum } from './mathUtils.js';
console.log(sum(5, 10));</code></pre>
    <p>Furthermore, isolating storage logic from API handlers and presentation components models standard design patterns. It makes scaling your site straightforward.</p>`,
    categoryId: 1,
    tags: ["JavaScript", "Programming", "CleanCode"],
    coverImage: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&auto=format&fit=crop&q=80",
    authorId: 1,
    publishDate: "2026-06-04T08:15:00.000Z",
    readingTime: "5 min read",
    status: "published",
    views: 654
  },
  {
    id: 4,
    title: "SaaS Design Trends: Why Glassmorphism is Making a Comeback",
    slug: "saas-design-trends-glassmorphism",
    content: `<p>In modern web applications, visual hierarchy is key. Glassmorphism - characterized by its frosted-glass look, colorful backdrops, and subtle borders - is once again taking the SaaS world by storm.</p>
    <p>Its primary advantage is depth. By layering transparent elements, you establish structured overlays that direct user attention without feeling cluttered.</p>`,
    categoryId: 3,
    tags: ["Design", "SaaS", "CSS"],
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    authorId: 2,
    publishDate: "",
    readingTime: "3 min read",
    status: "draft",
    views: 0
  }
];

const DEFAULT_COMMENTS = [
  {
    id: 1,
    postId: 1,
    author: "Samantha Lee",
    email: "samantha@design.io",
    content: "Absolutely love the contrast tips! Dimming images in dark mode is such a subtle but important UX detail that is often ignored.",
    status: "approved",
    date: "2026-06-02T11:20:00.000Z"
  },
  {
    id: 2,
    postId: 1,
    author: "Michael K.",
    email: "mike@code.net",
    content: "Great write-up. Do you have a recommendation for handling embedded code blocks in dark mode themes?",
    status: "pending",
    date: "2026-06-05T09:10:00.000Z"
  },
  {
    id: 3,
    postId: 2,
    author: "Daniel R.",
    email: "daniel@strategy.com",
    content: "I completely agree that AI tools are research partners, not replacements. They make editing and outline drafting 10x faster.",
    status: "approved",
    date: "2026-06-04T16:40:00.000Z"
  }
];

const DEFAULT_BOOKMARKS = [
  { userId: 1, postId: 2 },
  { userId: 3, postId: 1 }
];

export const DB = {
  init() {
    if (!localStorage.getItem("cms_users")) {
      localStorage.setItem("cms_users", JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem("cms_categories")) {
      localStorage.setItem("cms_categories", JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem("cms_posts")) {
      localStorage.setItem("cms_posts", JSON.stringify(DEFAULT_POSTS));
    }
    if (!localStorage.getItem("cms_comments")) {
      localStorage.setItem("cms_comments", JSON.stringify(DEFAULT_COMMENTS));
    }
    if (!localStorage.getItem("cms_bookmarks")) {
      localStorage.setItem("cms_bookmarks", JSON.stringify(DEFAULT_BOOKMARKS));
    }
  },

  getPosts() {
    this.init();
    return JSON.parse(localStorage.getItem("cms_posts"));
  },

  savePosts(posts) {
    localStorage.setItem("cms_posts", JSON.stringify(posts));
  },

  getUsers() {
    this.init();
    return JSON.parse(localStorage.getItem("cms_users"));
  },

  saveUsers(users) {
    localStorage.setItem("cms_users", JSON.stringify(users));
  },

  getCategories() {
    this.init();
    return JSON.parse(localStorage.getItem("cms_categories"));
  },

  saveCategories(categories) {
    localStorage.setItem("cms_categories", JSON.stringify(categories));
  },

  getComments() {
    this.init();
    return JSON.parse(localStorage.getItem("cms_comments"));
  },

  saveComments(comments) {
    localStorage.setItem("cms_comments", JSON.stringify(comments));
  },

  getBookmarks() {
    this.init();
    return JSON.parse(localStorage.getItem("cms_bookmarks"));
  },

  saveBookmarks(bookmarks) {
    localStorage.setItem("cms_bookmarks", JSON.stringify(bookmarks));
  }
};

// Initialize DB immediately on import
DB.init();
