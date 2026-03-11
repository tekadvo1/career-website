import { apiFetch } from '../utils/apiFetch';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  GitBranch, 
  Clock, 
  Wrench, 
  Layers, 
  Code,
  CheckCircle,
  X
} from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';
import Sidebar from './Sidebar';

interface WorkflowStage {
  stage: string;
  description: string;
  tools_used?: string[];
  activities?: string[];
}

export default function WorkflowLifecycle() {
  const { showAlert } = useAlert();
  const location = useLocation();
  const navigate = useNavigate();

  // Detect returning user (onboarding already completed)
  const isReturningUser = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return !!user.onboarding_completed;
    } catch {
      return false;
    }
  })();
  
  // Try to load from localStorage if state is missing
  const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
  const storedData = lastStateRaw ? JSON.parse(lastStateRaw) : null;
  const defaultRole = storedData?.role || 'Software Engineer';
  const defaultAnalysis = storedData?.analysis || null;
  
  const { role = defaultRole, analysis = defaultAnalysis } = location.state || {};

  // Strip parenthetical qualifiers like "(beginner - usa)" from role names
  const cleanRole = (r: string) => r ? r.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() : r;

  const [activeStage, setActiveStage] = useState<number | null>(null);
  
  // Custom Workflow State
  const [customTools, setCustomTools] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowStage[]>(analysis?.workflow || []);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [displayRole, setDisplayRole] = useState(cleanRole(role));
  
  // Step Details Modal State
  const [selectedStep, setSelectedStep] = useState<WorkflowStage | null>(null);
  const [stepDetails, setStepDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleGenerateFreshWorkflow = async (prompt: string) => {
    if (!prompt.trim()) return;
    setIsRegenerating(true);
    try {
      const response = await apiFetch('/api/role/workflow-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: prompt, customTools: prompt })
      });
      const result = await response.json();
      if (result.success && result.data && result.data.workflow) {
        setCurrentWorkflow(result.data.workflow);
        if (result.data.role) setDisplayRole(cleanRole(result.data.role));
      } else {
        showAlert('Failed to generate workflow. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Workflow error:', error);
      showAlert('Error connecting to server.', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateWorkflow = async () => {
    if (!customTools.trim()) return;
    setIsRegenerating(true);
    try {
      const response = await apiFetch('/api/role/workflow-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: displayRole, customTools })
      });
      const result = await response.json();
      if (result.success && result.data && result.data.workflow) {
        setCurrentWorkflow(result.data.workflow);
        if (result.data.role) setDisplayRole(cleanRole(result.data.role));
      } else {
        showAlert('Failed to generate custom workflow. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Custom workflow error:', error);
      showAlert('Error connecting to server.', 'error');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Fallback if no workflow data found
  if (!currentWorkflow || currentWorkflow.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4 p-4">
        {isReturningUser && <Sidebar activePage="workflow-lifecycle" />}
        <h2 className="text-2xl font-extrabold text-gray-800">Generate Your Professional Workflow</h2>
        <p className="text-gray-600 text-center max-w-md">Our AI will create a comprehensive, step-by-step professional lifecycle tailored to your exact role or tech stack.</p>
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
          <input
            type="text"
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            placeholder="e.g. Frontend Developer with React"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
            onKeyDown={e => e.key === 'Enter' && handleGenerateFreshWorkflow(promptInput)}
          />
          <button
            onClick={() => handleGenerateFreshWorkflow(promptInput)}
            disabled={isRegenerating || !promptInput.trim()}
            className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isRegenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wrench className="w-4 h-4" />}
            Build Lifecycle
          </button>
        </div>
        <button onClick={() => navigate('/dashboard')} className="mt-6 text-sm text-teal-600 hover:text-teal-800 font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleViewStepDetails = async (step: WorkflowStage) => {
    setSelectedStep(step);
    setStepDetails(null);
    setIsLoadingDetails(true);
    try {
      const response = await apiFetch('/api/role/workflow-step-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: displayRole, stage: step.stage, tools: step.tools_used })
      });
      const result = await response.json();
      if (result.success && result.data) {
        setStepDetails(result.data);
      } else {
        setStepDetails({ error: 'Could not load details.' });
      }
    } catch (error) {
      console.error('Step details error:', error);
      setStepDetails({ error: 'Connection failed.' });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/40 to-white" id="workflow-content">
      {isReturningUser && <Sidebar activePage="workflow-lifecycle" />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-teal-600" />
                {displayRole} Lifecycle
              </h1>
              <p className="text-xs text-gray-500">End-to-end workflow visualization</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-10">

        {/* Intro */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Professional Workflow &amp; Lifecycle</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            A comprehensive breakdown of how a <span className="text-teal-600 font-bold">{displayRole}</span> approaches projects from inception to delivery.
          </p>

          {/* Usage Guide */}
          <div className="max-w-3xl mx-auto bg-teal-50/60 border border-teal-100 rounded-xl p-4 md:p-5 mb-8 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-lg flex-shrink-0 mt-0.5">
                <GitBranch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-teal-900 mb-1.5">How to use this lifecycle map</h3>
                <p className="text-sm text-teal-800/80 leading-relaxed mb-3">
                  This tool bridges the gap between learning isolated skills and building real-world applications. It breaks down the exact sequence of phases professionals use to deliver robust projects.
                </p>
                <ul className="text-sm text-teal-800/80 space-y-1.5 ml-1">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Explore Phases:</strong> Scroll down to see the sequential milestones required to complete a project.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Deep Dive:</strong> Click "Deep Dive &amp; Code" on any step to reveal code snippets, best practices, and validation checklists.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                    <span><strong>Customize:</strong> Type your specific tech stack below to regenerate the workflow using your desired tools.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Customization Input */}
          <div className="max-w-xl mx-auto bg-white p-2 rounded-xl shadow-md border border-gray-200 flex gap-2">
            <input
              type="text"
              placeholder="Customize Stack: e.g. 'Use AWS, Node.js, React' or 'Change AWS to Azure'"
              className="flex-1 px-4 py-2 border-none outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
              value={customTools}
              onChange={e => setCustomTools(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRegenerateWorkflow()}
            />
            <button
              onClick={handleRegenerateWorkflow}
              disabled={isRegenerating || !customTools.trim()}
              className={`px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${isRegenerating ? 'opacity-75 cursor-not-allowed' : 'hover:bg-teal-700'}`}
            >
              {isRegenerating ? (
                <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
              ) : (
                <><Wrench className="w-3.5 h-3.5" /> Update Workflow</>
              )}
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-teal-100 -translate-x-1/2 hidden md:block" />
          <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-teal-100 md:hidden" />

          <div className="space-y-12">
            {currentWorkflow.length > 0 ? (
              currentWorkflow.map((step, index) => {
                const isEven = index % 2 === 0;
                const isHovered = activeStage === index;
                return (
                  <div
                    key={index}
                    className={`relative flex items-center md:justify-between group ${isEven ? 'md:flex-row-reverse' : ''}`}
                    onMouseEnter={() => setActiveStage(index)}
                    onMouseLeave={() => setActiveStage(null)}
                  >
                    {/* Center Node */}
                    <div className="absolute left-[27px] md:left-1/2 -translate-x-1/2 w-14 h-14 bg-white border-4 border-teal-50 rounded-full flex items-center justify-center z-10 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:border-teal-100">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors ${isHovered ? 'bg-teal-700' : 'bg-teal-500'}`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Spacer */}
                    <div className="hidden md:block w-5/12" />

                    {/* Content Card */}
                    <div className="ml-16 md:ml-0 md:w-5/12 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-teal-200 transition-all duration-300 relative">
                      <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-b border-l border-gray-200 transform rotate-45 z-0 transition-colors group-hover:border-teal-200 ${isEven ? '-left-2' : '-right-2 border-l-0 border-r border-b-0 border-t'}`} />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{step.stage}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{step.description}</p>

                      <div className="space-y-3 pt-3 border-t border-gray-100">
                        {step.tools_used && step.tools_used.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Wrench className="w-3.5 h-3.5 text-gray-400" />
                            {step.tools_used.map((tool, i) => (
                              <span key={i} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded border border-teal-100">{tool}</span>
                            ))}
                          </div>
                        )}
                        {step.activities && step.activities.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                              <Layers className="w-3.5 h-3.5" /> Key Activities
                            </div>
                            <ul className="space-y-1 ml-1">
                              {step.activities.map((act, i) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-teal-400 mt-1.5 flex-shrink-0" />
                                  {act}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleViewStepDetails(step)}
                        className="w-full mt-4 py-2 border border-teal-200 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Code className="w-4 h-4" /> Deep Dive &amp; Code
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">Workflow data unavailable</h3>
                <p className="text-gray-500">We couldn't generate a detailed workflow for this role yet.</p>
              </div>
            )}
          </div>

          {/* End Node */}
          <div className="relative flex justify-center mt-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-teal-500 shadow-md" />
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wide">Project Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Modal */}
      {selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedStep(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-teal-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedStep.stage}</h3>
                <p className="text-sm text-teal-600 font-medium">Technical Deep Dive</p>
              </div>
              <button onClick={() => setSelectedStep(null)} className="p-2 hover:bg-teal-100 rounded-full text-teal-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-8 h-8 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm font-medium">Generating technical details...</p>
                </div>
              ) : stepDetails ? (
                stepDetails.error ? (
                  <div className="text-center py-10 text-gray-500">{stepDetails.error}</div>
                ) : (
                  <div className="space-y-6">
                    {/* Code Snippet */}
                    {stepDetails.code_snippet && stepDetails.code_snippet.code && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Code className="w-5 h-5 text-teal-600" />
                          <h4 className="font-bold text-gray-900">Implementation Example</h4>
                        </div>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto relative">
                          <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded uppercase font-mono">
                            {stepDetails.code_snippet.language || 'code'}
                          </div>
                          <pre className="text-gray-100 font-mono text-sm leading-relaxed">
                            <code>{stepDetails.code_snippet.code}</code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Best Practices */}
                      <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                        <h4 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Best Practices
                        </h4>
                        {stepDetails.best_practices && stepDetails.best_practices.length > 0 ? (
                          <ul className="space-y-2">
                            {stepDetails.best_practices.map((practice: string, i: number) => (
                              <li key={i} className="text-sm text-teal-900 flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0" />
                                {practice}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-teal-600 italic">Generating best practices...</p>
                        )}
                      </div>

                      {/* Validation Checklist */}
                      <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                          <Layers className="w-4 h-4" /> Validation Checklist
                        </h4>
                        {stepDetails.checklist && stepDetails.checklist.length > 0 ? (
                          <ul className="space-y-2">
                            {stepDetails.checklist.map((item: string, i: number) => (
                              <li key={i} className="text-sm text-emerald-900 flex items-start gap-2">
                                <div className="mt-0.5 w-4 h-4 border-2 border-emerald-300 rounded flex items-center justify-center bg-white flex-shrink-0 text-emerald-500">
                                  <CheckCircle className="w-3 h-3" />
                                </div>
                                <span className="flex-1">{item}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-emerald-600 italic">Generating checklist...</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-gray-500">Failed to load details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
