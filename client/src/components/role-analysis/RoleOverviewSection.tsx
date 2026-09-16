import { useState } from 'react';
import type { NormalizedRoleAnalysis } from '../../types/roleAnalysis';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RoleOverviewSectionProps {
  roleData: NormalizedRoleAnalysis;
}

export default function RoleOverviewSection({ roleData }: RoleOverviewSectionProps) {
  const [expanded, setExpanded] = useState(false);

  // Fallback to title if description is missing.
  const description = roleData.description || `Overview for ${roleData.title}`;

  // If description is short, don't show the "Read more" toggle
  const isLongText = description.length > 250;
  const displayText = (!expanded && isLongText) 
    ? description.substring(0, 250) + '...' 
    : description;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Role Overview</h2>
      
      <div className="prose prose-slate prose-sm md:prose-base max-w-none text-slate-700">
        <p className="whitespace-pre-line leading-relaxed">{displayText}</p>
      </div>

      {isLongText && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? (
            <>Read less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Read more <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
}
