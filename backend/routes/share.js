const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const { db } = require('../db');

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/uploads';

// Get album by share token
router.get('/:token', (req, res) => {
  const shareLink = db.prepare('SELECT * FROM share_links WHERE token = ?').get(req.params.token);
  if (!shareLink) return res.status(404).json({ error: 'Share link not found' });
  
  const album = db.prepare('SELECT a.*, u.username as owner FROM albums a JOIN users u ON u.id = a.user_id WHERE a.id = ?').get(shareLink.album_id);
  if (!album) return res.status(404).json({ error: 'Album not found' });
  
  const files = db.prepare('SELECT * FROM files WHERE album_id = ? ORDER BY uploaded_at DESC').all(album.id);
  
  res.json({
    album: { id: album.id, name: album.name, description: album.description, owner: album.owner, created_at: album.created_at },
    files,
    allow_upload: shareLink.allow_upload === 1
  });
});

// Upload to shared album
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const shareLink = db.prepare('SELECT * FROM share_links WHERE token = ?').get(req.params.token);
    if (!shareLink) return cb(new Error('Invalid share token'));
    const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(shareLink.album_id);
    if (!album) return cb(new Error('Album not found'));
    cb(null, album.folder_path);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}_${uuidv4().split('-')[0]}${ext}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB per file
});

router.post('/:token/upload', upload.array('files', 50), (req, res) => {
  const shareLink = db.prepare('SELECT * FROM share_links WHERE token = ?').get(req.params.token);
  if (!shareLink) return res.status(404).json({ error: 'Share link not found' });
  if (!shareLink.allow_upload) return res.status(403).json({ error: 'Upload not allowed' });
  
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(shareLink.album_id);
  if (!album) return res.status(404).json({ error: 'Album not found' });
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const insertedFiles = [];
  const stmt = db.prepare('INSERT INTO files (id, album_id, filename, original_name, mime_type, size, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  for (const file of req.files) {
    const id = uuidv4();
    const mimeType = mime.lookup(file.originalname) || file.mimetype || 'application/octet-stream';
    stmt.run(id, album.id, file.filename, file.originalname, mimeType, file.size, 'guest');
    insertedFiles.push({
      id, filename: file.filename, original_name: file.originalname,
      mime_type: mimeType, size: file.size
    });
  }
  
  res.json({ uploaded: insertedFiles.length, files: insertedFiles });
});

module.exports = router;
