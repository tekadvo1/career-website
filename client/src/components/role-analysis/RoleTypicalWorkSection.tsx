import type { NormalizedRoleAnalysis } from '../../types/roleAnalysis';
import { Briefcase, Clock, GitBranch } from 'lucide-react';

interface RoleTypicalWorkSectionProps {
  roleData: NormalizedRoleAnalysis;
}

export default function RoleTypicalWorkSection({ roleData }: RoleTypicalWorkSectionProps) {
  const hasWorkflow = roleData.workflow && roleData.workflow.length > 0;
  const hasDayInLife = roleData.day_in_the_life && roleData.day_in_the_life.length > 0;

  if (!hasWorkflow && !hasDayInLife) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-emerald-600" /> Typical Work
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Typical Project Workflow */}
        {hasWorkflow && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-500" /> Project Lifecycle
            </h3>
            <div className="relative border-l-2 border-slate-200 ml-2 space-y-6 pb-2">
              {roleData.workflow!.map((step, index) => (
                <div key={index} className="ml-5 relative">
                  <div className="absolute -left-[27px] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm mt-1.5"></div>
                  <h4 className="font-bold text-sm text-slate-900">{step.stage}</h4>
                  {step.description && (
                    <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Illustrative Workday */}
        {hasDayInLife && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" /> Illustrative Workday
            </h3>
            <p className="text-xs text-slate-500 mb-4 italic">
              Note: Schedules vary significantly by employer and team. This is a generic illustration.
            </p>
            <div className="space-y-4">
              {roleData.day_in_the_life!.map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    {item.time && (
                      <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded w-20 text-center flex-shrink-0">
                        {item.time}
                      </span>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{item.activity}</h4>
                      {item.description && (
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
