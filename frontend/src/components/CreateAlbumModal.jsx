import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function CreateAlbumModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Album name required');
    setLoading(true);
    try {
      const res = await api.post('/albums', { name: name.trim(), description: description.trim() });
      onCreated(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create album');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300 }}>New Album</h2>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: '6px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Album Name *</label>
            <input
              className="form-input"
              type="text"
              placeholder="Summer 2024, Wedding, Family Trip..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              placeholder="Optional description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : null}
              Create Album
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
