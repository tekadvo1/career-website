# FindStreak - Fullstack Setup Guide

Welcome to the **FindStreak** repository! This document contains the complete step-by-step instructions for developers to download the code, set up the database, and run the project locally. 

This project consists of:
- **Client (Frontend):** React + Vite + Tailwind CSS
- **Backend (Server):** Node.js + Express + PostgreSQL (Node `pg`)

---

## 1. Prerequisites 🛠️

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher recommended)
- **Git** for version control
- **PostgreSQL** database (installed and running locally)

---

## 2. Clone the Repository 📥

First, download the source code from GitHub:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/findstreak.git
cd findstreak
```

> **Important Workflow Rule:** We use two branches.
> - `main` -> **Production Server** (Always stable, DO NOT push here directly)
> - `dev` -> **Development Server** (Push all your daily work here)

Always ensure you are working on the `dev` branch:
```bash
git checkout dev
```

---

## 3. Database Setup (PostgreSQL) 🗄️

You need to create a local PostgreSQL database for FindStreak.

1. Open pgAdmin or your terminal with psql.
2. Create a new database named `findstreak`:
```sql
CREATE DATABASE findstreak;
```
*(The backend script automatically handles table creation and schema definitions when it starts up!)*

---

## 4. Environment Variables Setup 🔑

You need two `.env` files — one for the backend and one for the frontend.

### Backend `.env`
Create a file at `backend/.env` and copy this outline:

```env
PORT=5000
NODE_ENV=development

# Database Connection
# Replace "postgres" and "password" with your local DB credentials
DATABASE_URL=postgres://postgres:password@localhost:5432/findstreak

# Security JWT Secret (any random string)
JWT_SECRET=local_findstreak_secret_development_9999

# Google OAuth Setup (For Google Login)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# OpenAI Server (for AI roadmap parsing)
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

### Terminal 2: Start Frontend (Port 5173)
```bash
cd client
npm run dev
```

> The FindStreak platform is now running locally at: **http://localhost:5173**

---

## 7. The Git Workflow (How to push code safely) 🚨

Never push directly to `main`! Here is the strict workflow to follow:

### A. Developing a new feature
1. Make sure you are on the `dev` branch: `git checkout dev`
2. Make your code changes locally.
3. Test everything thoroughly on `localhost:5173`.
4. Commit your changes:
```bash
git add .
git commit -m "feat/fix: descriptive message of what you changed"
```
5. Push to the development server:
```bash
git push origin dev
```
*(Deploying to the `dev` branch automatically updates the live testing staging server)*

### B. Moving code from `dev` to `main` (Production)
Once the client has tested your code on the Live Development Server and approved it, you are allowed to deploy to production:

```bash
# Switch to main branch
git checkout main

# Pull the latest main changes just in case
git pull origin main

# Merge all your dev work into main
git merge dev

# Push forcefully to update production
git push origin main

# Switch back to dev immediately to continue working!
git checkout dev
```

---

*For any questions regarding server configurations on Railway, refer to the project administrator.*
