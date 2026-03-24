# FindStreak - Fullstack Setup Guide

Welcome to the **FindStreak** repository! This document contains the complete step-by-step instructions for developers to download the code, set up the database, and run the project locally. 

## 📁 Project Structure

This project is a Monorepo containing both the Frontend and Backend:
- **`client/` (Frontend):** React + Vite + Tailwind CSS + TypeScript
- **`backend/` (Server):** Node.js + Express + PostgreSQL (Node `pg`)

---

## 1. Prerequisites 🛠️

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **Git** for version control
- **PostgreSQL** database (installed and running locally on port 5432)

---

## 2. Clone the Repository 📥

First, download the source code from GitHub:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/findstreak.git
cd findstreak
```

> **Important Workflow Rule:** We use two branches.
> - `main` -> **Production Server** (Protected branch. Requires a PR and owner approval to merge.)
> - `dev` -> **Development Server** (Push all your daily work here to auto-deploy to the Staging server)

Always ensure you are working on the `dev` branch or a feature branch that merges into `dev`:
```bash
git checkout dev
```

---

## 3. Database Setup (PostgreSQL) 🗄️

You need to create a local PostgreSQL database for FindStreak.

1. Open pgAdmin or your terminal with `psql`.
2. Create a new database named `findstreak`:
```sql
CREATE DATABASE findstreak;
```

### Table Information & Schema
The backend script (`server.js`) **automatically creates** all necessary tables when you start the server locally for the first time. However, here is the reference schema it builds:

- **`users`**: Core user accounts. Stores username, email, full name, auth method (local/google), hashed password, bio, avatar, and gamification stats (`xp_score`, `ai_credits`, `current_workspace_id`).
- **`workspaces`**: User career workspaces. Stores user role, setup status, etc.
- **`role_analyses`**: Stores AI-generated analysis of a specific role for a user (needed skills, tools, etc.).
- **`projects`**: Generated learning projects for users. Stores title, description, skills, setup tools, status (active/completed).
- **`user_progress`**: Tracks granular checkbox progress inside projects.
- **`missions`**: AI gamification missions (daily/weekly quests). Stores title, difficulty, XP reward, category.
- **`user_missions`**: Tracks which missions a user has started or completed.
- **`rewards`**: The store rewards (e.g. AI credits, badges).
- **`user_rewards`**: History of rewards redeemed by the user.
- **`platform_settings`**: Global admin settings (e.g., `maintenance_mode` toggle).

---

## 4. Environment Variables Setup 🔑

You need two `.env` files — one for the backend and one for the frontend.

### Backend `.env`
Create a file at `backend/.env` and copy this outline precisely. Make sure to replace your postgres password.

```env
PORT=5000
NODE_ENV=development

# Database Connection (IMPORTANT: Replace 'password' with your local postgres password)
# Format: postgres://username:password@localhost:5432/databasename
DATABASE_URL=postgres://postgres:password@localhost:5432/findstreak

# Security JWT Secret (any random string for local testing)
JWT_SECRET=local_findstreak_secret_development_9999

# Google OAuth Setup (For Google Login)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OpenAI Server (for AI roadmap and mission parsing)
OPENAI_API_KEY=your_openai_api_key_here

# Frontend URL (Important for CORS)
FRONTEND_URL=http://localhost:5173

# Admin Dashboard Secure Credentials
ADMIN_EMAIL=supportfindstreak@tekadvo.com
ADMIN_PASSWORD=your_admin_password_here
ADMIN_JWT_SECRET=super_secret_admin_token

# Email Server (Gmail App Password)
EMAIL_USER=supportfindstreak@tekadvo.com
EMAIL_PASS=your_gmail_app_password
```

### Frontend `.env`
Create a file at `client/.env` and copy this outline:

```env
# Point the frontend dev server to your local backend API
VITE_API_URL=http://localhost:5000
```

---

## 5. Install Dependencies 📦

Since this is a full-stack project, you must install dependencies in both the `backend` and `client` folders.

```bash
# Install backend packages
cd backend
npm install

# Go back to root, then install frontend packages
cd ..
cd client
npm install
```

---

## 6. Running the App Locally 🚀

Open **two separate terminal windows/tabs** (one for backend, one for frontend).

### Terminal 1: Start Backend (Port 5000)
```bash
cd backend
npm run dev
```
*(When you run this for the first time, watch the console. You will see logs confirming that PostgreSQL tables are automatically being created if they don't exist).*

### Terminal 2: Start Frontend (Port 5173)
```bash
cd client
npm run dev
```

> The FindStreak platform is now running locally at: **http://localhost:5173**
> You can create a local account, test out functionality, run missions, and build features without affecting production!

---

## 7. The Git Workflow (How to push code safely) 🚨

Never push directly to `main`! The production branch is strictly protected.

1. Make sure you are on the `dev` branch: `git checkout dev`
2. Create a new branch for your feature: `git checkout -b feature/my-new-button`
3. Make your code changes locally and test thoroughly on `localhost:5173`.
4. Commit your changes:
```bash
git add .
git commit -m "feat: added my new button"
```
5. Push to GitHub:
```bash
git push origin feature/my-new-button
```
6. Go to GitHub and open a **Pull Request (PR)** merging your feature branch into `dev` (or directly from `dev` to `main` if the Project Owner requests it).
7. The Project Owner will review, approve, and merge it.

---

*For any questions regarding server configurations, refer to the Project Administrator.*
