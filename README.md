# CloudKeep — Cloud File Storage Platform

> A full-stack, enterprise-grade cloud storage application built with **React (JSX)**, **Vite**, **Tailwind CSS v4**, **Node.js**, **Express**, **TypeScript**, **Prisma ORM**, and **Cloudinary**.

## About Project

**CloudKeep** is a modern, high-performance web-based cloud storage and file management platform designed for seamless file organization, secure cloud uploads, and instant public sharing.

Built using a decoupled architecture with a modern **React (JSX) + Vite + Tailwind CSS** frontend and a robust **Node.js + Express + TypeScript + Prisma ORM** REST API backend, CloudKeep delivers an intuitive Google Drive / Dropbox-like storage experience.

### Key Highlights:
- **Cloudinary Storage Integration**: Offloads file assets to Cloudinary with CDN caching and instant invalidation upon file or folder deletion.
- **HMAC Server-Side Streaming**: Overcomes browser cross-origin and Cloudinary raw delivery restrictions by securely fetching file payloads server-side and streaming them directly to the user as direct attachments.
- **Real-Time State Synchronization**: Dynamically updates storage quotas, folder metrics, category breakdowns, and favorites across all components in real time.

---

## Features

- **Authentication & Authorization**
  - Secure JWT authentication with persistent sessions.
  - Granular token verification via HTTP headers and query params for browser downloads.

- **Folder Management & Uploads**
  - Create and manage hierarchical folders.
  - Interactive breadcrumb navigation.
  - Upload into specific folders.
  - Permanent folder deletion with recursive file cleanup from Cloudinary, DB, and live storage quota decrement.

- **Automated Category Filtering**
  - Real-time file classification based on MIME types and extensions:
    - **Pictures** (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`)
    - **Documents** (`.pdf`, `.docx`, `.xlsx`, `.pptx`, `.txt`, `.csv`)
    - **Videos** (`.mp4`, `.webm`, `.avi`, `.mov`, `.mkv`)
    - **Audio** (`.mp3`, `.wav`, `.aac`, `.ogg`, `.flac`)

- **Favorites Management**
  - Quick-access favorited files section.
  - Live toggle (`Add Favorite` / `Remove Favorite`) with context menu integration.

- **Public File Sharing & Direct Downloads**
  - Generate HMAC-signed public share links.
  - Allows instant, unauthenticated public downloads when links are pasted in any browser (no login required).
  - Server-side streaming endpoint (`Content-Disposition: attachment`) bypassing Cloudinary account restrictions.

- **Storage Dashboard & Meter**
  - Real-time gauge tracking storage limit and byte usage.
  - Auto-calculated statistics refreshed dynamically upon uploads and deletions.

---

## Tech Stack & Architecture

### Frontend Container
- **Framework**: React (JSX) + Vite (served via lightweight `serve` on port 3000)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: Lucide React

### Backend Container
- **Runtime & Language**: Node.js + TypeScript
- **Framework**: Express.js (Port 5000)
- **Database & ORM**: PostgreSQL (Image: `postgres:17`) + Prisma ORM
- **Cloud Storage**: Cloudinary SDK (Authenticated Uploads)
- **Security & Utilities**: JSON Web Tokens (JWT), Zod Validation, Express Rate Limiter

### Cloud Infrastructure (AWS)
- **AWS EC2**: Hosts Docker Compose with Frontend, Backend & PostgreSQL 17 containers.
- **Application Load Balancer (ALB)**: External HTTPS entry point handling path-based routing (`/` → React container, `/api/*` → Express container).
- **ACM (AWS Certificate Manager)**: Free SSL/TLS Certificate termination at ALB level.
- **CloudWatch**: Logs aggregation & performance monitoring.
- **Security Groups**: Restricts direct public access; only ALB can reach EC2 container ports.
- **VPC**: Public & Private Subnet isolation.

---

## Repository Structure

```text
├── client/                     # React Frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI Components (Header, Sidebar, FileList, Modals...)
│   │   ├── services/           # Fetch API Service Layer (api.js)
│   │   ├── views/              # Page Views (DashboardView, SharedView, FavoritesView...)
│   │   ├── App.jsx             # Main Application Router & State Manager
│   │   └── main.jsx            # Entry Point
│   ├── Dockerfile              # Multi-Stage Build for React Container
│   ├── .dockerignore           # Ignored files for Frontend container
│   └── vite.config.js          # Vite Configuration & API Proxy Rules
│
├── server/                     # Express Backend (TypeScript + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # Database Schema (User, File, Folder, SharedLink, Favorite)
│   ├── src/
│   │   ├── config/             # Database & Cloudinary Configurations
│   │   ├── controllers/        # Route Handlers (file, folder, auth, share, favorite)
│   │   ├── middleware/         # Auth JWT, Rate Limiter, Validation Middlewares
│   │   ├── routes/             # Express API Routes
│   │   ├── services/           # Core Business Logic & External API Integrations
│   │   └── server.ts           # Express Server Entry Point
│   ├── Dockerfile              # Multi-Stage Build for Express Container
│   ├── .dockerignore           # Ignored files for Backend container
│   └── tsconfig.json           # TypeScript Configuration
│
├── docker-compose.yml          # Orchestrates PostgreSQL 17, Backend, & Frontend
├── .env.example                # Root environment template
└── README.md                   # Project documentation
```

---

## Docker Containerization

To run all 3 containers locally using Docker Compose:

1. Copy `.env.example` to `.env` at the root directory:
   ```bash
   cp .env.example .env
   ```

2. Fill in your secrets in `.env`:
   ```env
   POSTGRES_USER=cloudkeep
   POSTGRES_PASSWORD=cloudkeep_secure_password
   POSTGRES_DB=cloudkeep_db

   JWT_SECRET=your_super_secret_jwt_key_here

   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. Build and launch all containers:
   ```bash
   docker-compose up -d --build
   ```

4. Verify running containers:
   - **Frontend**: `http://localhost:3000`
   - **Backend API**: `http://localhost:5000/api/health`
   - **PostgreSQL 17**: `localhost:5432`


```

---

## API Endpoints Summary

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | ❌ No | Register a new user account |
| `POST` | `/api/auth/login` | ❌ No | Authenticate user and receive JWT token |
| `GET` | `/api/auth/me` | ✅ Yes | Fetch authenticated user profile |
| `GET` | `/api/dashboard/stats` | ✅ Yes | Retrieve storage usage and category stats |
| `GET` | `/api/files` | ✅ Yes | List user files (supports category & folder filters) |
| `POST` | `/api/files/upload` | ✅ Yes | Upload file to Cloudinary & register in DB |
| `GET` | `/api/files/:id/download` | ✅ Yes | Stream signed file attachment directly |
| `DELETE` | `/api/files/:id` | ✅ Yes | Delete file from Cloudinary and DB |
| `GET` | `/api/folders` | ✅ Yes | List folders created by user |
| `POST` | `/api/folders` | ✅ Yes | Create a new folder |
| `DELETE` | `/api/folders/:id` | ✅ Yes | Permanently delete folder, subfolders & files |
| `GET` | `/api/share` | ✅ Yes | List shared links created by user |
| `POST` | `/api/share` | ✅ Yes | Generate a public share token for a file |
| `GET` | `/api/share/public/:token` | ❌ No | Public direct download endpoint for shared files |
| `GET` | `/api/favorites` | ✅ Yes | List favorited files |
| `POST` | `/api/favorites` | ✅ Yes | Toggle favorite status for a file |
