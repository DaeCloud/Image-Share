import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Camera, Download, Upload, Images } from 'lucide-react';
import DropZone from '../components/DropZone';
import MediaGrid from '../components/MediaGrid';
import { getDownloadUrl } from '../utils/api';
import { formatDistanceToNow } from 'date-fns';
import './SharedAlbumPage.css';

const BASE = process.env.REACT_APP_API_URL || '/api';

export default function SharedAlbumPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE}/share/${token}`);
      setData(res.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (uploadFiles) => {
    setUploading(true);
    const formData = new FormData();
    uploadFiles.forEach(f => formData.append('files', f));
    try {
      const res = await axios.post(`${BASE}/share/${token}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (p) => {
          const pct = Math.round((p.loaded * 100) / p.total);
          if (pct < 100) toast.loading(`Uploading... ${pct}%`, { id: 'upload' });
        }
      });
      toast.success(`${res.data.uploaded} file${res.data.uploaded !== 1 ? 's' : ''} uploaded!`, { id: 'upload' });
      await load();
      setShowUpload(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div className="spinner" />
    </div>
  );

  if (notFound) return (
    <div className="shared-notfound">
      <Camera size={48} strokeWidth={1} style={{ color: 'var(--accent)', opacity: 0.5 }} />
      <h2>Link not found</h2>
      <p>This share link may have been removed or is invalid.</p>
    </div>
  );

  const { album, files, allow_upload } = data;
  const downloadUrl = `${getDownloadUrl(album.id, token)}`;

  return (
    <div className="shared-page">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#f0ede8',
            border: '1px solid #2a2a2a',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#c9a96e', secondary: '#080808' } },
        }}
      />

      <header className="shared-header">
        <div className="container shared-header-inner">
          <div className="shared-brand">
            <Camera size={18} strokeWidth={1.5} />
            <span>PhotoShare</span>
          </div>
          <div className="shared-header-right">
            {files.length > 0 && (
              <a href={downloadUrl} className="btn btn-secondary" download target="_blank" rel="noreferrer">
                <Download size={14} />
                Download All
              </a>
            )}
            {allow_upload && (
              <button className="btn btn-primary" onClick={() => setShowUpload(s => !s)}>
                <Upload size={14} />
                Add Photos
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="container shared-content fade-in">
        <div className="shared-album-info">
          <div className="badge badge-gold" style={{ marginBottom: '16px' }}>Shared Album</div>
          <h1 className="shared-title">{album.name}</h1>
          {album.description && <p className="shared-desc">{album.description}</p>}
          <div className="shared-meta">
            <span>by <strong>{album.owner}</strong></span>
            <span>·</span>
            <span>{files.length} file{files.length !== 1 ? 's' : ''}</span>
            <span>·</span>
            <span>Created {formatDistanceToNow(new Date(album.created_at), { addSuffix: true })}</span>
          </div>
        </div>

        {showUpload && allow_upload && (
          <div style={{ marginBottom: '40px' }}>
            <DropZone onUpload={handleUpload} uploading={uploading} />
          </div>
        )}

        {files.length === 0 ? (
          <div className="empty-state">
            <Images size={56} />
            <h3>No files yet</h3>
            {allow_upload ? (
              <p>Be the first to add photos or videos to this album.</p>
            ) : (
              <p>This album is empty.</p>
            )}
            {allow_upload && (
              <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                <Upload size={16} /> Upload Files
              </button>
            )}
          </div>
        ) : (
          <MediaGrid files={files} albumId={album.id} shareToken={token} />
        )}
      </div>
    </div>
  );
}
