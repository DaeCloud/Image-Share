import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Share2, Download, Lock, Upload } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="container landing-nav-inner">
          <div className="landing-brand">
            <Camera size={20} strokeWidth={1.5} />
            <span>PhotoShare</span>
          </div>
          <Link to="/auth" className="btn btn-primary">Get Started</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="container">
          <div className="landing-hero-content fade-in">
            <div className="badge badge-gold" style={{ marginBottom: '32px' }}>Private Photo Sharing</div>
            <h1 className="landing-title">
              Your memories,<br />
              <em>beautifully shared.</em>
            </h1>
            <p className="landing-subtitle">
              Create private albums, share them with anyone via a link, and let guests contribute their own photos and videos.
            </p>
            <div className="landing-cta">
              <Link to="/auth?mode=register" className="btn btn-primary" style={{ fontSize: '14px', padding: '14px 32px' }}>
                Create Your First Album
              </Link>
              <Link to="/auth" className="btn btn-secondary" style={{ fontSize: '14px', padding: '14px 28px' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Share2 size={22} strokeWidth={1.5} /></div>
              <h3>Shareable Links</h3>
              <p>Generate a private link for any album. Share it with anyone — no account required to view.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Upload size={22} strokeWidth={1.5} /></div>
              <h3>Guest Uploads</h3>
              <p>Let guests contribute their own photos and videos directly to your album from any device.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Download size={22} strokeWidth={1.5} /></div>
              <h3>Bulk Download</h3>
              <p>Anyone with the link can download the entire album as a zip file — all original quality.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Lock size={22} strokeWidth={1.5} /></div>
              <h3>Secure & Private</h3>
              <p>Your albums are private by default. Only people with your share link can access them.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <p>PhotoShare · Private photo sharing made simple</p>
        </div>
      </footer>
    </div>
  );
}
