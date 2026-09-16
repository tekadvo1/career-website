import { User, MapPin } from 'lucide-react';

interface RoleAnalysisHeaderProps {
  roleName: string;
  experienceLevel?: string;
  country?: string;
  hasResume?: boolean;
}

export default function RoleAnalysisHeader({
  roleName,
  experienceLevel,
  country,
  hasResume
}: RoleAnalysisHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Understand Your Career Role</h1>
          <p className="text-slate-600 text-base max-w-2xl">
            A comprehensive overview of what it takes to succeed as a <strong className="text-emerald-700 font-semibold">{roleName}</strong>.
          </p>
        </div>
        
        {/* Context Badges */}
        <div className="flex flex-wrap gap-2">
          {experienceLevel ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
              <User className="w-4 h-4 text-emerald-600" />
              {experienceLevel}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium text-amber-700">
              <User className="w-4 h-4 text-amber-600" />
              Experience Level Unknown
            </div>
          )}

          {country ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              {country}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-sm font-medium text-amber-700">
              <MapPin className="w-4 h-4 text-amber-600" />
              Location Unknown
            </div>
          )}
        </div>
      </div>
      
      {(!experienceLevel || !country) && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Some context for this analysis is missing. To get more accurate results tailored to your specific situation, 
          you can update your profile or retake the onboarding questionnaire.
        </div>
      )}
      
      {hasResume && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800 flex items-start gap-2">
           <div className="font-semibold">Resume Analyzed:</div>
           <div>We've mapped your existing skills against the requirements for this role.</div>
        </div>
      )}
    </div>
  );
}
