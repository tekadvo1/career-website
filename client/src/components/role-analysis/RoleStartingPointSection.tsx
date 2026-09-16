import { Target, CheckCircle2, Sparkles } from 'lucide-react';

interface RoleStartingPointSectionProps {
  hasResume: boolean;
  resumeSkills?: {
    technicalSkills?: string[];
    softSkills?: string[];
  };
  learningPath?: string; // 'master' or 'expand'
}

export default function RoleStartingPointSection({ 
  hasResume, 
  resumeSkills, 
  learningPath 
}: RoleStartingPointSectionProps) {
  
  if (!hasResume || !resumeSkills) {
    return (
      <div className="bg-slate-50 rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Your Starting Point</h2>
        <p className="text-slate-600 text-sm">
          Since no resume or prior experience was provided, this analysis provides general guidance for the role. 
          To receive personalized recommendations and see how your current skills map to these requirements, you can upload your resume during onboarding.
        </p>
      </div>
    );
  }

  const isMaster = learningPath === 'master';
  const hasTechSkills = resumeSkills.technicalSkills && resumeSkills.technicalSkills.length > 0;

  return (
    <div className={`rounded-xl shadow-sm border-2 p-6 mb-6 ${
      isMaster 
        ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300"
        : "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300"
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isMaster ? "bg-emerald-600" : "bg-teal-600"
        }`}>
          {isMaster ? (
            <Target className="w-6 h-6 text-white" />
          ) : (
            <Sparkles className="w-6 h-6 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {isMaster 
              ? "Your Focus: Deepening Expertise" 
              : "Your Focus: Expanding Capabilities"}
          </h2>
          <p className="text-sm text-slate-700 mb-4">
            {isMaster
              ? "We detected foundational knowledge in your resume. Your generated learning path focuses on advanced concepts and mastering your current stack."
              : "We identified opportunities to grow your skill set. Your generated learning path focuses on adding trending, complementary technologies."}
          </p>

          {hasTechSkills && (
            <div>
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Confirmed Skills (from your resume)
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeSkills.technicalSkills!.map((skill, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium bg-white border border-slate-200 text-slate-800"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
