import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Image, Link2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CreateAlbumModal from '../components/CreateAlbumModal';
import './Dashboard.css';

export default function Dashboard() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const loadAlbums = useCallback(async () => {
    try {
      const res = await api.get('/albums');
      setAlbums(res.data);
    } catch {
      toast.error('Failed to load albums');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAlbums(); }, [loadAlbums]);

  const handleCreated = (album) => {
    setAlbums(a => [album, ...a]);
    setShowCreate(false);
    toast.success('Album created!');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="dashboard fade-in">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">My Albums</h1>
            <p className="dashboard-sub">{albums.length} album{albums.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            New Album
          </button>
        </div>

        {albums.length === 0 ? (
          <div className="empty-state">
            <Image size={56} />
            <h3>No albums yet</h3>
            <p>Create your first album to start sharing your photos and videos.</p>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create Album
            </button>
          </div>
        ) : (
          <div className="albums-grid">
            {albums.map(album => (
              <Link to={`/album/${album.id}`} key={album.id} className="album-card">
                <div className="album-card-body">
                  <div className="album-card-icon">
                    <Image size={28} strokeWidth={1.2} />
                  </div>
                  <div className="album-card-info">
                    <h3 className="album-card-name">{album.name}</h3>
                    {album.description && (
                      <p className="album-card-desc">{album.description}</p>
                    )}
                    <div className="album-card-meta">
                      <span className="album-meta-item">
                        <Image size={12} />
                        {album.file_count} file{album.file_count !== 1 ? 's' : ''}
                      </span>
                      <span className="album-meta-item">
                        <Clock size={12} />
                        {formatDistanceToNow(new Date(album.created_at), { addSuffix: true })}
                      </span>
                      {album.share_token && (
                        <span className="album-meta-item album-shared">
                          <Link2 size={12} />
                          Shared
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateAlbumModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
