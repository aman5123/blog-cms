import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <>
      <Navbar />

      <main className="container" style={{ padding: '60px 0' }}>
        {/* Header */}
        <div style={{ maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' }}>
          <span className="hero-tag" style={{ marginBottom: '16px' }}>Meet the Developer</span>
          <h1 style={{ fontSize: '2.75rem', marginBottom: '24px', fontWeight: 800 }}>Hi, I'm Aman 👋</h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Full-Stack Software Engineer & MERN Specialist passionate about building high-performance web applications, clean REST APIs, and responsive design systems.
          </p>
        </div>

        {/* Developer Card */}
        <div className="dashboard-card" style={{
          maxWidth: '900px', margin: '0 auto 60px', padding: '40px',
          display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'center',
        }}>
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
            alt="Aman"
            style={{ width: '140px', height: '140px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)' }}
          />
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Aman</h2>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '1.05rem', marginBottom: '16px' }}>
              Full Stack MERN Developer & System Architect
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
              Specializing in MongoDB, Express.js, React.js, and Node.js. Dedicated to delivering production-ready enterprise applications with rich user interfaces, JWT role security, and real-time data persistence.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a
                href="https://github.com/aman5123"
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fab fa-github" style={{ fontSize: '1.1rem' }}></i> GitHub Profile
              </a>
              <a
                href="https://www.linkedin.com/in/aman-verma-214ba9304/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fab fa-linkedin" style={{ fontSize: '1.1rem' }}></i> LinkedIn Profile
              </a>
              <a
                href="mailto:amanvrma089@gmail.com"
                className="btn btn-secondary"
                style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <i className="fas fa-envelope"></i> Email Me
              </a>
            </div>
          </div>
        </div>

        {/* Tech Stack Grid */}
        <div style={{ maxWidth: '900px', margin: '0 auto 60px' }}>
          <h2 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '32px' }}>Platform Tech Architecture</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="dashboard-card" style={{ padding: '24px', textAlign: 'center' }}>
              <i className="fab fa-react" style={{ fontSize: '2.5rem', color: '#61dafb', marginBottom: '12px', display: 'block' }}></i>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>React 18</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>SPA Router v6, Context API, Hooks & Custom Components.</p>
            </div>
            <div className="dashboard-card" style={{ padding: '24px', textAlign: 'center' }}>
              <i className="fab fa-node-js" style={{ fontSize: '2.5rem', color: '#68a063', marginBottom: '12px', display: 'block' }}></i>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Node & Express</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>RESTful API endpoints, JWT Auth & Role Middleware.</p>
            </div>
            <div className="dashboard-card" style={{ padding: '24px', textAlign: 'center' }}>
              <i className="fas fa-database" style={{ fontSize: '2.5rem', color: '#47a248', marginBottom: '12px', display: 'block' }}></i>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>MongoDB</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Mongoose Schemas, indexing, and persistent database queries.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
