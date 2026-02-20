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
import Missions from './components/Missions';

// Helper component to redirect authenticated users
const RedirectIfLoggedIn = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.onboarding_completed) {
        return <Navigate to="/dashboard" replace />;
      } else {
        return <Navigate to="/onboarding" replace />;
      }
    } catch (e) {
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
          <Route path="/workflow-lifecycle" element={<WorkflowLifecycle />} />
          <Route path="/project-workspace" element={<ProjectWorkspace />} />
          <Route path="/missions" element={<Missions />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
