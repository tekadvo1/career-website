import { useState } from 'react';
import type { NormalizedRoleAnalysis, ToolOrTech } from '../../types/roleAnalysis';
import { Wrench, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface RoleToolsSectionProps {
  roleData: NormalizedRoleAnalysis;
}

export default function RoleToolsSection({ roleData }: RoleToolsSectionProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const allTools: Array<{ category: string, items: ToolOrTech[] }> = [];

  if (roleData.languages && roleData.languages.length > 0) {
    allTools.push({ category: 'Languages', items: roleData.languages });
  }
  if (roleData.frameworks && roleData.frameworks.length > 0) {
    allTools.push({ category: 'Frameworks', items: roleData.frameworks });
  }
  if (roleData.tools && roleData.tools.length > 0) {
    allTools.push({ category: 'Tools', items: roleData.tools });
  }

  if (allTools.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Wrench className="w-5 h-5 text-emerald-600" /> Tools & Technologies
      </h2>

      <div className="space-y-6">
        {allTools.map((group, gIdx) => (
          <div key={gIdx}>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              {group.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((item, iIdx) => {
                const id = `${group.category}-${iIdx}`;
                const isExpanded = expandedItems.has(id);
                
                return (
                  <div key={id} className="border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-emerald-300 transition-colors">
                    <button
                      onClick={() => toggleItem(id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none"
                    >
                      <span className="font-semibold text-slate-900">{item.name}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
                        {item.used_for && (
                          <div className="text-sm text-slate-700 mb-2">
                            <strong className="text-slate-900 font-semibold block mb-1">Used for:</strong>
                            {item.used_for}
                          </div>
                        )}
                        {item.relation_to_role && (
                          <div className="text-sm text-slate-700 mb-3">
                            <strong className="text-slate-900 font-semibold block mb-1">Relation to role:</strong>
                            {item.relation_to_role}
                          </div>
                        )}
                        {item.documentation_url && (
                          <a 
                            href={item.documentation_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded transition-colors"
                          >
                            Documentation <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
