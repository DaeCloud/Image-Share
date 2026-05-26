const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');
const { db } = require('../db');
const { authenticate } = require('../middleware/auth');

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/uploads';

// Get all albums for current user
router.get('/', authenticate, (req, res) => {
  const albums = db.prepare(`
    SELECT a.*, 
      (SELECT COUNT(*) FROM files f WHERE f.album_id = a.id) as file_count,
      (SELECT sl.token FROM share_links sl WHERE sl.album_id = a.id LIMIT 1) as share_token
    FROM albums a WHERE a.user_id = ? ORDER BY a.created_at DESC
  `).all(req.user.id);
  res.json(albums);
});

// Get single album
router.get('/:id', authenticate, (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!album) return res.status(404).json({ error: 'Album not found' });
  const files = db.prepare('SELECT * FROM files WHERE album_id = ? ORDER BY uploaded_at DESC').all(album.id);
  const shareLink = db.prepare('SELECT * FROM share_links WHERE album_id = ?').get(album.id);
  res.json({ ...album, files, share_link: shareLink });
});

// Create album
router.post('/', authenticate, (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Album name required' });
  
  const id = uuidv4();
  const folderName = `${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}`;
  const folderPath = path.join(UPLOADS_DIR, folderName);
  
  fs.mkdirSync(folderPath, { recursive: true });
  
  db.prepare('INSERT INTO albums (id, user_id, name, description, folder_path) VALUES (?, ?, ?, ?, ?)')
    .run(id, req.user.id, name, description || null, folderPath);
  
  const album = db.prepare('SELECT * FROM albums WHERE id = ?').get(id);
  res.status(201).json(album);
});

// Create share link for album
router.post('/:id/share', authenticate, (req, res) => {
  const album = db.prepare('SELECT * FROM albums WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!album) return res.status(404).json({ error: 'Album not found' });
  
  // Check if already exists
  let shareLink = db.prepare('SELECT * FROM share_links WHERE album_id = ?').get(album.id);
  if (!shareLink) {
    const token = nanoid(12);
    const linkId = uuidv4();
    db.prepare('INSERT INTO share_links (id, album_id, token, allow_upload) VALUES (?, ?, ?, ?)').run(linkId, album.id, token, 1);
    shareLink = db.prepare('SELECT * FROM share_links WHERE id = ?').get(linkId);
  }
  
  res.json(shareLink);
});

module.exports = router;
