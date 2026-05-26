# PhotoShare

A beautiful, self-hosted photo and file sharing application. Create private albums, generate share links, and let anyone upload or download content.

## Features

- **User authentication** — Register/login with JWT-based auth
- **Albums** — Organize content into named albums (stored as folders on disk)
- **Share links** — Generate a unique link for any album; no account needed to view
- **Guest uploads** — Anyone with the link can add photos, videos, or any file
- **Bulk download** — Download the entire album as a `.zip` file
- **Lightbox viewer** — Click any image/video to view full-screen with navigation
- **No deletion** — Uploaded content is permanent (no accidental data loss)
- **Any file format** — Images, videos, documents, archives — everything works
- **Mobile friendly** — Responsive design that works beautifully on all devices
- **Multi-upload** — Drag and drop multiple files at once, up to 500MB each

## Quick Start

### Requirements
- Docker and Docker Compose

### Run

```bash
# 1. Clone / unzip the project
cd photoshare

# 2. Create your .env file
cp .env.example .env
# Edit .env and set a strong JWT_SECRET

# 3. Build and start
docker compose up -d --build

# 4. Open http://localhost in your browser
```

The app will be available at **http://localhost** (or whatever port you set).

### Configuration

Edit `.env`:

```env
JWT_SECRET=your_very_long_random_secret_here
PORT=80          # External port to expose
```

## Architecture

```
photoshare/
├── backend/          # Node.js + Express API
│   ├── routes/
│   │   ├── auth.js   # Register, login, JWT
│   │   ├── albums.js # Create albums, share links
│   │   ├── share.js  # Public share link access + upload
│   │   └── files.js  # File serving, zip download, owner upload
│   ├── middleware/
│   │   └── auth.js   # JWT middleware
│   ├── db.js         # SQLite database setup
│   └── server.js     # Express app entry
│
├── frontend/         # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── AuthPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AlbumPage.js
│   │   │   └── SharedAlbumPage.js
│   │   └── components/
│   │       ├── MediaGrid.js   # Photo/video grid + lightbox
│   │       ├── DropZone.js    # Drag & drop uploader
│   │       ├── Navbar.js
│   │       └── CreateAlbumModal.js
│   └── nginx.conf    # SPA serving + API proxy
│
└── docker-compose.yml
```

## Data Storage

- **Files**: Stored in Docker volume `uploads` (mapped to `/uploads` in the backend container). Each album is a separate folder.
- **Database**: SQLite in Docker volume `db_data` (mapped to `/data`). Stores users, albums, share links, and file metadata.

### Backup

```bash
# Backup uploads and database
docker run --rm \
  -v photoshare_uploads:/uploads \
  -v photoshare_db_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/photoshare-backup.tar.gz /uploads /data
```

## Development

### Backend (local)
```bash
cd backend
cp .env.example .env
npm install
node server.js
```

### Frontend (local)
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:3001/api npm start
```

## Production Notes

1. **Change `JWT_SECRET`** — Use a long random string (32+ chars)
2. **HTTPS** — Put a reverse proxy (Caddy, Traefik, nginx) with TLS in front
3. **File size** — Default limit is 500MB per file; adjust in `backend/routes/` and `frontend/nginx.conf`
4. **Ports** — Default is port 80; change `PORT` in `.env`

## License

MIT
