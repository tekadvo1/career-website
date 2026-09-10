import { useState } from 'react';
import type { OS, SetupRequirement } from './setupRegistry';
import { deriveSetupRequirements } from './setupRegistry';
import { Monitor, Apple, MonitorPlay, CheckCircle2, Circle, ChevronDown, ChevronUp, Copy, HelpCircle, ExternalLink, Settings2, Play, Terminal } from 'lucide-react';

interface SetupViewProps {
  project: any;
  initialSetupData: any;
  onSaveSetup: (setupData: any, proceed: boolean) => void;
  onHelpMeFixIt: (req: SetupRequirement, os: OS) => void;
}

export function SetupView({ project, initialSetupData, onSaveSetup, onHelpMeFixIt }: SetupViewProps) {
  const [os, setOs] = useState<OS | null>(initialSetupData?.os || null);
  const [mode, setMode] = useState<'quick' | 'step'>('quick');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set(initialSetupData?.checkedItems || []));
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedReq, setExpandedReq] = useState<string | null>(null);

  const reqs = deriveSetupRequirements(project);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleCheck = (id: string) => {
    const next = new Set(checkedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedItems(next);
  };

  const handleSave = (proceed: boolean) => {
    onSaveSetup({
      os,
      checkedItems: Array.from(checkedItems)
    }, proceed);
  };

  const allChecked = reqs.every(r => checkedItems.has(r.id));

  return (
    <div className="h-full overflow-y-auto bg-white flex flex-col animate-in fade-in">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-8 py-10 shrink-0">
        <h1 className="text-3xl font-black mb-3">Get ready to build</h1>
        <p className="text-slate-300 text-lg max-w-2xl">
          Set up the tools this project needs, then check that they work. 
          We've customized this checklist for <strong>{project.title}</strong>.
        </p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-6 py-8 flex-1">
        {/* OS Selection */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">1. Confirm your operating system</h3>
          <div className="flex gap-4">
            {[
              { id: 'windows', label: 'Windows', icon: <Monitor className="w-5 h-5" /> },
              { id: 'macos', label: 'macOS', icon: <Apple className="w-5 h-5" /> },
              { id: 'linux', label: 'Linux', icon: <MonitorPlay className="w-5 h-5" /> }
            ].map(osOpt => (
              <button
                key={osOpt.id}
                onClick={() => setOs(osOpt.id as OS)}
                className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 rounded-xl border-2 transition-all ${
                  os === osOpt.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {osOpt.icon}
                <span className="font-bold">{osOpt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Requirements */}
        {os && (
          <div className="mb-8 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">2. Install Required Tools</h3>
              <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
                <button onClick={() => setMode('quick')} className={`px-3 py-1.5 rounded-md ${mode === 'quick' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Quick Checklist</button>
                <button onClick={() => setMode('step')} className={`px-3 py-1.5 rounded-md ${mode === 'step' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Step-by-Step</button>
              </div>
            </div>

            <div className="space-y-4">
              {reqs.map((req) => {
                const isChecked = checkedItems.has(req.id);
                const isExpanded = expandedReq === req.id || mode === 'step';

                return (
                  <div key={req.id} className={`border rounded-xl bg-white overflow-hidden transition-all ${isChecked ? 'border-emerald-200' : 'border-slate-200'}`}>
                    <div 
                      className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${isChecked ? 'bg-emerald-50/30' : ''}`}
                      onClick={() => setExpandedReq(isExpanded && mode === 'quick' ? null : req.id)}
                    >
                      <button onClick={(e) => { e.stopPropagation(); toggleCheck(req.id); }} className={`flex-shrink-0 transition-colors ${isChecked ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-400'}`}>
                        {isChecked ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-bold text-[15px] ${isChecked ? 'text-slate-500' : 'text-slate-900'}`}>{req.name}</h4>
                          <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{req.version}</span>
                        </div>
                        <p className="text-[13px] text-slate-500 truncate mt-0.5">{req.why}</p>
                      </div>
                      {mode === 'quick' && (
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="px-14 pb-5 pt-2 animate-in slide-in-from-top-2 border-t border-slate-100">
                        <div className="space-y-4">
                          <div>
                            <h5 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Settings2 className="w-4 h-4 text-slate-400"/> Installation</h5>
                            <p className="text-[14px] text-slate-700 leading-relaxed mb-3">{req.instructions[os]}</p>
                            <a href={req.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                               Official Documentation <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>

                          <div>
                            <h5 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Terminal className="w-4 h-4 text-slate-400"/> Verification</h5>
                            <div className="bg-slate-900 rounded-lg p-1 flex items-center">
                              <code className="text-emerald-400 text-[13px] font-mono px-3 flex-1">{req.verifyCmd}</code>
                              <button onClick={() => handleCopy(req.verifyCmd, req.id)} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-md">
                                {copied === req.id ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-[12px] text-slate-500 mt-2 flex items-center gap-1.5">
                              <span className="font-semibold text-slate-700">Expected output:</span> {req.verifyPattern}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <button onClick={(e) => { e.stopPropagation(); toggleCheck(req.id); }} className={`text-[13px] font-bold px-4 py-2 rounded-lg transition-colors ${isChecked ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}>
                              {isChecked ? 'Mark as Not Checked' : 'I Checked This'}
                            </button>
                            <button onClick={() => onHelpMeFixIt(req, os)} className="text-[13px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5">
                              <HelpCircle className="w-4 h-4" /> Help me fix it
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
               <span className="text-[13px] font-bold text-slate-600">
                 {checkedItems.size} of {reqs.length} required items checked
               </span>
               <div className="flex gap-3">
                 <button onClick={() => handleSave(false)} className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition-colors">
                   Save for later
                 </button>
                 <button onClick={() => handleSave(true)} className={`px-4 py-2 text-[13px] font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2 ${allChecked ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-black'}`}>
                   {allChecked ? 'Save and Continue to Build' : 'Continue Without Finishing'} <Play className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
