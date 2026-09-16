import { useState } from 'react';
import type { NormalizedRoleAnalysis } from '../../types/roleAnalysis';
import { Award, ChevronDown, ChevronUp, User } from 'lucide-react';

interface RoleSkillsSectionProps {
  roleData: NormalizedRoleAnalysis;
}

export default function RoleSkillsSection({ roleData }: RoleSkillsSectionProps) {
  const [expandedSkills, setExpandedSkills] = useState<Set<number>>(new Set());

  const toggleSkill = (index: number) => {
    setExpandedSkills(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const hasSoftSkills = roleData.soft_skills && roleData.soft_skills.length > 0;
  const hasHardSkills = roleData.skills && roleData.skills.length > 0;

  if (!hasSoftSkills && !hasHardSkills) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Award className="w-5 h-5 text-emerald-600" /> Skills to Learn
      </h2>

      {hasSoftSkills && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500" /> Crucial Soft Skills
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {roleData.soft_skills!.map((skill, index) => (
              <div key={index} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="font-bold text-slate-900 mb-1">{skill.name}</div>
                {skill.description && (
                  <div className="text-sm text-slate-600">{skill.description}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasHardSkills && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Technical Skills</h3>
          <div className="space-y-3">
            {roleData.skills!.map((skill, index) => {
              const isExpanded = expandedSkills.has(index);
              return (
                <div key={index} className="border border-slate-200 rounded-lg overflow-hidden transition-all duration-200 bg-white hover:border-slate-300">
                  <button 
                    onClick={() => toggleSkill(index)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none focus:bg-slate-50"
                  >
                    <span className="font-semibold text-slate-900">{skill.name}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100">
                      {skill.description && (
                        <p className="text-sm text-slate-700 mb-2 leading-relaxed">
                          {skill.description}
                        </p>
                      )}
                      {skill.why_it_matters && (
                        <div className="mt-2 text-sm bg-emerald-50 border border-emerald-100 p-3 rounded text-emerald-800">
                          <strong className="block text-emerald-900 mb-1">Why it matters:</strong>
                          {skill.why_it_matters}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
