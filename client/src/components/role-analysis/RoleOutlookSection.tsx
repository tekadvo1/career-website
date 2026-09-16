import type { NormalizedRoleAnalysis } from '../../types/roleAnalysis';
import { TrendingUp, DollarSign } from 'lucide-react';

interface RoleOutlookSectionProps {
  roleData: NormalizedRoleAnalysis;
  country?: string;
}

export default function RoleOutlookSection({ roleData, country }: RoleOutlookSectionProps) {
  // Determine if we have valid supporting context to show salary.
  // We need location context and some actual salary data.
  const hasSalaryData = roleData.salary_insights?.entry_level || roleData.salary_insights?.senior_level || roleData.salaryRange;
  const hasGrowthData = roleData.jobGrowth && roleData.jobGrowth.trim() !== '' && roleData.jobGrowth !== "Growth data unavailable";
  
  // Strict condition: only show salary figures if country is known.
  const canShowSalary = hasSalaryData && country && country !== 'Location Unknown';
  const canShowGrowth = hasGrowthData;

  if (!canShowSalary && !canShowGrowth) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Career Outlook</h2>
        <p className="text-sm text-slate-600">Current market information (salary and demand) is not verified or lacks sufficient context for your location.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Career Outlook</h2>
      
      <div className="grid md:grid-cols-3 gap-4">
        {canShowGrowth ? (
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Demand / Growth</span>
            </div>
            <p className="font-semibold text-slate-900 text-sm">{roleData.jobGrowth}</p>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Demand</span>
            </div>
            <p className="text-sm text-slate-600">Growth data unverified</p>
          </div>
        )}

        {canShowSalary ? (
          <>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Entry Level</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm">
                {roleData.salary_insights?.entry_level || roleData.salaryRange}
              </p>
              <p className="text-[10px] text-blue-600 mt-1 uppercase">In {country}</p>
            </div>
            
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Senior Level</span>
              </div>
              <p className="font-semibold text-slate-900 text-sm">
                {roleData.salary_insights?.senior_level || "N/A"}
              </p>
              <p className="text-[10px] text-teal-600 mt-1 uppercase">In {country}</p>
            </div>
          </>
        ) : (
           <div className="md:col-span-2 p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
             <p className="text-sm text-slate-500 text-center">
               Salary information requires a verified location to provide accurate estimates.
             </p>
           </div>
        )}
      </div>
    </div>
  );
}
