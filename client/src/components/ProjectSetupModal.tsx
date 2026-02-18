import { useState } from 'react';
import { 
  X, 
  Clock, 
  ChevronRight,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  role: string;
}

export default function ProjectSetupModal({ isOpen, onClose, project, role }: ProjectSetupModalProps) {
  const navigate = useNavigate();
  const [timeCommitment, setTimeCommitment] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGeneratePlan = () => {
    setIsGenerating(true);
    // Simulate AI Generation
    setTimeout(() => {
        setIsGenerating(false);
        onClose();
        navigate('/project-workspace', { 
            state: { 
                project, 
                role,
                settings: {
                    timeCommitment
                }
            } 
        });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white text-center relative">
            <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                disabled={isGenerating}
            >
                <X className="w-4 h-4 text-white" />
            </button>
            
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
                <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Let's Frame Your Success</h2>
            <p className="text-indigo-100 text-sm">Customize your execution plan for {project.title}</p>
        </div>

        {/* Content */}
        <div className="p-6">
            
            {isGenerating ? (
                <div className="py-10 text-center space-y-4">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                        <Zap className="absolute inset-0 m-auto w-8 h-8 text-indigo-600 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Structuring Your Roadmap...</h3>
                        <p className="text-sm text-gray-500">Breaking project into modules & estimating tasks</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                             <Clock className="w-4 h-4 text-indigo-600" />
                             How much time can you commit weekly?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {[
                                { id: '3-5', label: '3-5 Hours', sub: 'Casual Pace' },
                                { id: '5-8', label: '5-8 Hours', sub: 'Standard' },
                                { id: '8+', label: '8+ Hours', sub: 'Fast Track' },
                                { id: 'custom', label: 'Custom', sub: 'Your Pace' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => setTimeCommitment(opt.id === 'custom' ? '' : opt.id)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                                        (timeCommitment === opt.id) || (opt.id === 'custom' && timeCommitment !== null && !['3-5', '5-8', '8+'].includes(timeCommitment)) 
                                        ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600'
                                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className={`font-bold text-sm ${
                                         (timeCommitment === opt.id) || (opt.id === 'custom' && timeCommitment !== null && !['3-5', '5-8', '8+'].includes(timeCommitment)) 
                                         ? 'text-indigo-700' : 'text-gray-900'
                                    }`}>
                                        {opt.label}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                                </button>
                            ))}
                        </div>
                        
                        {/* Custom Input Field (Only shows if Custom is selected or active) */}
                        {timeCommitment !== null && !['3-5', '5-8', '8+'].includes(timeCommitment) && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Enter hours per week:</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="168"
                                    placeholder="e.g. 10"
                                    value={timeCommitment}
                                    onChange={(e) => setTimeCommitment(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex items-start gap-3">
                        <Flame className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-900">Consistency Reward</h4>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Completing tasks on schedule will boost your streak multiplier by 2x.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={handleGeneratePlan}
                        disabled={!timeCommitment}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        Generate Execution Plan <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
