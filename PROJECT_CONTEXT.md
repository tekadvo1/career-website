# FindStreak (Career Website) - Master Project Documentation

**Project Name:** FindStreak (Career Website Fullstack)
**Project Purpose:** An AI-powered career growth, upskilling, and portfolio building platform. It assists users with defining career roadmaps, preparing for software engineering / tech roles using AI-driven mock interviews, completing tech workspaces (projects), and generating professional portfolios validated by the platform.

This document serves as the **Master Context File**. If you are an AI assistant (like ChatGPT or Claude) reading this, use this file to quickly understand the entire system architecture, tech stack, and module map.

---

## 🏗️ 1. High-Level Architecture
The application is a standard modern Full-Stack monolith split into two folders: `client` and `backend`.

- **Frontend (`/client`)**: A React Single Page Application (SPA) bundled via Vite. Strongly typed with TypeScript.
- **Backend (`/backend`)**: A Node.js / Express REST API serving client requests, communicating with third-party APIs (OpenAI, Resend), and managing the database.
- **Database**: PostgreSQL (interacted with via the `pg` driver, heavily utilizing raw SQL or lightweight querying frameworks).

---

## 🛠️ 2. Tech Stack Overview

### Frontend
- **Framework:** React 18 
- **Language:** TypeScript (`.tsx` / `.ts`)
- **Build Tool:** Vite
- **Styling:** Vanilla CSS / TailwindCSS (Utility classes heavily utilized in `.tsx` components)
- **Routing:** React Router v6 (`BrowserRouter`)
- **Key Client Dependencies:**
  - `eslint` & `typescript-eslint` (Strict typed linting)
  - `lucide-react` (Iconography)

### Backend
- **Framework:** Node.js + Express
- **API Architecture:** RESTful Endpoints
- **Authentication:** 
  - JWT (`jsonwebtoken`)
  - Google OAuth (`passport-google-oauth20`)
  - Password Hashing (`bcryptjs`)
- **Database:** PostgreSQL (`pg`)
- **Third-Party Integrations:**
  - `openai` (v6+ API for dynamic tech guides, quiz generation, mock interviews, and resume reading)
  - `resend` / `nodemailer` (Transactional emails like Email Verification and Password Reset)
  - `multer` (File handling for user avatars and resume PDFs/Docs)
  - `pdf-parse` & `mammoth` (Parsing uploaded resumes)
- **Security:** `helmet`, `cors`, `express-rate-limit`

---

## 📂 3. Codebase Structure & Core Modules

### 🖥️ Client App (`/client/src/`)
The frontend is component-heavy. The most important modules are located in `src/components/`:
*   **Authentication Flow:**
    *   `AdminLogin.tsx` / `VerifyEmail.tsx` / `ResetPassword.tsx` / `ForgotPassword.tsx`: Manage access controls.
*   **AI & Education Modules:**
    *   `LearningRoadmap.tsx` & `RoadmapTree.tsx`: Displays branching pathways for tech roles.
    *   `AILearningAssistant.tsx` / `AIChatAssistant.tsx`: Interactive chat interfaces tied to OpenAI.
    *   `QuizGame.tsx` & `QuizModal.tsx`: Real-time tech skill validation tests.
    *   `TechGuideView.tsx` & `TaskGuideView.tsx`: Reading views for generated documentation.
    *   `RealTimeMockInterview.tsx`: Utilizes microphone bindings and streaming text-to-speech for interactive technical screens.
*   **User Progression & Workspace:**
    *   `Workspaces.tsx` & `ProjectWorkspace.tsx`: Where users select coding projects to build.
    *   `TechStack.tsx` & `Missions.tsx`: Gamification layers showcasing daily tasks and core competencies.
*   **Public Presentation:**
    *   `Portfolio.tsx`: A user-facing, dynamic resume auto-generated from platform activity. Includes "Theme selection", "AI Auto-Write Info", and "FindStreak Validated" tags.
    *   `Dashboard.tsx` & `Profile.tsx`: The primary user landing interfaces.
*   **Contexts (`/client/src/contexts/`):**
    *   `AlertContext.tsx`: Global notification system.
    *   `WorkspaceContext.tsx`: Manages active project states.

### ⚙️ Backend App (`/backend/`)
*   **Entry Point:** `server.js` (Initializes Express, connects to PostgreSQL, and bonds all API paths).
*   **Database Management:** Schema handles `users`, `projects`, `workspaces`, `portfolios`, `achievements`, and `missions`.
*   **Endpoints Handle:**
    *   `/api/auth/...`: Classic JWT & OAuth layer.
    *   `/api/realtime/stream`: Server-Sent Events (SSE) used to push live snapshot updates to instances like the `Portfolio` live preview.
    *   `/api/upload`: Handled via `multer` for resumes and images.
    *   `/api/openai/...` (Assumed): Bridges client prompts dynamically to OpenAI limits securely.

---

## 🔒 4. State of the Codebase (Recent Updates)
1. **Frontend Linting Purge:** Recently underwent an extensive refactor reducing 289+ TypeScript compliance issues down to near zero. 
   - `eslint.config.js` was calibrated to ignore unnecessary `explicit-any` spam.
   - Core React Rendering warnings (`react-hooks/rules-of-hooks`) such as illegal nested JSX within `try/catch` boundaries were successfully removed from `App.tsx`.
   - Effect hooks referencing synchronised state assignments (`react-hooks/set-state-in-effect`) were scheduled elegantly through `Promise.resolve().then()`.
2. **GitHub CI/CD Automation:** Board issues correctly track known tech debt via internal `.md` markdown tracking inside the `/automation` folder.

---

## 🚀 5. Getting Started (For the AI)
When prompted to build new features, remember the following principles:
1. **Type Safety:** Ensure interfaces and API payload types match across Node.js constraints and React `Props`. 
2. **UI/UX Consistency:** Use `lucide-react` for icons and rely on the established Tailwind design system (gradients, responsive grids, and clean border radius).
3. **Graceful Failures:** If adding a network call on the client, utilize silent `try { } catch (_err) { }` with underscored parameters or proper console warnings rather than unhandled bounds.
4. **AI Token Constraints:** Keep OpenAI prompts restricted and safely managed server-side. Do not expose AI keys in the client React layer.
