# 🎓 TalentTrack Portal

**Student Training & Placement Management System**

A full-stack, containerized web application designed as a beginner-friendly DevOps portfolio project. Built for colleges to manage student training, assessments, and placement activities.

[![CI/CD](https://github.com/ayu9x/Student-portal/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/ayu9x/Student-portal/actions/workflows/ci-cd.yml)

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start with Docker](#-quick-start-with-docker)
- [Local Development](#-local-development)
- [API Endpoints](#-api-endpoints)
- [DevOps Components](#-devops-components)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Monitoring](#-monitoring-optional)
- [Environment Variables](#-environment-variables)
- [Deployment Guide](#-deployment-guide)
- [How This Helps Freshers Learn DevOps](#-how-this-project-helps-freshers-learn-devops)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                    http://localhost                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Frontend Container    │
              │   React (Vite) + Nginx  │
              │   Port: 80              │
              │                         │
              │   /api/* ──► proxy ──►  │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   Backend Container     │
              │   Node.js + Express     │
              │   Port: 3001            │
              │                         │
              │   /api/health ✓         │
              │   /api/metrics 📊       │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   Database Container    │
              │   MySQL 8.0             │
              │   Port: 3306            │
              │   Volume: db_data       │
              └─────────────────────────┘

   ┌──────────────────────────────────────┐  (Optional)
   │  Prometheus:9090 ──► Grafana:3000    │
   │  Scrapes /api/metrics every 15s     │
   └──────────────────────────────────────┘
```

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT-based login/register for students & admins |
| 👤 **Profile Management** | Edit personal info, academics, skills, CGPA |
| 📚 **Training Materials** | Browse categorized learning resources |
| 📝 **Tests & Assessments** | Timed aptitude, psychometric & technical tests |
| 📈 **Results & Analytics** | Detailed score breakdown with explanations |
| 💼 **Placement Notices** | Company listings with eligibility & deadlines |
| 📊 **Dashboard** | Role-specific performance tracking |
| 🛡️ **Admin Panel** | Student management, system overview, top performers |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Vite), React Router, Axios |
| **Backend** | Node.js 20, Express.js |
| **Database** | MySQL 8.0 |
| **Auth** | JWT + bcrypt |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |
| **Monitoring** | Prometheus + Grafana |
| **Web Server** | Nginx (production) |

---

## 🚀 Quick Start with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)
- [Git](https://git-scm.com/)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ayu9x/Student-portal.git
cd talenttrack-portal

# 2. Copy environment file
cp .env.example .env

# 3. Build and start all containers
docker compose up --build -d

# 4. Wait for containers to be healthy (~30-60 seconds)
docker compose ps

# 5. Open in browser
# Frontend: http://localhost
# Backend API: http://localhost:3001/api/health
```

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@talenttrack.com` | `admin123` |
| **Student** | `rahul.sharma@student.edu` | `student123` |
| **Student** | `priya.patel@student.edu` | `student123` |

### Stop & Cleanup

```bash
# Stop containers
docker compose down

# Stop and remove volumes (reset database)
docker compose down -v
```

---

## 💻 Local Development

### Prerequisites

- Node.js 18+ (recommend 20 LTS)
- MySQL 8.0 (local or Docker)
- npm or yarn

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env from template
cp .env.example .env
# Edit .env with your local MySQL credentials

# 4. Import database schema
mysql -u root -p < ../database/init.sql

# 5. Start development server
npm run dev
# API running at http://localhost:3001
```

### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
# App running at http://localhost:5173
```

---

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check with DB status |
| `GET` | `/api/metrics` | Prometheus metrics |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | Student registration |

### Protected Endpoints (require JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students/profile` | Get student profile |
| `PUT` | `/api/students/profile` | Update student profile |
| `GET` | `/api/training` | List training materials |
| `GET` | `/api/tests` | List available tests |
| `GET` | `/api/tests/:id` | Get test questions |
| `POST` | `/api/tests/:id/submit` | Submit test answers |
| `GET` | `/api/results` | Get test results |
| `GET` | `/api/placements` | List placement notices |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |

### Admin Endpoints (require admin role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/students` | List all students |
| `GET` | `/api/admin/overview` | System overview |
| `POST` | `/api/training` | Create training material |
| `POST` | `/api/tests` | Create test |
| `POST` | `/api/placements` | Create placement notice |

---

## 🐳 DevOps Components

### Dockerfiles

| File | Description |
|------|-------------|
| `frontend/Dockerfile` | Multi-stage build: Node (build) → Nginx (serve) |
| `backend/Dockerfile` | Single-stage: Node.js with non-root user |

### Docker Compose

| File | Services | Command |
|------|----------|---------|
| `docker-compose.yml` | Frontend, Backend, MySQL | `docker compose up --build` |
| `docker-compose.monitoring.yml` | + Prometheus, Grafana | `docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up --build` |

### Key DevOps Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| **Containerization** | Dockerfiles for frontend & backend |
| **Orchestration** | Docker Compose with dependency management |
| **Health Checks** | `/api/health` endpoint + Docker HEALTHCHECK |
| **Metrics** | Prometheus-format metrics via `prom-client` |
| **Monitoring** | Grafana dashboards for API monitoring |
| **CI/CD** | GitHub Actions with build, test, deploy stages |
| **Environment Config** | `.env` files for all services |
| **Security** | Non-root containers, Helmet, rate limiting |
| **Networking** | Docker bridge network for service discovery |
| **Persistence** | Named volumes for database data |

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) runs on every push/PR to `main`:

```
┌─────────────┐    ┌─────────────────┐    ┌────────────┐
│  Lint & Test │───►│  Build & Push   │───►│   Deploy   │
│              │    │  Docker Images  │    │  (Optional)│
│ - npm build  │    │ - Frontend      │    │ - SSH      │
│ - smoke test │    │ - Backend       │    │ - docker   │
│              │    │ - Push to Hub   │    │   compose  │
└─────────────┘    └─────────────────┘    └────────────┘
```

### Setup GitHub Secrets

Add these secrets in your GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_TOKEN` | Docker Hub access token |
| `DEPLOY_HOST` | Server IP (for deploy job) |
| `DEPLOY_USER` | SSH username (for deploy job) |
| `DEPLOY_KEY` | SSH private key (for deploy job) |

---

## 📊 Monitoring (Optional)

### Start with Monitoring

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up --build -d
```

### Access

| Service | URL | Credentials |
|---------|-----|-------------|
| **Prometheus** | http://localhost:9090 | — |
| **Grafana** | http://localhost:3000 | admin / admin123 |

### Pre-built Dashboard

The Grafana dashboard includes:
- 📈 HTTP Request Rate
- ⏱️ Response Time (P95)
- 🔗 Active Connections
- ⏰ Process Uptime
- 💾 Memory Usage

---

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_ROOT_PASSWORD` | `rootpassword` | MySQL root password |
| `DB_NAME` | `talenttrack` | Database name |
| `DB_USER` | `talenttrack` | Database user |
| `DB_PASSWORD` | `talenttrack_pass` | Database password |
| `JWT_SECRET` | `(dev key)` | JWT signing secret |
| `JWT_EXPIRES_IN` | `24h` | Token expiry |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |
| `GRAFANA_USER` | `admin` | Grafana admin user |
| `GRAFANA_PASSWORD` | `admin123` | Grafana admin password |

---

## 🌐 Deployment Guide

### Deploy to a VPS (DigitalOcean / AWS EC2)

```bash
# 1. SSH into your server
ssh user@your-server-ip

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 3. Clone the repo
git clone https://github.com/ayu9x/Student-portal.git
cd talenttrack-portal

# 4. Create production .env
cp .env.example .env
nano .env  # Set strong passwords & JWT secret!

# 5. Build and start
docker compose up --build -d

# 6. Verify
docker compose ps
curl http://localhost:3001/api/health
```

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Change `DB_ROOT_PASSWORD` and `DB_PASSWORD`
- [ ] Set `CORS_ORIGIN` to your frontend domain
- [ ] Set up a reverse proxy (Nginx/Caddy) for HTTPS
- [ ] Configure firewall (allow ports 80, 443 only)
- [ ] Set up automated backups for MySQL data
- [ ] Configure log rotation

---

## 🎯 How This Project Helps Freshers Learn DevOps

This project is designed as a **practical, hands-on DevOps learning experience**. Here's what you'll learn by building and deploying it:

### 1. 🐳 Containerization (Docker)
- Write `Dockerfiles` for different application types (Node.js, React/Nginx)
- Understand multi-stage builds for optimized images
- Learn `.dockerignore` for build context optimization
- Practice running containers with proper health checks

### 2. 🎭 Container Orchestration (Docker Compose)
- Define multi-service applications declaratively
- Manage service dependencies and startup ordering
- Use named volumes for data persistence
- Configure networking between containers

### 3. 🔄 CI/CD (GitHub Actions)
- Automate testing on every push/PR
- Build and push Docker images to a registry
- Deploy to a server via SSH
- Understand pipeline stages: test → build → deploy

### 4. 📊 Monitoring & Observability
- Expose application metrics (Prometheus format)
- Set up metric collection (Prometheus)
- Create dashboards for visualization (Grafana)
- Implement health check endpoints

### 5. 🔐 Security Best Practices
- Run containers as non-root users
- Use environment variables for secrets (never hardcode!)
- Implement rate limiting and security headers
- JWT-based authentication

### 6. 🏗️ Infrastructure as Code
- Everything is defined in config files (Dockerfiles, YAML)
- Reproducible environments across machines
- Version-controlled infrastructure

### 7. 🌐 Networking
- Service discovery via Docker DNS
- Reverse proxy with Nginx
- API gateway pattern (frontend proxies to backend)

---

## ❓ Troubleshooting

### Container won't start?
```bash
# Check logs
docker compose logs backend
docker compose logs db
```

### Database connection error?
```bash
# Wait for MySQL to fully initialize (can take 30-60s on first run)
docker compose logs db | grep "ready for connections"
```

### Frontend shows blank page?
```bash
# Rebuild frontend
docker compose build frontend
docker compose up -d frontend
```

### Port already in use?
```bash
# Check what's using port 80 or 3001
netstat -tulpn | grep :80
netstat -tulpn | grep :3001
```

### Reset everything?
```bash
docker compose down -v
docker compose up --build -d
```

---

## 📁 Project Structure

```
talenttrack-portal/
├── frontend/               # React (Vite) application
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, ProtectedRoute
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Login, Dashboard, Profile, Tests, etc.
│   │   └── services/       # API service layer
│   ├── Dockerfile          # Multi-stage: build → nginx
│   └── nginx.conf          # Nginx config with API proxy
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── middleware/     # JWT auth
│   │   ├── routes/         # All API routes
│   │   └── app.js          # Express setup
│   └── Dockerfile          # Node.js container
├── database/
│   └── init.sql            # Schema + seed data
├── monitoring/
│   ├── prometheus.yml      # Prometheus config
│   └── grafana/            # Dashboards & provisioning
├── .github/workflows/
│   └── ci-cd.yml           # GitHub Actions pipeline
├── docker-compose.yml      # Core services
├── docker-compose.monitoring.yml  # Monitoring stack
└── README.md               # This file
```

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ as a DevOps learning project<br/>
  <strong>🎓 TalentTrack Portal v1.0.0</strong>
</p>
