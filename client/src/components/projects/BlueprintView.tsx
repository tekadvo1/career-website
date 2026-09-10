import React, { useState, useEffect } from 'react';
import { 
  Loader2, BookOpen, Layers, FolderTree, FileCode2, Copy, CheckCircle2, ChevronDown, ChevronRight, Play, ArrowRight, ArrowLeft
} from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';
import { useAlert } from '../../contexts/AlertContext';

interface BlueprintViewProps {
  project: any;
  curriculum: any[];
  onContinue: () => void;
  onBack: () => void;
  onUpdateProject: (p: any) => void;
  onAskAI: (msg: string) => void;
}

export default function BlueprintView({ project, curriculum, onContinue, onBack, onUpdateProject, onAskAI }: BlueprintViewProps) {
  const { showAlert } = useAlert();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  
  const blueprint = project?.blueprint_data;
  const hasBlueprint = blueprint && blueprint.files && blueprint.files.length > 0;

  const generateBlueprint = async () => {
    if (!project?.id) return;
    setIsGenerating(true);
    try {
      const res = await apiFetch(`/api/role/project/${project.id}/generate-blueprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: project.user_id })
      });
      const data = await res.json();
      if (data.success && data.blueprint) {
        onUpdateProject({ ...project, blueprint_data: data.blueprint });
        showAlert("Blueprint generated successfully!", "success");
      } else {
        showAlert(data.error || "Failed to generate blueprint", "error");
      }
    } catch (e) {
      showAlert("An error occurred while generating the blueprint.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!hasBlueprint && !isGenerating && project?.id) {
        // Auto-generate if it doesn't exist? The instructions say: "If generation is necessary: Trigger it explicitly or through the established durable flow... Prevent duplicate concurrent generation."
        // We will show a "Generate" button, or auto-generate on first visit.
        // Let's auto-generate to avoid an empty state on first visit if we don't have it.
        generateBlueprint();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasBlueprint, project?.id]);

  if (isGenerating && !hasBlueprint) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Analyzing Project Requirements</h2>
        <p className="text-slate-500 max-w-sm">Generating your personalized project architecture, file structure, and implementation blueprint...</p>
      </div>
    );
  }

  if (!hasBlueprint) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Project Blueprint</h2>
        <p className="text-slate-500 max-w-sm mb-6">Your project blueprint has not been created yet.</p>
        <button 
          onClick={generateBlueprint}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
          {isGenerating ? "Generating..." : "Generate Blueprint"}
        </button>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  // Group files by top-level directory for the tree
  const fileTree: Record<string, any[]> = {};
  blueprint.files?.forEach((file: any) => {
    const parts = file.path.split('/');
    const dir = parts.length > 1 ? parts[0] : '/';
    if (!fileTree[dir]) fileTree[dir] = [];
    fileTree[dir].push(file);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        
        {/* Header */}
        <div>
          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide mb-3 border border-emerald-100">
            Phase 2: Understand
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Project Blueprint</h1>
          <p className="text-slate-600 text-sm max-w-2xl">
            This is your structural roadmap. Understand what you're building, how the pieces connect, and what files you'll need to create.
          </p>
        </div>

        {/* A. Project Overview */}
        {blueprint.projectOverview && (
          <section className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" /> Project Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">Purpose</h3>
                <p className="text-sm text-slate-700">{blueprint.projectOverview.purpose}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-1">Intended Users</h3>
                <p className="text-sm text-slate-700">{blueprint.projectOverview.intendedUsers}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Key Deliverables</h3>
                <ul className="space-y-1">
                  {blueprint.projectOverview.deliverables?.map((d: string, i: number) => (
                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              {blueprint.projectOverview.scopeBoundaries?.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Out of Scope</h3>
                  <ul className="space-y-1">
                    {blueprint.projectOverview.scopeBoundaries?.map((d: string, i: number) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">✕</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* B. Architecture View */}
        {blueprint.architecture && (
          <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Architecture ({blueprint.architecture.type})
              </h2>
              <button 
                onClick={() => onAskAI("Explain how these parts connect in the architecture.")}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Explain connection
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 items-stretch justify-center relative">
               {blueprint.architecture.components?.map((comp: any, idx: number) => (
                 <React.Fragment key={idx}>
                   <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                      <h3 className="font-bold text-slate-800 mb-1">{comp.name}</h3>
                      <p className="text-xs text-slate-500 mb-3 h-8">{comp.description}</p>
                      <div className="inline-block px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-mono font-medium">
                        {comp.tech}
                      </div>
                   </div>
                   {idx < blueprint.architecture.components.length - 1 && (
                     <div className="hidden md:flex flex-col justify-center text-slate-300">
                       <ArrowRight className="w-6 h-6" />
                     </div>
                   )}
                   {idx < blueprint.architecture.components.length - 1 && (
                     <div className="flex md:hidden justify-center text-slate-300 my-1">
                       <ArrowDownIcon />
                     </div>
                   )}
                 </React.Fragment>
               ))}
            </div>
          </section>
        )}

        {/* C. Interactive File Structure */}
        <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" /> File Structure
            </h2>
            <button 
              onClick={() => onAskAI("What belongs in these files?")}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Ask AI
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row min-h-[300px]">
            {/* Tree Sidebar */}
            <div className="w-full md:w-1/3 border-r border-slate-800 p-2 overflow-y-auto max-h-[400px]">
               {Object.entries(fileTree).map(([dir, files]) => (
                 <div key={dir} className="mb-2">
                   <div className="flex items-center gap-1.5 px-2 py-1.5 text-slate-300 font-mono text-sm">
                     <ChevronDown className="w-3.5 h-3.5" />
                     <FolderTree className="w-3.5 h-3.5 text-blue-400" />
                     {dir === '/' ? 'root' : dir}
                   </div>
                   <div className="pl-6 space-y-0.5">
                     {files.map((file, fIdx) => (
                       <FileNode 
                         key={fIdx} 
                         file={file} 
                         onCopy={() => handleCopy(file.path)}
                         copied={copiedPath === file.path}
                       />
                     ))}
                   </div>
                 </div>
               ))}
            </div>
            
            {/* File Explanations (Static or hover, for now static right pane is just a summary since we use expandable FileNodes) */}
            <div className="w-full md:w-2/3 p-6 flex flex-col justify-center items-center text-center bg-slate-950/50">
                <FileCode2 className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-400 text-sm max-w-sm">
                  Expand a file on the left to see its purpose and what belongs in it. Use this structure as a guide when building your project.
                </p>
            </div>
          </div>
        </section>

        {/* D. Build Sequence */}
        <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-600" /> Build Sequence
            </h2>
            <button 
              onClick={() => onAskAI("Which task should I start with?")}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Which task first?
            </button>
          </div>
          
          <div className="space-y-4">
             {curriculum.map((mod: any, i: number) => (
               <div key={i} className="flex gap-4">
                 <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0 z-10">
                     {i + 1}
                   </div>
                   {i < curriculum.length - 1 && (
                     <div className="w-px h-full bg-slate-200 my-1"></div>
                   )}
                 </div>
                 <div className="pt-1 pb-4">
                   <h3 className="font-bold text-slate-800 mb-1">{mod.title}</h3>
                   <p className="text-sm text-slate-500 mb-2">{mod.description}</p>
                 </div>
               </div>
             ))}
          </div>
        </section>

      </div>
      
      {/* Footer Navigation */}
      <div className="border-t border-slate-200 p-4 bg-white flex justify-between shrink-0">
        <button 
          onClick={onBack}
          className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Setup
        </button>
        <button 
          onClick={onContinue}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center gap-2"
        >
          Continue to Build <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Arrow Down for mobile architecture view
function ArrowDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
  );
}

// Interactive File Node
function FileNode({ file, onCopy, copied }: { file: any, onCopy: () => void, copied: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const name = file.path.split('/').pop();
  
  return (
    <div className="mb-1">
      <div 
        className="group flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-1.5 min-w-0">
           {expanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
           <FileCode2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
           <span className="text-sm font-mono text-slate-200 truncate">{name}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onCopy(); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-all shrink-0"
          title="Copy path"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      
      {expanded && (
        <div className="ml-5 pl-3 mt-1 mb-2 border-l border-slate-700 space-y-2">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">Purpose</span>
            <span className="block text-xs text-slate-300">{file.purpose}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase">What belongs in it</span>
            <span className="block text-xs text-slate-300">{file.belongsInIt}</span>
          </div>
          {file.relatedTasks && (
            <div>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Related Task</span>
              <span className="inline-block px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">{file.relatedTasks}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
