import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import VerifyEmail from './components/VerifyEmail';
import GoogleCallback from './components/GoogleCallback';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Onboarding from './components/Onboarding';
import RoleAnalysis from './components/RoleAnalysis';
import LearningRoadmap from './components/LearningRoadmap';
import ResourcesHub from './components/ResourcesHub';
import AILearningAssistant from './components/AILearningAssistant';
import Profile from './components/Profile';
import WorkflowLifecycle from './components/WorkflowLifecycle';
import ProjectWorkspace from './components/ProjectWorkspace';
import Achievements from './components/Achievements';
import MyProjects from './components/MyProjects';
import RoadmapGuideView from './components/RoadmapGuideView';
import RoadmapTree from './components/RoadmapTree';
import QuizGame from './components/QuizGame';
import Workspaces from './components/Workspaces';
import Portfolio from './components/Portfolio';
import InterviewGuide from './components/InterviewGuide';
import RealTimeMockInterview from './components/RealTimeMockInterview';
import TechStack from './components/TechStack';
import TechGuideView from './components/TechGuideView';
import LandingHome from './components/landing/LandingHome';
import HowItWorksPage from './components/landing/HowItWorksPage';
import AboutPage from './components/landing/AboutPage';
import ContactPage from './components/landing/ContactPage';
import PrivacyPolicy from './components/landing/PrivacyPolicy';
import CookiePolicy from './components/landing/CookiePolicy';
import TermsAndConditions from './components/landing/TermsAndConditions';
import Missions from './components/Missions';
import ProjectStructurePage from './components/ProjectStructurePage';
import Settings from './components/Settings';
import ToolsPage from './components/ToolsPage';
import NotFoundPage from './components/NotFoundPage';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import ScrollToTop from './components/ScrollToTop';
import FeedbackWidget from './components/FeedbackWidget';
import { getToken, getUser, clearSession } from './utils/auth';

// ── Redirect logged-in users away from auth/landing pages ─────────────────────
const RedirectIfLoggedIn = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  const user = getUser<{ onboarding_completed?: boolean }>();

  if (token && user) {
    let shouldClear = false;
    let redirectPath = "";
    try {
      redirectPath = user.onboarding_completed ? "/dashboard" : "/onboarding";
    } catch {
      shouldClear = true;
    }
    if (shouldClear) {
      clearSession();
    } else if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }
  }
  return children;
};

// ── Block unauthenticated users from private app pages ────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = getToken();
  const user = getUser<{ onboarding_completed?: boolean }>();

  if (!token || !user) {
    // Remember where they were trying to go so we can redirect back after login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    return <Navigate to="/signin" replace />;
  }

  let shouldClear = false;
  let needsOnboarding = false;
  try {
    // Logged in but hasn't finished onboarding → send them there first
    if (!user.onboarding_completed && window.location.pathname !== '/onboarding') {
      needsOnboarding = true;
    }
  } catch {
    shouldClear = true;
  }

  if (shouldClear) {
    clearSession();
    return <Navigate to="/signin" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};


function App() {
  const [maintenance, setMaintenance] = useState({ active: false, message: '' });
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const checkMaintenance = () => {
      fetch(`/api/public/maintenance?t=${Date.now()}`, { cache: 'no-store' })
        .then(r => r.json())
        .then(res => {
          if (res && res.active !== undefined) setMaintenance(res);
          setLoadingConfig(false);
        })
        .catch(() => setLoadingConfig(false));
    };

    checkMaintenance(); // initial check
    const interval = setInterval(checkMaintenance, 15000); // check every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (loadingConfig) return <div className="min-h-screen bg-white" />;

  const isRouteAdmin = window.location.pathname.startsWith('/admindashboard') || window.location.pathname.startsWith('/admin-login');

  if (maintenance.active && !isRouteAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
            <span className="text-4xl" role="img" aria-label="tools">🛠️</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Scheduled Maintenance</h1>
          <p className="text-sm font-semibold text-slate-600 leading-relaxed mb-6">
            {maintenance.message || "We're currently down for scheduled maintenance. Check back soon."}
          </p>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Please check back later
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Routes>

          {/* ── Public / Landing pages ───────────────────────────────────── */}
          <Route path="/"                     element={<RedirectIfLoggedIn><LandingHome /></RedirectIfLoggedIn>} />
          <Route path="/how-it-works"         element={<HowItWorksPage />} />
          <Route path="/about"                element={<AboutPage />} />
          <Route path="/about-us"             element={<AboutPage />} />
          <Route path="/about-us/"            element={<AboutPage />} />
          <Route path="/contact"              element={<ContactPage />} />
          <Route path="/contact-us"           element={<ContactPage />} />
          <Route path="/contact-us/"          element={<ContactPage />} />
          <Route path="/admin-login"           element={<AdminLogin />} />
          <Route path="/privacy"              element={<PrivacyPolicy />} />
          <Route path="/privacy-policy"       element={<PrivacyPolicy />} />
          <Route path="/cookies"              element={<CookiePolicy />} />
          <Route path="/cookie-policy"        element={<CookiePolicy />} />
          <Route path="/terms"                element={<TermsAndConditions />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

          {/* ── Auth pages (redirect away if already logged in) ──────────── */}
          <Route path="/signup"          element={<RedirectIfLoggedIn><SignUp /></RedirectIfLoggedIn>} />
          <Route path="/signin"          element={<RedirectIfLoggedIn><SignIn /></RedirectIfLoggedIn>} />
          <Route path="/verify"          element={<VerifyEmail />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* ── Public share links (no login needed) ─── */}
          <Route path="/p/:username"          element={<Profile isPublic={true} />} />
          <Route path="/portfolio/:username"  element={<Portfolio isPublic={true} />} />

          {/* ── Protected app features (login required) ──────────────────── */}
          <Route path="/onboarding"              element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard"               element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/role-analysis"           element={<ProtectedRoute><RoleAnalysis /></ProtectedRoute>} />
          <Route path="/profile"               element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/roadmap"                 element={<ProtectedRoute><LearningRoadmap /></ProtectedRoute>} />
          <Route path="/resources"               element={<ProtectedRoute><ResourcesHub /></ProtectedRoute>} />
          <Route path="/ai-assistant"            element={<ProtectedRoute><AILearningAssistant /></ProtectedRoute>} />
          <Route path="/workflow-lifecycle"      element={<ProtectedRoute><WorkflowLifecycle /></ProtectedRoute>} />
          <Route path="/project-workspace"       element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
          <Route path="/quiz-game"               element={<ProtectedRoute><QuizGame /></ProtectedRoute>} />
          <Route path="/workspaces"              element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
          <Route path="/achievements"            element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/my-projects"             element={<ProtectedRoute><MyProjects /></ProtectedRoute>} />
          <Route path="/roadmap-guide"           element={<ProtectedRoute><RoadmapGuideView /></ProtectedRoute>} />
          <Route path="/roadmap-tree"            element={<ProtectedRoute><RoadmapTree /></ProtectedRoute>} />
          <Route path="/portfolio"               element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
          <Route path="/interview-guide"         element={<ProtectedRoute><InterviewGuide /></ProtectedRoute>} />
          <Route path="/realtime-mock-interview" element={<ProtectedRoute><RealTimeMockInterview /></ProtectedRoute>} />
          <Route path="/tech-stack"              element={<ProtectedRoute><TechStack /></ProtectedRoute>} />
          <Route path="/tech-guide"              element={<ProtectedRoute><TechGuideView /></ProtectedRoute>} />
          <Route path="/missions"                element={<ProtectedRoute><Missions /></ProtectedRoute>} />
          <Route path="/project-structure"       element={<ProtectedRoute><ProjectStructurePage /></ProtectedRoute>} />
          <Route path="/settings"                element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/tools"                   element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
          {/* Admin routes — use their own admin token guard, NOT regular ProtectedRoute */}
          <Route path="/admin-login"             element={<AdminLogin />} />
          <Route path="/admindashboard"          element={<AdminDashboard />} />

          {/* ── 404 ─────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
        <FeedbackWidget />
      </div>
    </BrowserRouter>
  );
}

export default App;
