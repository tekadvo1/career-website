import React from 'react';
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
import Missions from './components/Missions';
import NotFoundPage from './components/NotFoundPage'; // 404 catch-all page
// Helper component to redirect authenticated users
const RedirectIfLoggedIn = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.onboarding_completed) {
        return <Navigate to="/dashboard" replace />;
      }
      return <Navigate to="/onboarding" replace />;
    } catch {
      // If parsing fails, allow access to public route (and maybe clear bad storage)
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={
            <RedirectIfLoggedIn>
              <LandingHome />
            </RedirectIfLoggedIn>
          } />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/about-us/" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/contact-us/" element={<ContactPage />} />
          <Route path="/signup" element={
            <RedirectIfLoggedIn>
              <SignUp />
            </RedirectIfLoggedIn>
          } />
          <Route path="/signin" element={
            <RedirectIfLoggedIn>
              <SignIn />
            </RedirectIfLoggedIn>
          } />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/role-analysis" element={<RoleAnalysis />} />
          <Route path="/roadmap" element={<LearningRoadmap />} />
          <Route path="/resources" element={<ResourcesHub />} />
          <Route path="/ai-assistant" element={<AILearningAssistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/p/:username" element={<Profile isPublic={true} />} />
          <Route path="/workflow-lifecycle" element={<WorkflowLifecycle />} />
          <Route path="/project-workspace" element={<ProjectWorkspace />} />
          <Route path="/quiz-game" element={<QuizGame />} />
          <Route path="/workspaces" element={<Workspaces />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/my-projects" element={<MyProjects />} />
          <Route path="/roadmap-guide" element={<RoadmapGuideView />} />
          <Route path="/roadmap-tree" element={<RoadmapTree />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:username" element={<Portfolio isPublic={true} />} />
          <Route path="/interview-guide" element={<InterviewGuide />} />
          <Route path="/realtime-mock-interview" element={<RealTimeMockInterview />} />
          <Route path="/tech-stack" element={<TechStack />} />
          <Route path="/tech-guide" element={<TechGuideView />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
