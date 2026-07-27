import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { API } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import '../../styles/admin.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalPosts: 0,
    draftPosts: 0,
    publishedPosts: 0,
    totalViews: 0,
    totalUsers: 0,
    totalComments: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, postsData] = await Promise.all([
        API.getStats(),
        API.getPosts(),
      ]);
      setStats(statsData);

      if (!isAdmin) {
        const currentId = currentUser?.id || currentUser?._id;
        const myPosts = postsData.filter(
          (p) =>
            (p.author?._id || p.author || p.authorId) === currentId ||
            p.authorName === currentUser?.name ||
            p.authorName === currentUser?.username
        );
        setRecentPosts(myPosts.slice(0, 5));
        setStats({
          ...statsData,
          totalPosts: myPosts.length,
          publishedPosts: myPosts.filter((p) => p.status === 'published').length,
          draftPosts: myPosts.filter((p) => p.status === 'draft').length,
          totalViews: myPosts.reduce((sum, p) => sum + (p.views || 0), 0),
        });
      } else {
        setRecentPosts(postsData.slice(0, 5));
      }

      if (statsData.analyticsChart) {
        setChartData({
          labels: statsData.analyticsChart.labels,
          datasets: [
            {
              label: 'Page Views',
              data: statsData.analyticsChart.views,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.4,
            },
            {
              label: 'Reader Engagement',
              data: statsData.analyticsChart.engagement,
              borderColor: '#22c55e',
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              fill: true,
              tension: 0.4,
            },
          ],
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
              <i className="fas fa-bars"></i>
            </button>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Dashboard</span>
          </div>

          <div className="topbar-right">
            <button className="btn-icon" onClick={toggleTheme} title="Toggle Theme">
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <Link to="/" className="btn btn-secondary btn-icon" title="View Public Site">
              <i className="fas fa-external-link-alt"></i>
            </Link>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>

        <div className="admin-content">
          <div className="page-header">
            <div>
              <h1 style={{ fontSize: '1.75rem' }}>Welcome, {currentUser?.name}</h1>
              <p className="page-title-desc">Here is the active status overview of your blog platform.</p>
            </div>
            <Link to="/admin/editor" className="btn btn-primary">
              <i className="fas fa-plus"></i> Write Post
            </Link>
          </div>

          {/* Metric Cards Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Total Articles</span>
                <span className="metric-value">{stats.totalPosts}</span>
              </div>
              <div className="metric-icon-wrapper metric-icon-posts">
                <i className="fas fa-newspaper"></i>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">{isAdmin ? 'Total Users' : 'Total Views'}</span>
                <span className="metric-value">{isAdmin ? stats.totalUsers : stats.totalViews}</span>
              </div>
              <div className="metric-icon-wrapper metric-icon-users">
                <i className={`fas ${isAdmin ? 'fa-users' : 'fa-eye'}`}></i>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Comments</span>
                <span className="metric-value">{stats.totalComments}</span>
              </div>
              <div className="metric-icon-wrapper metric-icon-comments">
                <i className="fas fa-comments"></i>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-info">
                <span className="metric-label">Draft Compositions</span>
                <span className="metric-value">{stats.draftPosts}</span>
              </div>
              <div className="metric-icon-wrapper metric-icon-views">
                <i className="fas fa-pencil-alt"></i>
              </div>
            </div>
          </div>

          {/* Chart & Activity Grid */}
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <div className="card-header-admin">
                <span className="card-title-admin">
                  <i className="fas fa-chart-line" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                  Traffic & Engagement Analytics
                </span>
              </div>
              <div style={{ height: '300px' }}>
                {chartData ? <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /> : null}
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header-admin">
                <span className="card-title-admin">
                  <i className="fas fa-history" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                  System Status
                </span>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-desc">
                    <strong>Express REST API</strong> connected and serving endpoints.
                    <div className="activity-time">Active</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot" style={{ backgroundColor: 'var(--success)' }}></div>
                  <div className="activity-desc">
                    <strong>Mongoose Persistence</strong> data sync active.
                    <div className="activity-time">Healthy</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-dot" style={{ backgroundColor: 'var(--warning)' }}></div>
                  <div className="activity-desc">
                    <strong>JWT Route Guards</strong> enforcing role access.
                    <div className="activity-time">Protected</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Articles Table */}
          <div className="dashboard-card">
            <div className="card-header-admin">
              <span className="card-title-admin">
                <i className="fas fa-folder-open" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                Recent Articles
              </span>
              <Link to="/admin/posts" className="auth-link" style={{ fontSize: '0.9rem' }}>View All Posts</Link>
            </div>

            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Views</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPosts.map((p) => (
                    <tr key={p.id || p._id}>
                      <td>
                        <div className="table-post-cell">
                          <img src={p.coverImage} alt={p.title} className="table-post-img" />
                          <span className="table-post-title">{p.title}</span>
                        </div>
                      </td>
                      <td>{p.categoryName}</td>
                      <td>{new Date(p.publishDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
