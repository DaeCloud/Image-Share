import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import './AuthPage.css';

export default function AuthPage() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back!');
      } else {
        if (!form.username.trim()) return toast.error('Username required');
        await register(form.username, form.email, form.password);
        toast.success('Account created!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">
            <Camera size={20} strokeWidth={1.5} />
            PhotoShare
          </Link>
          <h1 className="auth-tagline">
            Every moment<br />
            <em>deserves to be shared.</em>
          </h1>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap fade-in">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => setMode('login')}
            >Sign In</button>
            <button
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => setMode('register')}
            >Create Account</button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  name="username"
                  type="text"
                  placeholder="yourname"
                  value={form.username}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoFocus={mode === 'login'}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                name="password"
                type="password"
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="auth-switch-btn">
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
