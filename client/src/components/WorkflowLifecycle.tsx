import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  GitBranch, 
  Clock, 
  Wrench, 
  Layers, 
  Download,
  Code,
  CheckCircle,
  X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface WorkflowStage {
  stage: string;
  description: string;
  tools_used?: string[];
  activities?: string[];
}

export default function WorkflowLifecycle() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, analysis } = location.state || {};
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeStage, setActiveStage] = useState<number | null>(null);
  
  // Custom Workflow State
  const [customTools, setCustomTools] = useState('');
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowStage[]>(analysis?.workflow || []);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [displayRole, setDisplayRole] = useState(role);
  
  // Step Details Modal State
  const [selectedStep, setSelectedStep] = useState<WorkflowStage | null>(null);
  const [stepDetails, setStepDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fallback if no analysis passed
  if (!role || !analysis) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800">No role data found.</h2>
            <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
                Return to Dashboard
            </button>
        </div>
     );
  }

  const handleRegenerateWorkflow = async () => {
      if (!customTools.trim()) return;
      
      setIsRegenerating(true);
      try {
          const response = await fetch('/api/role/workflow-custom', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role, customTools })
          });
          
          const result = await response.json();
          if (result.success && result.data && result.data.workflow) {
              setCurrentWorkflow(result.data.workflow);
              if (result.data.role) setDisplayRole(result.data.role);
          } else {
              alert('Failed to generate custom workflow. Please try again.');
          }
      } catch (error) {
          console.error("Custom workflow error:", error);
          alert('Error connecting to server.');
      } finally {
          setIsRegenerating(false);
      }
  };

  const handleViewStepDetails = async (step: WorkflowStage) => {
      setSelectedStep(step);
      setStepDetails(null);
      setIsLoadingDetails(true);
      
      try {
          const response = await fetch('/api/role/workflow-step-details', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  role: displayRole, 
                  stage: step.stage, 
                  tools: step.tools_used 
              })
          });
          
          const result = await response.json();
          if (result.success && result.data) {
              setStepDetails(result.data);
          } else {
              setStepDetails({ error: "Could not load details." });
          }
      } catch (error) {
          console.error("Step details error:", error);
          setStepDetails({ error: "Connection failed." });
      } finally {
          setIsLoadingDetails(false);
      }
  };

  const handleDownloadPDF = async () => {
      const element = document.getElementById('workflow-content');
      if (!element) return;
      
      setIsDownloading(true);
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${role}_Workflow_Lifecycle.pdf`);
      } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again.');
      } finally {
        setIsDownloading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white" id="workflow-content">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <GitBranch className="w-5 h-5 text-indigo-600" />
                        {displayRole} Lifecycle
                    </h1>
                    <p className="text-xs text-gray-500">End-to-end workflow visualization</p>
                </div>
            </div>
            <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
            >
                <Download className="w-4 h-4" /> Export
            </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-10">
        
        {/* Intro */}
        <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Professional Workflow & Lifecycle</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                A comprehensive breakdown of how a <span className="text-indigo-600 font-bold">{displayRole}</span> approaches projects from inception to delivery.
            </p>

            {/* Customization Input */}
            <div className="max-w-xl mx-auto bg-white p-2 rounded-xl shadow-md border border-gray-200 flex gap-2">
                <input 
                    type="text" 
                    placeholder="Customize Stack: e.g. 'Use AWS, Node.js, React' or 'Change AWS to Azure'"
                    className="flex-1 px-4 py-2 border-none outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                    value={customTools}
                    onChange={(e) => setCustomTools(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRegenerateWorkflow()}
                />
                <button 
                    onClick={handleRegenerateWorkflow}
                    disabled={isRegenerating || !customTools.trim()}
                    className={`px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${isRegenerating ? 'opacity-75 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
                >
                    {isRegenerating ? (
                        <>
                         <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                         Generating...
                        </>
                    ) : (
                        <>
                        <Wrench className="w-3.5 h-3.5" />
                        Update Workflow
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Timeline */}
        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block"></div>
            <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gray-200 md:hidden"></div>

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
                                <div className="absolute left-[27px] md:left-1/2 -translate-x-1/2 w-14 h-14 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center z-10 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:border-indigo-100">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold transition-colors ${isHovered ? 'bg-indigo-600' : 'bg-indigo-400'}`}>
                                        {index + 1}
                                    </div>
                                </div>

                                {/* Spacer for opposite side (Desktop only) */}
                                <div className="hidden md:block w-5/12"></div>

                                {/* Content Card */}
                                <div className="ml-16 md:ml-0 md:w-5/12 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 relative">
                                    {/* Arrow pointing to node - Desktop */}
                                    <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-b border-l border-gray-200 transform rotate-45 z-0 transition-colors group-hover:border-indigo-300 ${isEven ? '-left-2' : '-right-2 border-l-0 border-r border-b-0 border-t'}`}></div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                        {step.stage}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        {step.description}
                                    </p>

                                    {/* Tools & Activities */}
                                    <div className="space-y-3 pt-3 border-t border-gray-100">
                                        {step.tools_used && step.tools_used.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Wrench className="w-3.5 h-3.5 text-gray-400" />
                                                {step.tools_used.map((tool, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                                                        {tool}
                                                    </span>
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
                                                            <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0"></div>
                                                            {act}
                                                        </li>
                                                    ))}
                                                 </ul>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleViewStepDetails(step)}
                                        className="w-full mt-4 py-2 border border-indigo-200 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Code className="w-4 h-4" /> Deep Dive & Code
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
                     <div className="w-4 h-4 rounded-full bg-green-500 shadow-md"></div>
                     <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Project Delivery</span>
                 </div>
            </div>
        </div>

      </div>

      {/* Deep Dive Modal */}
      {selectedStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedStep(null)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{selectedStep.stage}</h3>
                        <p className="text-sm text-gray-500">Technical Deep Dive</p>
                    </div>
                    <button 
                        onClick={() => setSelectedStep(null)}
                        className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {isLoadingDetails ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-gray-500 text-sm font-medium">Generating technical details...</p>
                        </div>
                    ) : stepDetails ? (
                        <div className="space-y-6">
                            {/* Code Snippet */}
                            {stepDetails.code_snippet && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Code className="w-5 h-5 text-indigo-600" />
                                        <h4 className="font-bold text-gray-900">Implementation Example</h4>
                                    </div>
                                    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto relative group">
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded uppercase font-mono">
                                            {stepDetails.code_snippet.language}
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
                                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Best Practices
                                    </h4>
                                    <ul className="space-y-2">
                                        {stepDetails.best_practices?.map((practice: string, i: number) => (
                                            <li key={i} className="text-sm text-green-900 flex items-start gap-2">
                                                <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></span>
                                                {practice}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Checklist */}
                                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                                    <h4 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                                        <Layers className="w-4 h-4" /> Validation Checklist
                                    </h4>
                                    <ul className="space-y-2">
                                        {stepDetails.checklist?.map((item: string, i: number) => (
                                            <li key={i} className="text-sm text-indigo-900 flex items-start gap-2">
                                                <div className="mt-0.5 w-4 h-4 border-2 border-indigo-300 rounded flex items-center justify-center bg-white flex-shrink-0 text-indigo-500">
                                                    <CheckCircle className="w-3 h-3" />
                                                </div>
                                                <span className="flex-1">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            Failed to load details.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
