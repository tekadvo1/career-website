import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiFetch';
import { useLocation } from 'react-router-dom';
import { getToken } from '../utils/auth';

type WorkspaceContextType = {
  activeRole: string | null;
  activeAnalysis: any | null;
  loadingWorkspace: boolean;
  refreshWorkspace: () => Promise<void>;
  setActiveWorkspaceDirectly: (role: string, analysis: any) => void;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const location = useLocation();

  const refreshWorkspace = async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      const data = await res.json();
      if (data.status === 'success' && data.user?.lastRoleAnalysis) {
         setActiveRole(data.user.lastRoleAnalysis.role);
         setActiveAnalysis(data.user.lastRoleAnalysis.analysis);
      } else {
         setActiveRole(null);
         setActiveAnalysis(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWorkspace(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (token) {
        refreshWorkspace();
    } else {
        setLoadingWorkspace(false);
    }
  }, [location.pathname]); // Refresh on navigation

  const setActiveWorkspaceDirectly = (role: string, analysis: any) => {
      setActiveRole(role);
      setActiveAnalysis(analysis);
  };

  return (
    <WorkspaceContext.Provider value={{ activeRole, activeAnalysis, loadingWorkspace, refreshWorkspace, setActiveWorkspaceDirectly }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
};
