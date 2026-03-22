import { apiFetch } from '../utils/apiFetch';
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Gamepad2, Sparkles, AlertCircle, ArrowRight, ShieldCheck, Zap, ZoomIn, ZoomOut, UploadCloud, FileText } from 'lucide-react';
import { useAlert } from '../contexts/AlertContext';

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export default function QuizGame() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  // Default fallback context
  const cleanRoleName = (r: string) => r ? r.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() : r;
  const [role, setRole] = useState(cleanRoleName(location.state?.role || "Software Engineer"));
  const [topic] = useState(location.state?.topic || "Full Stack Basics");
  
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [zoom, setZoom] = useState(100);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress(p => p >= 98 ? 98 : p + 2);
      }, 100);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    // Attempt to load role from lastRoleAnalysis
    if (!location.state?.role) {
      try {
        const saved = sessionStorage.getItem('lastRoleAnalysis');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.role) setRole(cleanRoleName(parsed.role));
        }
      } catch (e) {}
    }
  }, [location.state?.role]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      let res;
      if (selectedFile) {
         // Resume Test Mode
         const formData = new FormData();
         formData.append('resume', selectedFile);
         formData.append('role', role);
         formData.append('topic', topic);
         
         res = await apiFetch('/api/ai/generate-resume-quiz', {
            method: 'POST',
            body: formData
         });
      } else {
         // Standard Mode
         res = await apiFetch('/api/ai/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, topic })
         });
      }
      
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setStarted(true);
      } else {
        showAlert("Failed to build quiz map. Please try again later.", "error");
      }
    } catch (err) {
      console.error(err);
      showAlert("Failed to contact the Quiz Master.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (idx: number) => {
    if (showExplanation) return; // Prevent multiple clicks
    setSelectedOption(idx);
    setShowExplanation(true);
    
    if (idx === questions[currentIdx].answerIndex) {
      setScore(s => s + 100);
      
      apiFetch('/api/auth/add-xp', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ amount: 100 })
      }).then(() => showAlert('+100 XP awarded!', 'success')).catch(e => console.error(e));
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col md:flex-row">
      <div className="z-50 shrink-0"><Sidebar activePage="quiz-game" /></div>

      <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 flex flex-col items-center justify-start sm:justify-center relative min-h-0 pt-16 sm:pt-8">
         {/* Zoom Controls */}
         <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 flex items-center gap-1.5 sm:gap-2 bg-slate-800 border border-slate-700 p-1 sm:p-1.5 rounded-lg shadow-xl scale-90 sm:scale-100 origin-top-right">
           <button 
             onClick={() => setZoom(z => Math.max(50, z - 10))} 
             className="p-1.5 hover:bg-slate-700 text-slate-300 rounded transition-colors"
           >
             <ZoomOut className="w-4 h-4" />
           </button>
           <span className="text-xs font-bold text-slate-300 min-w-[3ch] text-center">{zoom}%</span>
           <button 
             onClick={() => setZoom(z => Math.min(150, z + 10))}
             className="p-1.5 hover:bg-slate-700 text-slate-300 rounded transition-colors"
           >
             <ZoomIn className="w-4 h-4" />
           </button>
         </div>

         {/* Background Elements */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/20 blur-[120px] rounded-full"></div>
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full"></div>
         </div>

         <div className="max-w-3xl w-full z-10 transition-transform origin-top" style={{ transform: `scale(${zoom / 100})` }}>
            {!started && !finished && (
               <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-slate-700 shadow-2xl text-center">
                   <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/30">
                       <Gamepad2 className="w-10 h-10 text-white" />
                   </div>
                   <h1 className="text-3xl font-extrabold text-white mb-2">FindStreak Arcade</h1>
                   <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                      Test your knowledge on <span className="text-teal-400 font-bold">{topic}</span>.
                      Earn XP automatically synced to your FindStreak profile and level up your {role} journey.
                   </p>
                   <input 
                       type="file" 
                       accept=".pdf,.doc,.docx" 
                       ref={fileInputRef} 
                       className="hidden" 
                       onChange={(e) => {
                           if (e.target.files && e.target.files.length > 0) {
                               setSelectedFile(e.target.files[0]);
                           }
                       }} 
                   />
                   
                   <div className="flex flex-col gap-4 justify-center items-center">
                     {loading ? (
                        <div className="w-full max-w-sm mx-auto">
                           <div className="mb-2 flex justify-between text-xs font-semibold">
                              <span className="text-teal-400 flex items-center gap-2"><Sparkles className="w-4 h-4 animate-pulse"/> Generating Level...</span>
                              <span className="text-slate-400">{loadingProgress}%</span>
                           </div>
                           <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                              <div 
                                className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${loadingProgress}%` }}
                              />
                           </div>
                        </div>
                     ) : (
                       <div className="flex flex-col sm:flex-row gap-4 w-full">
                           {selectedFile ? (
                               <button 
                                 onClick={() => fileInputRef.current?.click()}
                                 className="px-6 py-4 border-2 border-teal-500 bg-teal-500/10 text-teal-300 font-bold rounded-xl transition-all hover:bg-teal-500/20 flex items-center justify-center gap-2"
                               >
                                 <FileText className="w-5 h-5 text-teal-400" /> 
                                 <span className="truncate max-w-[150px]">{selectedFile.name}</span>
                               </button>
                           ) : (
                               <button 
                                 onClick={() => fileInputRef.current?.click()}
                                 className="px-6 py-4 border-2 border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                               >
                                 <UploadCloud className="w-5 h-5 text-slate-400" /> Upload Resume (Optional)
                               </button>
                           )}
                           
                           <button 
                             onClick={fetchQuiz} 
                             className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2"
                           >
                             <Zap className="w-5 h-5 text-amber-300" /> Start {selectedFile ? 'Mock Interview' : 'Game'}
                           </button>
                       </div>
                     )}
                   </div>
               </div>
            )}

            {started && !finished && currentQ && (
               <div>
                  <div className="flex items-center justify-between mb-6">
                      <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-emerald-400 font-black tracking-widest text-sm flex items-center gap-2">
                          SCORE: {score} <Trophy className="w-4 h-4" />
                      </div>
                      <div className="text-slate-400 font-bold text-sm">
                          {currentIdx + 1} / {questions.length}
                      </div>
                  </div>

                  <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 md:p-10 border border-slate-700 shadow-2xl mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                          {currentQ.question}
                      </h2>

                      <div className="grid grid-cols-1 gap-4">
                          {currentQ.options.map((opt, i) => {
                              const isSelected = selectedOption === i;
                              const isCorrectAnswer = showExplanation && i === currentQ.answerIndex;
                              const isWrongSelection = showExplanation && isSelected && !isCorrectAnswer;
                              
                              let btnClass = "border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-slate-300";
                              if (showExplanation) {
                                  if (isCorrectAnswer) btnClass = "border-emerald-500 bg-emerald-500/20 text-emerald-300";
                                  else if (isWrongSelection) btnClass = "border-red-500 bg-red-500/20 text-red-300";
                                  else btnClass = "border-slate-700 bg-slate-800/30 text-slate-500 opacity-50";
                              } else if (isSelected) {
                                  btnClass = "border-teal-500 bg-teal-500/20 text-teal-300";
                              }

                              return (
                                  <button
                                      key={i}
                                      onClick={() => handleSelect(i)}
                                      disabled={showExplanation}
                                      className={`w-full text-left p-3.5 sm:p-4 rounded-xl border-2 transition-all font-medium text-[13.5px] sm:text-base flex items-center gap-3 sm:gap-4 ${btnClass}`}
                                  >
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 ${showExplanation && isCorrectAnswer ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                          {String.fromCharCode(65 + i)}
                                      </div>
                                      <span className="flex-1">{opt}</span>
                                  </button>
                              );
                          })}
                      </div>

                      {showExplanation && (
                          <div className={`mt-8 p-6 rounded-xl border ${selectedOption === currentQ.answerIndex ? 'bg-emerald-900/30 border-emerald-800/50' : 'bg-red-900/30 border-red-800/50'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                             <h3 className={`flex items-center gap-2 font-bold mb-2 ${selectedOption === currentQ.answerIndex ? 'text-emerald-400' : 'text-red-400'}`}>
                                {selectedOption === currentQ.answerIndex ? <ShieldCheck className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                                {selectedOption === currentQ.answerIndex ? 'Correct!' : 'Incorrect'}
                             </h3>
                             <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                 {currentQ.explanation}
                             </p>
                             
                             <div className="mt-6 flex justify-end">
                                 <button 
                                     onClick={handleNext}
                                     className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-200 font-bold rounded-lg transition-colors flex items-center gap-2"
                                 >
                                     {currentIdx + 1 === questions.length ? 'Finish Level' : 'Next Question'} <ArrowRight className="w-4 h-4" />
                                 </button>
                             </div>
                          </div>
                      )}
                  </div>
               </div>
            )}

            {finished && (
               <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-10 border border-slate-700 shadow-2xl text-center">
                   <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/40">
                       <Trophy className="w-12 h-12 text-white" />
                   </div>
                   <h2 className="text-4xl font-black text-white mb-2">Level Cleared!</h2>
                   <p className="text-slate-400 mb-8 max-w-md mx-auto">
                       You scored <span className="text-amber-400 font-bold">{score} XP</span> on this quiz. Keep pushing forward!
                   </p>

                   <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto w-full">
                       <button 
                         onClick={() => { setStarted(false); setFinished(false); setScore(0); setCurrentIdx(0); }}
                         className="flex-1 px-6 py-3 border border-slate-600 text-slate-300 hover:bg-slate-700 font-bold rounded-xl transition-colors shrink-0"
                       >
                         Play Again
                       </button>
                       <button 
                         onClick={() => navigate('/roadmap')}
                         className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl transition-colors shadow-sm shrink-0"
                       >
                         Back to Roadmap
                       </button>
                   </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}

// Temporary inline trophy icon fallback since it wasn't imported from lucide
function Trophy(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
}
