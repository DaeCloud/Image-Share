import React, { useState } from 'react';
import { getFileUrl, isImage, isVideo, formatBytes } from '../utils/api';
import { X, ChevronLeft, ChevronRight, Download, FileText, Film, Image, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './MediaGrid.css';

function FileIcon({ mimeType, filename }) {
  if (isImage(mimeType, filename)) return <Image size={20} strokeWidth={1.5} />;
  if (isVideo(mimeType, filename)) return <Film size={20} strokeWidth={1.5} />;
  return <FileText size={20} strokeWidth={1.5} />;
}

function Thumbnail({ file, albumId, shareToken, onClick }) {
  const [imgError, setImgError] = useState(false);
  const url = getFileUrl(albumId, file.filename, shareToken);
  const img = isImage(file.mime_type, file.filename);
  const vid = isVideo(file.mime_type, file.filename);

  return (
    <div className="media-item" onClick={onClick}>
      {img && !imgError ? (
        <img
          src={url}
          alt={file.original_name}
          className="media-thumb"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      ) : vid ? (
        <div className="media-thumb media-thumb-video">
          <Film size={32} strokeWidth={1} />
          <span className="media-type-label">Video</span>
        </div>
      ) : (
        <div className="media-thumb media-thumb-file">
          <FileText size={32} strokeWidth={1} />
          <span className="media-ext">{file.original_name.split('.').pop()?.toUpperCase()}</span>
        </div>
      )}
      <div className="media-overlay">
        <span className="media-name">{file.original_name}</span>
        <span className="media-size">{formatBytes(file.size)}</span>
      </div>
    </div>
  );
}

export default function MediaGrid({ files, albumId, shareToken, onFileDelete }) {
  const [lightbox, setLightbox] = useState(null); // index
  const [deleting, setDeleting] = useState(false);

  const openLightbox = (i) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prev = () => setLightbox(i => (i - 1 + files.length) % files.length);
  const next = () => setLightbox(i => (i + 1) % files.length);

  const handleKey = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  const handleDelete = async () => {
    if (!current || !onFileDelete) return;
    if (!window.confirm(`Delete "${current.original_name}"?`)) return;
    
    setDeleting(true);
    try {
      await onFileDelete(current.id);
    } finally {
      setDeleting(false);
    }
  };

  const current = lightbox !== null ? files[lightbox] : null;

  return (
    <>
      <div className="media-grid">
        {files.map((file, i) => (
          <Thumbnail
            key={file.id}
            file={file}
            albumId={albumId}
            shareToken={shareToken}
            onClick={() => openLightbox(i)}
          />
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div className="lightbox" onKeyDown={handleKey} tabIndex={-1} onClick={e => e.target === e.currentTarget && closeLightbox()}>
          <div className="lightbox-toolbar">
            <div className="lightbox-info">
              <span className="lightbox-name">{current.original_name}</span>
              <span className="lightbox-meta">{formatBytes(current.size)} · {formatDistanceToNow(new Date(current.uploaded_at), { addSuffix: true })}</span>
            </div>
            <div className="lightbox-actions">
              <a
                href={getFileUrl(albumId, current.filename, shareToken)}
                download={current.original_name}
                className="btn btn-ghost lightbox-btn"
                target="_blank"
                rel="noreferrer"
              >
                <Download size={16} />
              </a>
              {onFileDelete && (
                <button 
                  className="btn btn-ghost lightbox-btn"
                  onClick={handleDelete}
                  disabled={deleting}
                  title="Delete file"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button className="btn btn-ghost lightbox-btn" onClick={closeLightbox}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="lightbox-body">
            {files.length > 1 && (
              <button className="lightbox-nav lightbox-prev" onClick={prev}>
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="lightbox-media">
              {isImage(current.mime_type, current.filename) ? (
                <img
                  src={getFileUrl(albumId, current.filename, shareToken)}
                  alt={current.original_name}
                  className="lightbox-img"
                />
              ) : isVideo(current.mime_type, current.filename) ? (
                <video
                  src={getFileUrl(albumId, current.filename, shareToken)}
                  controls
                  autoPlay
                  className="lightbox-video"
                />
              ) : (
                <div className="lightbox-file">
                  <FileText size={64} strokeWidth={0.8} />
                  <p>{current.original_name}</p>
                  <a
                    href={getFileUrl(albumId, current.filename, shareToken)}
                    download={current.original_name}
                    className="btn btn-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={16} /> Download File
                  </a>
                </div>
              )}
            </div>

            {files.length > 1 && (
              <button className="lightbox-nav lightbox-next" onClick={next}>
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          <div className="lightbox-counter">
            {lightbox + 1} / {files.length}
          </div>
        </div>
      )}
    </>
  );
}
