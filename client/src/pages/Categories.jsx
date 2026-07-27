import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API } from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const catIcons = {
    Technology: 'fa-microchip',
    Science: 'fa-flask',
    Health: 'fa-heartbeat',
    Design: 'fa-paint-brush',
    Business: 'fa-briefcase',
    Travel: 'fa-plane',
    Food: 'fa-utensils',
    Education: 'fa-graduation-cap',
    Politics: 'fa-landmark',
    Sports: 'fa-football-ball',
    Entertainment: 'fa-film',
    default: 'fa-folder',
  };

  const catColors = [
    'var(--primary)',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#06b6d4',
    '#ec4899',
    '#14b8a6',
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          padding: '80px 24px 60px',
          textAlign: 'center',
          color: '#fff',
        }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '16px' }}>
            Browse Categories
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.85, maxWidth: '500px', margin: '0 auto' }}>
            Explore topics that matter to you
          </p>
        </section>

        <section style={{ maxWidth: '1100px', margin: '60px auto', padding: '0 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}></i>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px' }}>
              <i className="fas fa-folder-open" style={{ fontSize: '4rem', marginBottom: '16px', display: 'block' }}></i>
              <p>No categories found. Check back later.</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px',
            }}>
              {categories.map((cat, idx) => {
                const color = catColors[idx % catColors.length];
                const icon = catIcons[cat.name] || catIcons.default;
                return (
                  <Link
                    key={cat.id || cat._id}
                    to={`/?category=${cat.slug || cat.name}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '32px 24px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.boxShadow = `0 20px 40px ${color}25`;
                        e.currentTarget.style.borderColor = color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = '';
                        e.currentTarget.style.boxShadow = '';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '16px',
                        background: `${color}20`, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.75rem', color,
                      }}>
                        <i className={`fas ${icon}`}></i>
                      </div>
                      <h3 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>{cat.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {cat.postCount || 0} {cat.postCount === 1 ? 'article' : 'articles'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
