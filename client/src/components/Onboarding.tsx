import { apiFetch } from '../utils/apiFetch';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Upload, Sparkles, FileText, X, TrendingUp, Plus, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';
import Sidebar from './Sidebar';
import { getUser } from '../utils/auth';

export default function Onboarding() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const isReturningUser = (() => {
    try {
      const user = (getUser() ?? {});
      return !!user.onboarding_completed;
    } catch {
      return false;
    }
  })();

  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [country, setCountry] = useState('USA');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [selectedPath, setSelectedPath] = useState<'master' | 'expand' | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const user = (getUser() ?? {});
    if (user && user.onboarding_completed && !location.state?.force) {
      navigate('/dashboard');
    }
  }, [navigate, location]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = async (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setRole(''); // Clear manual role when uploading resume
      await analyzeResume(selectedFile);
    } else {
      showAlert('Please upload a PDF or DOCX file.', 'error');
    }
  };

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(p => Math.min(95, p + (Math.random() * 15)));
      }, 500);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const analyzeResume = async (uploadedFile: File) => {
    setIsAnalyzing(true);
    setAnalysisData(null);
    setSelectedPath(null);

    const user = (getUser() ?? {});
    const formData = new FormData();
    formData.append('resume', uploadedFile);
    formData.append('userId', (user as any).id || '');

    try {
      const response = await apiFetch('/api/resume/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysisData(data.analysis);
      
      // Auto-select a path if none is chosen, defaults to expand
      setSelectedPath('expand');
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      showAlert(`Analysis Failed. Try entering your role manually.`, 'error');
      setFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!role && !file) {
      showAlert('Please enter a role or upload a resume to continue.', 'warning');
      return;
    }
    if (file && !selectedPath && !isAnalyzing) {
      showAlert('Please choose a learning path.', 'warning');
      return;
    }
    if (isAnalyzing) {
      showAlert('Please wait for your resume to finish analyzing.', 'warning');
      return;
    }

    const user = (getUser() ?? {});
    if (!user.id) {
      showAlert('Session expired. Please sign in again.', 'error');
      navigate('/signin');
      return;
    }

    const updatedUser = { ...user, onboarding_completed: true };
    sessionStorage.setItem('user', JSON.stringify(updatedUser));
    apiFetch('/api/auth/complete-onboarding', { method: 'POST' }).catch(() => {});

    navigate('/role-analysis', {
      state: {
        role: analysisData?.suggestedRole || role || 'General Career Path',
        experienceLevel,
        country,
        hasResume: !!file,
        resumeFileName: file?.name,
        analysis: null,
        learningPath: selectedPath,
        resumeSkills: analysisData
      }
    });
  };

  // Determine if we should show the bottom sections
  const showBottomSections = role.length > 2 || !!file;

  return (
    <div className="min-h-[100dvh] w-full overflow-y-auto bg-[#f8fafc] text-slate-800 flex items-start justify-center py-6 md:py-12 px-4">
      {isReturningUser && <Sidebar activePage="onboarding" />}
      
      <div className="w-full max-w-2xl bg-white rounded-[16px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-500">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 px-4 py-5 md:py-6 text-center relative overflow-hidden">
          {/* Decorative background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-teal-400 blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-emerald-400 blur-3xl mix-blend-overlay"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold tracking-wide uppercase mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Career Architect
            </div>
            <h1 className="text-lg md:text-2xl font-extrabold text-white mb-2 tracking-tight">
              Where are you heading?
            </h1>
            <p className="text-teal-50 text-[11px] max-w-lg mx-auto font-medium leading-relaxed">
              Tell us your target role or upload your resume. We'll use AI to build a personalized, step-by-step roadmap to get you there.
            </p>
          </div>
        </div>

        <div className="p-4 md:p-5 space-y-5">
          
          {/* SECTION 1: ROLE OR RESUME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 relative">
            {/* LEFT: Role Input */}
            <div className={`transition-all duration-500 ${file ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
              <h2 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                Option 1: Type a Role
              </h2>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-0 focus:border-teal-500 focus:bg-white transition-all shadow-sm"
                  placeholder="e.g. Software Engineer..."
                  value={role}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRole(value);
                    if (value.length > 1) {
                      const matches = [
                        "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
                        "Product Manager", "Product Designer", "UI/UX Designer", "Data Scientist", "Data Analyst", 
                        "Machine Learning Engineer", "DevOps Engineer", "Cloud Architect", "Cybersecurity Analyst"
                      ].filter(r => r.toLowerCase().includes(value.toLowerCase()));
                      setSuggestions(matches);
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => role.length > 1 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors flex items-center justify-between group/item"
                        onClick={() => {
                          setRole(suggestion);
                          setShowSuggestions(false);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {suggestion}
                        <span className="opacity-0 group-hover/item:opacity-100 text-teal-600 text-xs bg-teal-100 px-2 py-1 rounded-md">Select</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Divider */}
            <div className="md:hidden flex items-center justify-center -my-2">
              <div className="w-full h-px bg-slate-100"></div>
              <span className="px-4 text-[10px] font-black text-slate-300 uppercase bg-white">OR</span>
              <div className="w-full h-px bg-slate-100"></div>
            </div>

            {/* RIGHT: Resume Upload */}
            <div className={`transition-all duration-500 ${role && !file ? 'opacity-40 grayscale' : 'opacity-100'}`}>
              <h2 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center justify-between">
                Option 2: Upload Resume
                {file && <span className="text-teal-500 text-[9px] bg-teal-50 px-1.5 py-0.5 rounded-full normal-case">Active</span>}
              </h2>
              
              <div 
                className={`w-full min-h-[70px] border border-dashed rounded-lg p-2 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                  isDragging 
                    ? 'border-teal-500 bg-teal-50 scale-[1.02]' 
                    : file 
                      ? 'border-emerald-200 bg-emerald-50/50' 
                      : 'border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-slate-100'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".doc,.docx,.pdf" onChange={handleFileSelect} />
                
                {file ? (
                  <div className="text-center z-10 w-full">
                    <div className="inline-flex p-1 bg-white shadow-sm border border-emerald-100 rounded-full mb-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 mb-0.5 truncate px-2">{file.name}</p>
                    <p className="text-[9px] font-semibold text-slate-500 mb-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); setAnalysisData(null); }}
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded text-[9px] font-bold transition-colors inline-flex items-center"
                    >
                      <X className="w-2.5 h-2.5 mr-1" /> Remove File
                    </button>
                  </div>
                ) : (
                  <div className="text-center pointer-events-none">
                    <div className="inline-flex p-1 bg-white shadow-sm border border-slate-100 rounded-full mb-1 text-slate-400">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-700 mb-0.5">
                      Drag & Drop your resume
                    </p>
                    <p className="text-[9px] text-slate-400">
                      PDF or DOCX up to 5MB
                    </p>
                  </div>
                )}

                {/* Progress bar background during analysis */}
                {isAnalyzing && (
                  <div 
                    className="absolute bottom-0 left-0 h-1.5 bg-emerald-500 transition-all duration-300 ease-out z-0" 
                    style={{ width: `${progress}%` }} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: PATH SELECTION (ONLY IF FILE UPLOADED) */}
          <div className={`transition-all duration-700 ease-in-out origin-top ${file ? 'opacity-100 max-h-[1000px] scale-y-100' : 'opacity-0 max-h-0 scale-y-0 overflow-hidden hidden'}`}>
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">How do you want to grow?</h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">Based on your resume, pick a learning direction.</p>
                </div>
                {isAnalyzing && (
                  <div className="hidden sm:flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-2.5 h-2.5 mr-1 animate-pulse" /> Analyzing...
                  </div>
                )}
                {analysisData && (
                  <div className="hidden sm:flex items-center text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Complete
                  </div>
                )}
              </div>

              {isAnalyzing ? (
                // Loading Skeleton
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-pulse">
                  <div className="h-20 bg-slate-100 rounded-lg border border-slate-200"></div>
                  <div className="h-20 bg-slate-100 rounded-lg border border-slate-200"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* Card 1: Master */}
                  <button 
                    onClick={() => setSelectedPath('master')}
                    className={`group text-left rounded-lg border p-3 transition-all duration-300 flex flex-col items-start ${selectedPath === 'master' ? 'border-teal-500 bg-teal-50/30 shadow-sm ring-1 ring-teal-50' : 'border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50'}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-2 transition-colors ${selectedPath === 'master' ? 'bg-teal-500' : 'bg-slate-100 group-hover:bg-teal-100'}`}>
                      <TrendingUp className={`w-3.5 h-3.5 ${selectedPath === 'master' ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'}`} />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Master Current Skills</h3>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Deepen expertise in {analysisData?.suggestedRole || 'your current role'}. Focus on advanced concepts and architecture.
                    </p>
                  </button>

                  {/* Card 2: Expand */}
                  <button 
                    onClick={() => setSelectedPath('expand')}
                    className={`group text-left rounded-lg border p-3 transition-all duration-300 flex flex-col items-start ${selectedPath === 'expand' ? 'border-indigo-500 bg-indigo-50/30 shadow-sm ring-1 ring-indigo-50' : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50'}`}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center mb-2 transition-colors ${selectedPath === 'expand' ? 'bg-indigo-600' : 'bg-slate-100 group-hover:bg-indigo-100'}`}>
                      <Plus className={`w-3.5 h-3.5 ${selectedPath === 'expand' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-900 mb-0.5">Expand & Add Skills</h3>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Broaden your horizons by learning trending tools and skills to become more versatile.
                    </p>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: EXPERTISE & COUNTRY (Fades in once goal is provided) */}
          <div className={`transition-all duration-700 delay-150 ease-in-out ${showBottomSections ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              
              <div>
                <h2 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  Your Current Experience
                </h2>
                <div className="flex bg-slate-100 p-0.5 rounded">
                  {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setExperienceLevel(level)}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-sm transition-all ${
                        experienceLevel === level
                          ? 'bg-white text-teal-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  Target Location
                </h2>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="block w-full pl-2.5 pr-8 py-1.5 border border-slate-200 rounded text-xs font-medium bg-slate-50 text-slate-700 focus:outline-none focus:ring-0 focus:border-teal-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="USA">United States (USA)</option>
                    <option value="India">India</option>
                    <option value="UK">United Kingdom (UK)</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="Singapore">Singapore</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

            </div>

            {/* ACTION BUTTON */}
            <div className="mt-5">
              <button 
                onClick={handleGenerate}
                disabled={isAnalyzing || (!role && !file)}
                className={`w-full py-2.5 text-white text-[13px] font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow hover:shadow-md active:scale-[0.99] ${
                  isAnalyzing || (!role && !file)
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500'
                }`}
              >
                {isAnalyzing ? (
                  <><Sparkles className="animate-pulse w-3 h-3" /> Analyzing Resume...</>
                ) : (
                  <>Build My Career Plan <TrendingUp className="w-3 h-3" /></>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
