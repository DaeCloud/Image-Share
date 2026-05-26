import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getFileUrl, getDownloadUrl } from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Share2, Download, Upload, Link2, Check, Copy } from 'lucide-react';
import DropZone from '../components/DropZone';
import MediaGrid from '../components/MediaGrid';
import './AlbumPage.css';

export default function AlbumPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [files, setFiles] = useState([]);
  const [shareLink, setShareLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/albums/${id}`);
      setAlbum(res.data);
      setFiles(res.data.files || []);
      setShareLink(res.data.share_link);
    } catch {
      toast.error('Album not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const handleCreateShare = async () => {
    try {
      const res = await api.post(`/albums/${id}/share`);
      setShareLink(res.data);
      toast.success('Share link created!');
    } catch {
      toast.error('Failed to create share link');
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/s/${shareLink.token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleUpload = async (uploadFiles) => {
    setUploading(true);
    const formData = new FormData();
    uploadFiles.forEach(f => formData.append('files', f));
    try {
      const res = await api.post(`/files/upload/${id}`, formData, {
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
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
      <div className="spinner" />
    </div>
  );

  const shareUrl = shareLink ? `${window.location.origin}/s/${shareLink.token}` : null;
  const downloadUrl = getDownloadUrl(id);

  return (
    <div className="album-page fade-in">
      <div className="container">
        {/* Header */}
        <div className="album-header">
          <button className="btn btn-ghost album-back" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
            All Albums
          </button>

          <div className="album-title-row">
            <div>
              <h1 className="album-title">{album.name}</h1>
              {album.description && <p className="album-description">{album.description}</p>}
              <p className="album-stats">{files.length} file{files.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="album-actions">
              {files.length > 0 && (
                <a
                  href={downloadUrl}
                  className="btn btn-secondary"
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={15} />
                  Download All
                </a>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setShowUpload(s => !s)}
              >
                <Upload size={15} />
                Upload
              </button>
              {!shareLink ? (
                <button className="btn btn-primary" onClick={handleCreateShare}>
                  <Share2 size={15} />
                  Share
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleCopy}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              )}
            </div>
          </div>

          {/* Share Link Banner */}
          {shareLink && (
            <div className="share-banner">
              <Link2 size={14} />
              <span className="share-url">{shareUrl}</span>
              <button className="btn btn-ghost" onClick={handleCopy} style={{ padding: '4px 10px', fontSize: '12px' }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>

        {/* Upload zone */}
        {showUpload && (
          <div className="upload-section">
            <DropZone onUpload={handleUpload} uploading={uploading} />
          </div>
        )}

        {/* Media grid */}
        {files.length === 0 ? (
          <div className="empty-state">
            <Upload size={56} />
            <h3>No files yet</h3>
            <p>Upload photos, videos, or any files to get started.</p>
            <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
              <Upload size={16} /> Upload Files
            </button>
          </div>
        ) : (
          <MediaGrid files={files} albumId={id} />
        )}
      </div>
    </div>
  );
}
