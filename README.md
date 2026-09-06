# Premium MERN Stack Content Management System & Blog Platform

A modern, full-stack **MERN** (MongoDB, Express.js, React 18, Node.js) Content Management System (CMS) & Blog Platform designed with glassmorphism UI aesthetics, role-based authorization, rich article editor with live split-preview, interactive Chart.js analytics dashboard, comments moderation, bookmarking, and dark/light theme toggle.

---

## 🌟 Key Features

### 🖥️ Public Reading Experience
- **Hero & Featured Carousel**: Dynamic hero section showcasing top featured articles.
- **Category Filtering & Live Search**: Instant multi-tag filter and query search across all published articles.
- **Article Reader View**: Reading progress bar, estimated reading time, author bio, social sharing, and interactive comment section.
- **Bookmarks Drawer**: Saved articles drawer persisted across sessions.
- **Theme Switching**: Smooth dark/light mode toggle with persistent preferences.

### 🛡️ Admin & Author Workspace
- **Analytics Dashboard**: Interactive Chart.js graphs displaying total views, published vs. draft posts, comment metrics, and top posts.
- **Rich Editor with Live Split-Preview**: Real-time markdown/HTML split editor with auto-save draft functionality (every 30 seconds).
- **Post Management**: Filterable grid view to publish, edit, or delete posts.
- **Comment Moderation**: Admin workflow to approve, reject, or purge reader comments.
- **User & Role Administration**: Manage system users and promote roles (`admin`, `author`, `subscriber`).
- **Site Configuration**: Control site settings, posts per page, and registration/comment toggles.
- **Profile & Password Management**: Manage personal bio, avatar, website, and security settings.

---

## 📁 Project Structure

```
blog/
├── package.json               # Root scripts (concurrently runner for client & server)
├── README.md                  # Comprehensive documentation
├── server/                    # Node.js + Express REST API Backend
│   ├── config/
│   │   └── db.js              # MongoDB Mongoose connection handler
│   ├── controllers/           # API Business logic controllers
│   │   ├── authController.js
│   │   ├── postController.js
│   │   ├── categoryController.js
│   │   ├── commentController.js
│   │   ├── userController.js
│   │   ├── statsController.js
│   │   └── settingsController.js
│   ├── middleware/
│   │   └── auth.js            # JWT verification & RBAC authorization
│   ├── models/                # Mongoose Schema definitions
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Category.js
│   │   ├── Comment.js
│   │   └── Settings.js
│   ├── routes/                # Express Routers
│   ├── seed.js                # Database seeder with sample posts & accounts
│   └── server.js              # Express app initialization
└── client/                    # React 18 + Vite Frontend Application
    ├── index.html             # Vite entry HTML
    ├── vite.config.js         # Vite configuration with /api proxy
    └── src/
        ├── App.jsx            # React Router v6 navigation & protected routes
        ├── main.jsx           # React DOM root render
        ├── components/        # Reusable UI components (Navbar, Footer, Sidebar, Toast)
        ├── context/           # React Context (AuthContext, ThemeContext)
        ├── pages/             # Public & Admin pages
        ├── services/          # Axios API abstraction service
        └── styles/            # CSS Design System (index.css, admin.css, auth.css)
```

---

## 🔑 Default Seed Accounts

When running `npm run seed` (or booting the server for the first time), the database seeds the following test accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` | Full control over posts, comments, users, and settings |
| **Author** | `author@example.com` | `author123` | Can write, edit, and publish own articles |
| **Subscriber**| `user@example.com` | `user123` | Can read, bookmark, and leave comments |

---

## 🛠️ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB server or MongoDB Atlas connection URI (optional; in-memory fallback enabled if offline).

### 1. Install Dependencies
Install dependencies for both root/backend and frontend:
```bash
npm install
cd client && npm install && cd ..
```

### 2. Seed Sample Data (Optional but Recommended)
Populate default categories, admin/author accounts, and sample articles:
```bash
npm run seed
```

### 3. Run Development Server
Run backend API (`localhost:5000`) and React frontend (`localhost:3000`) simultaneously:
```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user & receive JWT token
- `GET /api/auth/me` - Fetch authenticated user details

### Posts
- `GET /api/posts` - List published/draft posts (query params: `status`, `categoryId`, `search`)
- `GET /api/posts/:slugOrId` - Fetch single post details & increment view count
- `POST /api/posts` - Create post (*Author/Admin*)
- `PUT /api/posts/:id` - Update post (*Author/Admin*)
- `DELETE /api/posts/:id` - Delete post (*Author/Admin*)

### Categories
- `GET /api/categories` - List categories with article counts
- `POST /api/categories` - Create new category (*Author/Admin*)
- `DELETE /api/categories/:id` - Remove category (*Admin*)

### Comments
- `GET /api/comments` - List comments (*Admin*)
- `POST /api/comments` - Post comment on article
- `PUT /api/comments/:id/status` - Moderate comment status (`approved`, `rejected`) (*Admin*)
- `DELETE /api/comments/:id` - Delete comment (*Admin*)

### Users & Settings
- `GET /api/users` - List all registered users (*Admin*)
- `PUT /api/users/:id/role` - Update user access role (*Admin*)
- `PUT /api/users/profile` - Update profile info
- `PUT /api/users/password` - Change account password
- `GET /api/stats` - Fetch analytics stats for Dashboard (*Admin/Author*)
- `GET /api/settings` - Fetch site settings
- `PUT /api/settings` - Update site configuration (*Admin*)

---
## 🛡️ License
MIT License. Built for submission & production readiness.
