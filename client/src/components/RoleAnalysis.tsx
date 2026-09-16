import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken, getUser } from '../utils/auth';
import { apiFetch } from '../utils/apiFetch';
import type { NormalizedRoleAnalysis } from '../types/roleAnalysis';

import Sidebar from './Sidebar';
import RoleAnalysisHeader from './role-analysis/RoleAnalysisHeader';
import RoleOverviewSection from './role-analysis/RoleOverviewSection';
import RoleTypicalWorkSection from './role-analysis/RoleTypicalWorkSection';
import RoleSkillsSection from './role-analysis/RoleSkillsSection';
import RoleToolsSection from './role-analysis/RoleToolsSection';
import RoleStartingPointSection from './role-analysis/RoleStartingPointSection';
import RoleOutlookSection from './role-analysis/RoleOutlookSection';
import RoleNextAction from './role-analysis/RoleNextAction';

export default function RoleAnalysis() {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect if this is a returning user (onboarding already completed)
  const isReturningUser = (() => {
    try {
      const user = (getUser() ?? {});
      return !!user.onboarding_completed;
    } catch {
      return false;
    }
  })();

  const [roleDataState, setRoleDataState] = useState<NormalizedRoleAnalysis | null>(null);
  
  // Honest API states
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const lastStateRaw = sessionStorage.getItem('lastRoleAnalysis');
  const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
  
  const _rawRole = location.state?.role || lastRoleState?.role || "Software Engineer";
  const role = _rawRole.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() || "Software Engineer";

  const hasResume = location.state?.hasResume || false;
  const resumeFileName = location.state?.resumeFileName || null;
  const aiAnalysis = location.state?.analysis;
  
  // Extract custom path intent and skills from Onboarding
  const skillPreference = location.state?.learningPath;
  const resumeSkills = location.state?.resumeSkills;

  const experienceLevel = location.state?.experienceLevel;
  const country = location.state?.country;

  // Strict Normalizer
  const getAiRoleData = useCallback((analysis: any, roleName: string): NormalizedRoleAnalysis => {
    return {
      title: analysis.title || roleName,
      description: analysis.description || "",
      jobGrowth: analysis.jobGrowth,
      salaryRange: analysis.salaryRange,
      
      salary_insights: analysis.salary_insights ? {
         entry_level: analysis.salary_insights.entry_level,
         senior_level: analysis.salary_insights.senior_level,
         salary_growth_potential: analysis.salary_insights.salary_growth_potential,
         negotiation_tips: analysis.salary_insights.negotiation_tips
      } : undefined,
      day_in_the_life: analysis.day_in_the_life || [],
      career_paths: analysis.career_paths || [],
      interview_prep: analysis.interview_prep || [],
      soft_skills: analysis.soft_skills || [],

      skills: analysis.skills || [],
      tools: analysis.tools || [],
      languages: analysis.languages || [],
      frameworks: analysis.frameworks || [],
      resources: analysis.resources || [],
      workflow: analysis.workflow || [],
    };
  }, []);

  // Effect to load data from location, local storage, or API
  useEffect(() => {
    const fetchData = async () => {
      setStatus('loading');
      setError(null);

      try {
        if (aiAnalysis) {
          const normalized = getAiRoleData(aiAnalysis, role);
          setRoleDataState(normalized);
          sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
            role,
            analysis: aiAnalysis, // store raw analysis
            hasResume,
            resumeFileName,
            timestamp: new Date().getTime()
          }));
          setStatus('ready');
          return;
        }

        // Try to recover from local storage
        const saved = sessionStorage.getItem('lastRoleAnalysis');
        if (saved) {
          const parsed = JSON.parse(saved);
          const hasWorkflow = parsed.analysis && parsed.analysis.workflow && parsed.analysis.workflow.length > 0;
          if (parsed.role === role && (new Date().getTime() - parsed.timestamp < 3600000) && hasWorkflow) {
             setRoleDataState(getAiRoleData(parsed.analysis, parsed.role));
             setStatus('ready');
             return;
          }
        }

        // If no state and no valid local storage, FETCH from API
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : {};
        
        const response = await apiFetch('/api/role/analyze', {
          method: 'POST',
          body: JSON.stringify({ 
            role: role, 
            userId: user.id || null,
            experienceLevel: experienceLevel || 'Beginner', 
            country: country || 'USA',
            learningPath: skillPreference
          }) 
        });

        if (!response.ok) {
          throw new Error('Failed to fetch role analysis');
        }

        const data = await response.json();
        
        if (data.success && data.data) {
           setRoleDataState(getAiRoleData(data.data, role));
           sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
             role,
             analysis: data.data,
             hasResume: false,
             resumeFileName: null,
             timestamp: new Date().getTime()
           }));
           setStatus('ready');
        } else {
           throw new Error('Invalid data received from API');
        }

      } catch (err: any) {
        console.error("Error loading role analysis:", err);
        setError(err.message || "Failed to load analysis");
        setStatus('failed');
      }
    };

    fetchData();
  }, [aiAnalysis, role, getAiRoleData, hasResume, resumeFileName, experienceLevel, country, skillPreference]);

  // Effect to mark onboarding as complete once data is loaded
  useEffect(() => {
    const markOnboardingComplete = async () => {
      if (status !== 'ready' || !roleDataState) return;

      const userStr = sessionStorage.getItem('user');
      const token = getToken();
      
      if (userStr && token) {
        try {
          const user = JSON.parse(userStr);
          if (!user.onboarding_completed) {
            await apiFetch('/api/auth/complete-onboarding', {
              method: 'POST',
              body: JSON.stringify({ userId: user.id })
            });
            user.onboarding_completed = true;
            sessionStorage.setItem('user', JSON.stringify(user));
          }
        } catch (e) {
          console.error("Error marking onboarding complete:", e);
        }
      }
    };

    markOnboardingComplete();
  }, [status, roleDataState]);

  const handleContinue = () => {
    navigate('/dashboard', { state: { role, analysis: roleDataState } });
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar activePage="/dashboard" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8 w-full pt-16 md:pt-8">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-800">Generating role guidance...</h2>
              <p className="text-slate-500 mt-2">This usually takes a few seconds.</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Could not load analysis</h2>
              <p className="text-slate-600 mb-6">{error || "An unexpected error occurred while analyzing the role."}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {status === 'ready' && roleDataState && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <RoleAnalysisHeader 
                roleName={roleDataState.title}
                experienceLevel={experienceLevel}
                country={country}
                hasResume={hasResume}
              />

              {(resumeSkills || skillPreference) && (
                <RoleStartingPointSection 
                  hasResume={hasResume}
                  resumeSkills={resumeSkills}
                  learningPath={skillPreference}
                />
              )}

              <RoleOverviewSection roleData={roleDataState} />
              
              <RoleTypicalWorkSection roleData={roleDataState} />
              
              <RoleSkillsSection roleData={roleDataState} />
              
              <RoleToolsSection roleData={roleDataState} />
              
              <RoleOutlookSection roleData={roleDataState} country={country} />
              
              <RoleNextAction 
                onContinue={handleContinue}
                roleData={roleDataState}
                isReturningUser={isReturningUser}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
