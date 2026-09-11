import { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { useAlert } from '../../contexts/AlertContext';
import type { RunTestData, FeatureCheck, CheckStatus, TroubleshootDiagnosis, StartupInstruction } from './projectModel';
import {
  Play, CheckCircle2, XCircle, AlertTriangle, MinusCircle,
  Copy, Check, ChevronDown, ChevronRight, Loader2, Terminal,
  Wrench, Sparkles, ArrowRight, BarChart3, AlertCircle, Shield,
  FlaskConical
} from 'lucide-react';

interface RunTestViewProps {
  project: { id?: string; projectId?: string; user_id?: number; title?: string; tags?: string[]; tools?: string[]; languages?: string[]; runtest_data?: RunTestData };
  onUpdateProject: (p: any) => void;
  onAskAI: (msg: string) => void;
  onBack: () => void;
}

const STATUS_CONFIG: Record<CheckStatus, { label: string; color: string; icon: any; bg: string }> = {
  not_checked: { label: 'Not Checked', color: 'text-slate-500', icon: MinusCircle, bg: 'bg-slate-100' },
  passed: { label: 'Passed', color: 'text-emerald-600', icon: CheckCircle2, bg: 'bg-emerald-50' },
  failed: { label: 'Failed', color: 'text-red-600', icon: XCircle, bg: 'bg-red-50' },
  blocked: { label: 'Blocked', color: 'text-amber-600', icon: AlertTriangle, bg: 'bg-amber-50' },
};

export default function RunTestView({ project, onUpdateProject, onAskAI, onBack }: RunTestViewProps) {
  const { showAlert } = useAlert();
  const [data, setData] = useState<RunTestData | null>(project?.runtest_data?.checks?.length ? project.runtest_data : null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [expandedStartup, setExpandedStartup] = useState<Set<string>>(new Set());
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);
  const [updatingCheck, setUpdatingCheck] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | CheckStatus>('all');

  // Troubleshoot state
  const [troubleshootCheckId, setTroubleshootCheckId] = useState<string | null>(null);
  const [troubleshootForm, setTroubleshootForm] = useState({ command: '', error: '', code: '' });
  const [troubleshootLoading, setTroubleshootLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<TroubleshootDiagnosis | null>(null);

  const projectId = project?.id || project?.projectId;

  useEffect(() => {
    if (!data && projectId) {
      generateRunTest();
    }
  }, [projectId]);

  const generateRunTest = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/role/project/${projectId}/generate-runtest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: project.user_id })
      });
      const json = await res.json();
      if (json.success && json.runtestData) {
        setData(json.runtestData);
        onUpdateProject({ ...project, runtest_data: json.runtestData });
      } else {
        setError(json.error || 'Failed to generate run & test data');
      }
    } catch (e: any) {
      setError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const updateCheckStatus = async (checkId: string, status: CheckStatus, notes?: string) => {
    if (!projectId) return;
    setUpdatingCheck(checkId);
    try {
      const res = await apiFetch(`/api/role/project/${projectId}/update-check-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: project.user_id, checkId, status, notes })
      });
      const json = await res.json();
      if (json.success && json.check && data) {
        const updated = { ...data, checks: data.checks.map(c => c.id === checkId ? json.check : c) };
        setData(updated);
        onUpdateProject({ ...project, runtest_data: updated });
        showAlert(`Check marked as ${STATUS_CONFIG[status].label}`, 'success');
      }
    } catch (e) {
      showAlert('Failed to update check', 'error');
    } finally {
      setUpdatingCheck(null);
    }
  };

  const handleTroubleshoot = async (check: FeatureCheck) => {
    if (!troubleshootForm.error.trim()) {
      showAlert('Please describe the error or output you saw.', 'error');
      return;
    }
    setTroubleshootLoading(true);
    setDiagnosis(null);
    try {
      const res = await apiFetch('/api/ai/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkTitle: check.title,
          checkSteps: check.steps,
          expectedBehavior: check.expectedBehavior,
          userError: troubleshootForm.error,
          userCommand: troubleshootForm.command,
          userCode: troubleshootForm.code,
          projectTitle: project?.title,
          stack: [...(project.tools || []), ...(project.languages || [])].join(', ')
        })
      });
      const json = await res.json();
      if (json.success && json.diagnosis) {
        setDiagnosis(json.diagnosis);
      } else {
        showAlert(json.error || 'Failed to get troubleshooting advice', 'error');
      }
    } catch (e) {
      showAlert('Network error while requesting troubleshooting help', 'error');
    } finally {
      setTroubleshootLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleStartup = (id: string) => {
    setExpandedStartup(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Generating Run & Test Plan</h2>
        <p className="text-slate-500 max-w-sm text-center text-sm">Analyzing your project stack and curriculum to create startup instructions and feature checks...</p>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Unable to Load</h2>
        <p className="text-slate-600 text-sm max-w-md mb-6">{error || 'No run & test data available.'}</p>
        <button onClick={generateRunTest} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const checks = data.checks || [];
  const filteredChecks = filter === 'all' ? checks : checks.filter(c => c.status === filter);
  const summary = {
    not_checked: checks.filter(c => c.status === 'not_checked').length,
    passed: checks.filter(c => c.status === 'passed').length,
    failed: checks.filter(c => c.status === 'failed').length,
    blocked: checks.filter(c => c.status === 'blocked').length,
  };

  return (
    <div className="h-full overflow-y-auto bg-white flex flex-col">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white px-6 md:px-8 py-8 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <FlaskConical className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-400 text-[11px] font-bold uppercase tracking-widest">Run & Test</p>
            <h1 className="text-2xl font-black leading-tight">{project?.title}</h1>
          </div>
        </div>
        <p className="text-slate-300 text-sm max-w-2xl">Start your project locally, check features against acceptance criteria, run tests, and record your results.</p>
      </div>

      <div className="max-w-4xl w-full mx-auto px-4 md:px-8 py-8 flex-1">

        {/* ── SECTION 1: Start Your Project ────────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
            <Terminal className="w-5 h-5 text-emerald-600" /> Start Your Project
          </h2>
          <div className="space-y-3">
            {(data.startup || []).map((item: StartupInstruction, idx: number) => (
              <div key={item.id} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleStartup(item.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{item.component}</span>
                      <span className="text-slate-500 text-xs ml-2">{item.description}</span>
                    </div>
                  </div>
                  {expandedStartup.has(item.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedStartup.has(item.id) && (
                  <div className="px-4 pb-4 space-y-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="pt-4 grid gap-4 sm:grid-cols-2">
                      <InfoRow label="Prerequisites" value={item.prerequisites} />
                      <InfoRow label="Working Directory" value={item.workingDirectory} mono />
                      <InfoRow label="Expected Output" value={item.expectedOutput} />
                      <InfoRow label="How to Stop" value={item.howToStop} />
                    </div>
                    {item.envVars && item.envVars.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Environment Variables</p>
                        <div className="space-y-1">
                          {item.envVars.map((v, i) => (
                            <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-800">
                              <Shield className="w-3 h-3 shrink-0" /> {v}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-[#0d1117] rounded-xl p-3 pr-2">
                      <code className="text-emerald-400 text-sm font-mono flex-1 overflow-x-auto whitespace-nowrap">{item.command}</code>
                      <button
                        onClick={() => handleCopy(item.command, item.id)}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors shrink-0"
                        title="Copy command"
                      >
                        {copied === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 2: Check Main Features ──────────────────────────── */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Check Main Features
            </h2>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg text-[11px] font-bold w-fit">
              {(['all', 'not_checked', 'passed', 'failed', 'blocked'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-2.5 py-1 rounded-md transition-colors capitalize ${filter === f ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f === 'all' ? `All (${checks.length})` : f === 'not_checked' ? `Not Checked (${summary.not_checked})` : `${STATUS_CONFIG[f].label} (${summary[f]})`}
                </button>
              ))}
            </div>
          </div>

          <p className="text-slate-500 text-xs mb-4 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> These are user-recorded results. Record your own status after testing each item.
          </p>

          <div className="space-y-3">
            {filteredChecks.map((check) => {
              const cfg = STATUS_CONFIG[check.status];
              const StatusIcon = cfg.icon;
              const isExpanded = expandedCheck === check.id;
              const isTroubleshooting = troubleshootCheckId === check.id;

              return (
                <div key={check.id} className={`border rounded-xl overflow-hidden transition-colors ${check.status === 'failed' ? 'border-red-200' : check.status === 'passed' ? 'border-emerald-200' : 'border-slate-200'}`}>
                  <button
                    onClick={() => setExpandedCheck(isExpanded ? null : check.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusIcon className={`w-5 h-5 shrink-0 ${cfg.color}`} />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 text-sm block truncate">{check.title}</span>
                        <span className="text-slate-500 text-[11px]">{check.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                      <div className="pt-4 grid gap-3 sm:grid-cols-2">
                        <InfoRow label="Prerequisites" value={check.prerequisites} />
                        <InfoRow label="Example Input" value={check.exampleInput} mono />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Steps</p>
                        <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700">
                          {check.steps.map((s, i) => <li key={i}>{s}</li>)}
                        </ol>
                      </div>

                      <InfoRow label="Expected Behavior" value={check.expectedBehavior} />

                      {/* Status Selector */}
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Record Your Result</p>
                        <div className="flex flex-wrap gap-2">
                          {(['not_checked', 'passed', 'failed', 'blocked'] as CheckStatus[]).map(s => {
                            const sc = STATUS_CONFIG[s];
                            const Icon = sc.icon;
                            return (
                              <button
                                key={s}
                                onClick={() => updateCheckStatus(check.id, s)}
                                disabled={updatingCheck === check.id}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${check.status === s ? `${sc.bg} ${sc.color} border-current ring-1 ring-current/20` : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                              >
                                {updatingCheck === check.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                                {sc.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {check.lastCheckedAt && (
                        <p className="text-[10px] text-slate-400">Last checked: {new Date(check.lastCheckedAt).toLocaleString()}</p>
                      )}

                      {/* Help me fix this */}
                      {(check.status === 'failed' || check.status === 'blocked') && (
                        <div>
                          <button
                            onClick={() => { setTroubleshootCheckId(isTroubleshooting ? null : check.id); setDiagnosis(null); setTroubleshootForm({ command: '', error: '', code: '' }); }}
                            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors border border-amber-200"
                          >
                            <Wrench className="w-3.5 h-3.5" /> {isTroubleshooting ? 'Close troubleshoot' : 'Help me fix this'}
                          </button>

                          {isTroubleshooting && (
                            <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                              <p className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Do not paste passwords, tokens, or secret connection strings.
                              </p>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">Command or action attempted</label>
                                <input
                                  type="text"
                                  value={troubleshootForm.command}
                                  onChange={e => setTroubleshootForm(p => ({ ...p, command: e.target.value }))}
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                                  placeholder="e.g. npm run dev"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">Error or output *</label>
                                <textarea
                                  value={troubleshootForm.error}
                                  onChange={e => setTroubleshootForm(p => ({ ...p, error: e.target.value }))}
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono h-24 resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                                  placeholder="Paste the error message or unexpected output..."
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-slate-600 block mb-1">Relevant code (optional)</label>
                                <textarea
                                  value={troubleshootForm.code}
                                  onChange={e => setTroubleshootForm(p => ({ ...p, code: e.target.value }))}
                                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono h-20 resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                                  placeholder="Paste the relevant code snippet..."
                                />
                              </div>
                              <button
                                onClick={() => handleTroubleshoot(check)}
                                disabled={troubleshootLoading || !troubleshootForm.error.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-lg text-sm transition-colors"
                              >
                                {troubleshootLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                {troubleshootLoading ? 'Analyzing...' : 'Get AI Diagnosis'}
                              </button>

                              {diagnosis && (
                                <div className="mt-4 space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-500" /> AI Diagnosis</h4>
                                  <DiagnosisRow label="Likely Cause" value={diagnosis.likelyCause} />
                                  <DiagnosisRow label="Diagnostic Step" value={diagnosis.diagnosticStep} />
                                  <DiagnosisRow label="Proposed Fix" value={diagnosis.proposedFix} />
                                  <DiagnosisRow label="How to Rerun" value={diagnosis.rerunInstruction} />
                                  <p className="text-[10px] text-slate-400 italic">This is an AI suggestion. You must verify the fix works and update the check status yourself.</p>
                                  <button
                                    onClick={() => onAskAI(`I'm troubleshooting "${check.title}". The AI diagnosed: ${diagnosis.likelyCause}. Proposed fix: ${diagnosis.proposedFix}. Can you help me understand this further?`)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 mt-2"
                                  >
                                    <Sparkles className="w-3.5 h-3.5" /> Continue in AI Chat
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredChecks.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">No checks match this filter.</p>
            )}
          </div>
        </section>

        {/* ── SECTION 3: Run Available Tests ──────────────────────────── */}
        <section className="mb-12">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-emerald-600" /> Run Available Tests
          </h2>
          {data.testRunner?.available ? (
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <p className="text-sm text-slate-700">{data.testRunner.description}</p>
              <div className="flex items-center gap-2 bg-[#0d1117] rounded-xl p-3 pr-2">
                <code className="text-emerald-400 text-sm font-mono flex-1 overflow-x-auto whitespace-nowrap">
                  cd {data.testRunner.directory} && {data.testRunner.command}
                </code>
                <button
                  onClick={() => handleCopy(`cd ${data.testRunner.directory} && ${data.testRunner.command}`, 'test-cmd')}
                  className="p-1.5 text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  {copied === 'test-cmd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">How to Interpret Output</p>
                <p className="text-sm text-slate-600">{data.testRunner.interpretOutput}</p>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl p-6 text-center">
              <FlaskConical className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">No automated test configuration detected for this project.</p>
              <p className="text-xs text-slate-400 mt-1">You can still manually verify features using the checks above.</p>
            </div>
          )}
        </section>

        {/* ── SECTION 4: Results Summary ──────────────────────────────── */}
        <section className="mb-8">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-600" /> Results Summary
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(Object.entries(summary) as [CheckStatus, number][]).map(([status, count]) => {
              const sc = STATUS_CONFIG[status];
              const Icon = sc.icon;
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`flex flex-col items-center p-4 rounded-xl border transition-all ${filter === status ? 'ring-2 ring-emerald-500/20 border-emerald-300' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${sc.color}`} />
                  <span className="text-2xl font-black text-slate-900">{count}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sc.label}</span>
                </button>
              );
            })}
          </div>

          {summary.failed > 0 && (
            <button
              onClick={() => setFilter('failed')}
              className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 mb-4"
            >
              <ArrowRight className="w-4 h-4" /> View {summary.failed} failed check{summary.failed > 1 ? 's' : ''}
            </button>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onBack}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-sm transition-colors"
            >
              Continue Building
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Helper Components ──────────────────────────────────────────── */

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm text-slate-700 ${mono ? 'font-mono bg-slate-100 px-2 py-1 rounded' : ''}`}>{value}</p>
    </div>
  );
}

function DiagnosisRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
    </div>
  );
}
