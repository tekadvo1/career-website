import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  GitBranch, 
  Clock, 
  Wrench, 
  Layers, 
  Download
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

  const workflow: WorkflowStage[] = analysis.workflow || [];

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
                        {role} Lifecycle
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
        <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Professional Workflow & Lifecycle</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A comprehensive breakdown of how a <span className="text-indigo-600 font-bold">{role}</span> approaches projects from inception to delivery.
            </p>
        </div>

        {/* Timeline */}
        <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block"></div>
            <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gray-200 md:hidden"></div>

            <div className="space-y-12">
                {workflow.length > 0 ? (
                    workflow.map((step, index) => {
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
    </div>
  );
}
