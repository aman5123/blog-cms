import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/ToastContainer';
import { API } from '../../services/api';
import '../../styles/admin.css';

export default function Profile() {
  const { logout, currentUser, setCurrentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({ name: '', username: '', email: '', bio: '', avatar: '', website: '' });
  const [password, setPassword] = useState({ current: '', newPwd: '', confirm: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Messages state
  const [messages, setMessages] = useState([]);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgContent, setMsgContent] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || '',
        username: currentUser.username || '',
        email: currentUser.email || '',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || '',
        website: currentUser.website || '',
      });
    }
    API.getMessages().then(setMessages).catch(() => {});
  }, [currentUser]);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const updated = await API.updateProfile(profile);
      setCurrentUser({ ...currentUser, ...updated });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!password.current || !password.newPwd || !password.confirm) {
      showToast('Please fill all password fields', 'warning');
      return;
    }
    if (password.newPwd !== password.confirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (password.newPwd.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }
    setSavingPassword(true);
    try {
      await API.changePassword({ currentPassword: password.current, newPassword: password.newPwd });
      setPassword({ current: '', newPwd: '', confirm: '' });
      showToast('Password changed successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  // Avatar Photo Upload from Computer
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Photo size should be less than 5MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((p) => ({ ...p, avatar: reader.result }));
      showToast('Avatar photo uploaded from computer!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgSubject || !msgContent) return;
    setSendingMsg(true);
    try {
      const created = await API.sendMessage({
        subject: msgSubject,
        content: msgContent,
        isBroadcast: true,
      });
      setMessages((prev) => [created, ...prev]);
      setMsgSubject('');
      setMsgContent('');
      showToast('Broadcast message sent to all followers!', 'success');
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}><i className="fas fa-bars"></i></button>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Profile & Settings</span>
          </div>
          <div className="topbar-right">
            <button className="btn-icon" onClick={toggleTheme}><i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i></button>
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>

        <div className="admin-content">
          {/* User Profile Header Card */}
          <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img
                src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.name}`}
                alt={profile.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'; }}
              />
              <div>
                <h2 style={{ fontWeight: 700, fontSize: '1.5rem' }}>{profile.name || currentUser?.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>@{profile.username || 'user'} &bull; {profile.email}</p>
                <span className={`badge ${currentUser?.role === 'admin' ? 'badge-primary' : 'badge-success'}`} style={{ marginTop: '6px' }}>
                  {currentUser?.role || 'Author'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', textAlign: 'center' }}>
              <div style={{ padding: '8px 16px', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {currentUser?.following ? currentUser.following.length : 0}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Following</span>
              </div>
              <div style={{ padding: '8px 16px', background: 'var(--background)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                  {currentUser?.followers ? currentUser.followers.length : 0}
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Followers</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {[
              { id: 'profile', label: 'Edit Profile', icon: 'fa-user' },
              { id: 'security', label: 'Security & Password', icon: 'fa-lock' },
              { id: 'community', label: 'Followers & Network', icon: 'fa-users' },
              { id: 'messages', label: 'Messages & Broadcasts', icon: 'fa-paper-plane' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`category-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={`fas ${tab.icon}`} style={{ marginRight: '6px' }}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Edit Profile */}
          {activeTab === 'profile' && (
            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: '1fr 1fr' }}>
              <div className="dashboard-card">
                <h2 style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Personal Information
                </h2>
                <div className="editor-option-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="editor-input" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="editor-option-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="editor-input" value={profile.username} onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))} />
                </div>
                <div className="editor-option-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="editor-input" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="editor-option-group">
                  <label className="form-label">Website / Portfolio</label>
                  <input type="url" className="editor-input" placeholder="https://..." value={profile.website} onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))} />
                </div>

                <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={handleProfileSave} disabled={savingProfile}>
                  {savingProfile ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save"></i> Save Profile</>}
                </button>
              </div>

              <div className="dashboard-card">
                <h2 style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Avatar & Bio
                </h2>
                
                {/* Upload Photo from Computer Button */}
                <div className="editor-option-group">
                  <label className="form-label">Profile Avatar Photo</label>
                  <div style={{ marginBottom: '10px' }}>
                    <label
                      htmlFor="avatar-file-upload"
                      className="btn btn-secondary"
                      style={{ width: '100%', justifyContent: 'center', cursor: 'pointer', fontSize: '0.88rem' }}
                    >
                      <i className="fas fa-upload" style={{ marginRight: '6px' }}></i> Upload Photo from Computer
                    </label>
                    <input
                      id="avatar-file-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleAvatarFileUpload}
                    />
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textAlign: 'center' }}>
                    — OR Paste Avatar URL —
                  </span>

                  <input type="text" className="editor-input" placeholder="https://..." value={profile.avatar} onChange={(e) => setProfile((p) => ({ ...p, avatar: e.target.value }))} />
                  {profile.avatar && (
                    <img src={profile.avatar} alt="preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', marginTop: '10px', border: '2px solid var(--primary)' }} />
                  )}
                </div>

                <div className="editor-option-group">
                  <label className="form-label">Bio Description</label>
                  <textarea
                    className="editor-input"
                    style={{ height: '120px', resize: 'vertical' }}
                    placeholder="Tell your readers about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Security */}
          {activeTab === 'security' && (
            <div className="dashboard-card" style={{ maxWidth: '500px' }}>
              <h2 style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Change Password
              </h2>
              <div className="editor-option-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="editor-input" value={password.current} onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))} />
              </div>
              <div className="editor-option-group">
                <label className="form-label">New Password</label>
                <input type="password" className="editor-input" value={password.newPwd} onChange={(e) => setPassword((p) => ({ ...p, newPwd: e.target.value }))} />
              </div>
              <div className="editor-option-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="editor-input" value={password.confirm} onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={handlePasswordSave} disabled={savingPassword}>
                {savingPassword ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-key"></i> Change Password</>}
              </button>
            </div>
          )}

          {/* Tab 3: Followers & Community */}
          {activeTab === 'community' && (
            <div className="dashboard-card">
              <h2 style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                My Network & Followers
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'var(--background)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
                    <i className="fas fa-user-friends" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> 
                    Followers ({currentUser?.followers ? currentUser.followers.length : 0})
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Readers and authors following your publications.</p>
                </div>
                <div style={{ background: 'var(--background)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>
                    <i className="fas fa-user-plus" style={{ color: 'var(--primary)', marginRight: '8px' }}></i> 
                    Following ({currentUser?.following ? currentUser.following.length : 0})
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Authors you are currently following.</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Messages & Broadcasts */}
          {activeTab === 'messages' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Compose Message Form */}
              <div className="dashboard-card">
                <h2 style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <i className="fas fa-broadcast-tower" style={{ marginRight: '8px' }}></i> Broadcast Message to Followers
                </h2>
                <form onSubmit={handleSendMessage}>
                  <div className="editor-option-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="editor-input"
                      required
                      placeholder="e.g. New Article Announcement!"
                      value={msgSubject}
                      onChange={(e) => setMsgSubject(e.target.value)}
                    />
                  </div>
                  <div className="editor-option-group">
                    <label className="form-label">Message Content</label>
                    <textarea
                      className="editor-input"
                      style={{ height: '120px', resize: 'vertical' }}
                      required
                      placeholder="Type your announcement to all followers..."
                      value={msgContent}
                      onChange={(e) => setMsgContent(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={sendingMsg}>
                    {sendingMsg ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> Broadcast Message</>}
                  </button>
                </form>
              </div>

              {/* Message Inbox List */}
              <div className="dashboard-card">
                <h2 style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <i className="fas fa-inbox" style={{ marginRight: '8px' }}></i> Inbox & Announcements ({messages.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {messages.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No messages in inbox.</p>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id || m._id} style={{ background: 'var(--background)', padding: '14px', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '0.95rem' }}>{m.subject}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(m.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0' }}>{m.content}</p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>From: {m.senderName || 'System'}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
