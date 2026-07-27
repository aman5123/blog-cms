import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useToast } from '../components/ToastContainer';

export default function Contact() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      showToast(`Thank you ${name}! Your message has been sent to Aman.`, 'success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSending(false);
    }, 600);
  };

  return (
    <>
      <Navbar />

      <main className="container" style={{ padding: '60px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto 60px', textAlign: 'center' }}>
          <span className="hero-tag" style={{ marginBottom: '16px' }}>Get In Touch</span>
          <h1 style={{ fontSize: '2.75rem', marginBottom: '24px', fontWeight: 800 }}>Contact Aman</h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Have questions about this MERN stack platform, interested in collaboration, or hiring opportunities? Reach out directly!
          </p>
        </div>

        <div className="hero-grid" style={{ alignItems: 'start', gap: '48px' }}>
          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Direct Contact Info</h2>

            <div style={{ display: 'flex', gap: '16px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
              <i className="fas fa-envelope" style={{ fontSize: '1.5rem', color: 'var(--primary)', marginTop: '4px' }}></i>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Email Address</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '6px' }}>Direct inbox for inquiries:</p>
                <a href="mailto:amanvrma089@gmail.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>amanvrma089@gmail.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
              <i className="fab fa-linkedin" style={{ fontSize: '1.5rem', color: '#0a66c2', marginTop: '4px' }}></i>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>LinkedIn</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '6px' }}>Connect professionally:</p>
                <a href="https://www.linkedin.com/in/aman-verma-214ba9304/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  linkedin.com/in/aman-verma-214ba9304/
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
              <i className="fab fa-github" style={{ fontSize: '1.5rem', color: 'var(--text)', marginTop: '4px' }}></i>
              <div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>GitHub</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '6px' }}>Check out projects and repositories:</p>
                <a href="https://github.com/aman5123" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  github.com/aman5123
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Send a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input type="text" className="editor-input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="form-group">
                <label className="form-label">Your Email Address</label>
                <input type="email" className="editor-input" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" className="editor-input" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What would you like to discuss?" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="editor-input" style={{ minHeight: '130px', resize: 'vertical' }} required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message here..."></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={sending}>
                {sending ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
