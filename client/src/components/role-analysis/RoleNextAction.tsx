import { ChevronRight } from 'lucide-react';
import type { NormalizedRoleAnalysis } from '../../types/roleAnalysis';

interface RoleNextActionProps {
  onContinue: () => void;
  roleData: NormalizedRoleAnalysis;
  isReturningUser: boolean;
}

export default function RoleNextAction({ onContinue, isReturningUser }: RoleNextActionProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200 rounded-xl mb-12">
      <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to take the next step?</h2>
      <p className="text-sm text-slate-600 mb-6 text-center max-w-md">
        {isReturningUser 
          ? "Return to your dashboard to continue your learning journey." 
          : "Based on this analysis, we've generated a personalized learning roadmap to help you achieve your career goals."}
      </p>
      
      <button
        onClick={onContinue}
        className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-base flex items-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        {isReturningUser ? "Open My Learning" : "View My Learning Plan"} 
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
