import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

function getAuthTokenParam(shareToken) {
  if (shareToken) {
    return `?token=${shareToken}`;
  }
  return '';
}

export function getFileUrl(albumId, filename, shareToken) {
  const base = import.meta.env.VITE_API_URL || '/api';
  const encodedFilename = encodeURIComponent(filename);
  const tokenParam = getAuthTokenParam(shareToken);
  return `${base}/files/serve/${albumId}/${encodedFilename}${tokenParam}`;
}

export function getDownloadUrl(albumId, shareToken) {
  const base = import.meta.env.VITE_API_URL || '/api';
  const tokenParam = getAuthTokenParam(shareToken);
  return `${base}/files/download/${albumId}${tokenParam}`;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function isImage(mimeType, filename) {
  if (mimeType && mimeType.startsWith('image/')) return true;
  const ext = filename?.split('.').pop()?.toLowerCase();
  return ['jpg','jpeg','png','gif','webp','bmp','svg','avif','heic','tiff'].includes(ext);
}

export function isVideo(mimeType, filename) {
  if (mimeType && mimeType.startsWith('video/')) return true;
  const ext = filename?.split('.').pop()?.toLowerCase();
  return ['mp4','mov','avi','mkv','webm','m4v','wmv','flv','3gp'].includes(ext);
}

export default api;
