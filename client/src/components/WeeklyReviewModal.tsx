import { X, TrendingUp, Clock, Zap, Award, Target, ChevronRight } from 'lucide-react';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
}

export default function WeeklyReviewModal({ isOpen, onClose, projectTitle }: WeeklyReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 border border-indigo-500/20 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        {/* Header */}
        <div className="p-8 pb-4 relative z-10 flex justify-between items-start">
            <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-400" /> Weekly Career Report
                </h2>
                <p className="text-indigo-200">Progress check for <span className="text-white font-medium">{projectTitle}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Content */}
        <div className="px-8 py-4 relative z-10 space-y-6">
            
            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Hours</div>
                    <div className="text-xl font-bold text-white">5.5 <span className="text-gray-500 text-sm font-normal">/ 6h</span></div>
                    <div className="text-[10px] text-emerald-400 mt-1">92% of goal</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Match Score</div>
                    <div className="text-xl font-bold text-white">72%</div>
                    <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +4% this week
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Streak</div>
                    <div className="text-xl font-bold text-amber-400">4 Days</div>
                    <div className="text-[10px] text-amber-200/80 mt-1">Keep it up!</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">Tasks</div>
                    <div className="text-xl font-bold text-white">3 <span className="text-gray-500 text-sm font-normal">Done</span></div>
                    <div className="text-[10px] text-indigo-300 mt-1">1 Module Completed</div>
                </div>
            </div>

            {/* Skill Impact Section */}
            <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Skill Impact</h3>
                <div className="space-y-3">
                    <div className="bg-gray-800/80 p-3 rounded-lg flex items-center justify-between border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center">
                                <span className="font-bold text-blue-400 text-xs">BE</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">Backend Engineering</div>
                                <div className="text-xs text-gray-500">Node.js, Express, MongoDB</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-emerald-400">+12%</div>
                            <div className="text-xs text-gray-500">Growth</div>
                        </div>
                    </div>
                    <div className="bg-gray-800/80 p-3 rounded-lg flex items-center justify-between border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-900/30 flex items-center justify-center">
                                <span className="font-bold text-purple-400 text-xs">SD</span>
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">System Design</div>
                                <div className="text-xs text-gray-500">API Architecture</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-bold text-emerald-400">+5%</div>
                            <div className="text-xs text-gray-500">Growth</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insight */}
            <div className="bg-indigo-600/20 border border-indigo-500/40 p-4 rounded-xl flex gap-4">
                <div className="bg-indigo-600 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-900/50">
                    <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="font-bold text-white text-sm mb-1">Coach's Verdict</h4>
                    <p className="text-sm text-indigo-200 leading-relaxed">
                        "Solid week! You focused heavily on backend logic, boosting your technical depth. <strong className="text-white">If you maintain this pace, you'll hit 85% role match in 3 weeks.</strong> Recommended focus for next week: Integration Testing."
                    </p>
                </div>
            </div>

        </div>

        {/* Footer Action */}
        <div className="p-6 md:p-8 pt-2 relative z-10 flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2 shadow-lg shadow-indigo-900/20"
            >
                Start Next Week <ChevronRight className="w-4 h-4" />
            </button>
        </div>

      </div>
    </div>
  );
}
