const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const { db } = require('../db');
const { authenticate, optionalAuth } = require('../middleware/auth');

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/uploads';

// Serve a file by album + filename (authenticated owner or via share)
router.get('/serve/:albumId/:filename', optionalAuth, (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.albumId);
  if (!album) return res.status(404).json({ error: 'Album not found' });
  
  // Must be owner or have share token header
  const shareToken = req.query.token;
  let authorized = req.user && req.user.id === album.user_id;
  
  if (!authorized && shareToken) {
    const shareLink = db.prepare('SELECT * FROM share_links WHERE token = ? AND album_id = ?').get(shareToken, album.id);
    if (shareLink) authorized = true;
  }
  
  if (!authorized) return res.status(403).json({ error: 'Unauthorized' });
  
  const filePath = path.resolve(path.join(album.folder_path, req.params.filename));
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  
  const mimeType = mime.lookup(req.params.filename) || 'application/octet-stream';
  res.setHeader('Content-Type', mimeType);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(filePath);
});

// Download all files as zip (authenticated or shared)
router.get('/download/:albumId', optionalAuth, (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(req.params.albumId);
  if (!album) return res.status(404).json({ error: 'Album not found' });
  
  const shareToken = req.query.token;
  let authorized = req.user && req.user.id === album.user_id;
  
  if (!authorized && shareToken) {
    const shareLink = db.prepare('SELECT * FROM share_links WHERE token = ? AND album_id = ?').get(shareToken, album.id);
    if (shareLink) authorized = true;
  }
  
  if (!authorized) return res.status(403).json({ error: 'Unauthorized' });
  
  const files = db.prepare('SELECT * FROM files WHERE album_id = ?').all(album.id);
  if (files.length === 0) return res.status(404).json({ error: 'No files in album' });
  
  const safeName = album.name.replace(/[^a-zA-Z0-9]/g, '_');
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.zip"`);
  
  const archive = archiver('zip', { zlib: { level: 6 } });
  archive.on('error', (err) => {
    console.error('Archive error:', err);
    res.status(500).end();
  });
  
  archive.pipe(res);
  
  for (const file of files) {
    const filePath = path.join(album.folder_path, file.filename);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file.original_name });
    }
  }
  
  archive.finalize();
});

// Upload to own album (authenticated)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const album = db.prepare('SELECT * FROM albums WHERE id = ? AND user_id = ?').get(req.params.albumId, req.user.id);
    if (!album) return cb(new Error('Album not found'));
    cb(null, album.folder_path);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${uuidv4().split('-')[0]}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

router.post('/upload/:albumId', authenticate, upload.array('files', 50), (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ? AND user_id = ?').get(req.params.albumId, req.user.id);
  if (!album) return res.status(404).json({ error: 'Album not found' });
  
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  
  const insertedFiles = [];
  const stmt = db.prepare('INSERT INTO files (id, album_id, filename, original_name, mime_type, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  for (const file of req.files) {
    const id = uuidv4();
    const mimeType = mime.lookup(file.originalname) || file.mimetype || 'application/octet-stream';
    stmt.run(id, album.id, file.filename, file.originalname, mimeType, file.size, req.user.id);
    insertedFiles.push({ id, filename: file.filename, original_name: file.originalname, mime_type: mimeType, size: file.size });
  }
  
  res.json({ uploaded: insertedFiles.length, files: insertedFiles });
});

// Delete a file from an album (authenticated, owner only)
router.delete('/:fileId', authenticate, (req, res) => {
  const file = db.prepare('SELECT * FROM files WHERE id = ?').get(req.params.fileId);
  if (!file) return res.status(404).json({ error: 'File not found' });
  
  const album = db.prepare('SELECT * FROM albums WHERE id = ? AND user_id = ?').get(file.album_id, req.user.id);
  if (!album) return res.status(403).json({ error: 'Unauthorized' });
  
  const filePath = path.join(album.folder_path, file.filename);
  
  // Delete from filesystem
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Delete from database
  db.prepare('DELETE FROM files WHERE id = ?').run(req.params.fileId);
  
  res.json({ success: true, message: 'File deleted' });
});

module.exports = router;
