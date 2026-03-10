import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Mic,
    MicOff,
    Bot,
    Send,
    ArrowRight,
    RotateCcw,
    Loader2,
    CheckCircle,
    Lightbulb,
    ChevronLeft,
    Trophy
} from 'lucide-react';
import Sidebar from './Sidebar';
import { useAlert } from '../contexts/AlertContext';

interface LocationState {
    guideData: {
        guide: {
            question: string;
            answer: string;
            tip: string;
        }[];
        generalTips: string[];
    };
    role: string;
}

export default function RealTimeMockInterview() {
    const { showAlert } = useAlert();
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;

    const [currentIdx, setCurrentIdx] = useState(0);
    const [answerText, setAnswerText] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [feedback, setFeedback] = useState<{ score: number; text: string } | null>(null);
    
    // AI guidance
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [loadingInsight, setLoadingInsight] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!state?.guideData || !state?.guideData?.guide) {
            navigate('/interview-guide');
        }
    }, [state, navigate]);

    // Setup Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (finalTranscript) {
                    setAnswerText(prev => prev + " " + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                if (isRecording) {
                    // Try to restart if unintentionally stopped but we still think we're recording
                    // To avoid loop, we won't auto-restart, just update state
                    setIsRecording(false);
                }
            };
        }
    }, [isRecording]);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            showAlert("Speech recognition isn't supported in your browser.", "error");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            // clear text or append? Let's just append
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const fetchRealTimeHelp = async () => {
        if (!state?.guideData?.guide[currentIdx]) return;
        const currentQ = state.guideData.guide[currentIdx].question;
        
        setLoadingInsight(true);
        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `I am answering this interview question for a ${state.role} role: "${currentQ}". Give me a quick 2-sentence tip on what the interviewer wants to hear. Make it actionable.`,
                    role: state.role
                })
            });
            const data = await res.json();
            setAiInsight(data.reply);
        } catch (err) {
            console.error("Failed to fetch insight");
        } finally {
            setLoadingInsight(false);
        }
    };

    const submitAnswer = async () => {
        if (!answerText.trim()) return;
        
        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }

        setLoadingFeedback(true);
        try {
            const currentQ = state.guideData.guide[currentIdx];
            const res = await fetch('/api/ai/mock-interview-evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQ.question,
                    answer: answerText,
                    role: state.role,
                    expectedAnswer: currentQ.answer
                })
            });
            const data = await res.json();
            setFeedback({ score: data.score, text: data.feedback });
        } catch (error) {
            console.error("Failed to evaluate answer", error);
            showAlert("Failed to get feedback from AI.", "error");
        } finally {
            setLoadingFeedback(false);
        }
    };

    const handleTryAgain = () => {
        setFeedback(null);
        setAnswerText("");
        setAiInsight(null);
    };

    const handleNextQuestion = () => {
        if (currentIdx < state.guideData.guide.length - 1) {
            setCurrentIdx(prev => prev + 1);
            setFeedback(null);
            setAnswerText("");
            setAiInsight(null);
        } else {
            navigate('/interview-guide');
        }
    };

    if (!state?.guideData?.guide) return null;

    const currentQuestion = state.guideData.guide[currentIdx];
    const totalQuestions = state.guideData.guide.length;

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans">
            <Sidebar activePage="interview-guide" />
            
            <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/interview-guide')}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                Live Mock Interview
                            </h1>
                            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
                                Question {currentIdx + 1} of {totalQuestions}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-full hidden sm:flex">
                        <Bot className="w-4 h-4" /> AI Interviewer Active
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6">
                    {/* Left/Main Column - Question & Answer Area */}
                    <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
                        {/* Question Box */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>
                            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
                                "{currentQuestion.question}"
                            </h2>
                        </div>

                        {/* Answer Box */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-slate-700">Your Response</label>
                                {!feedback && (
                                    <button 
                                        onClick={toggleRecording}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            isRecording 
                                            ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
                                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                        {isRecording ? 'Stop Recording' : 'Use Voice'}
                                    </button>
                                )}
                            </div>

                            <textarea 
                                className="w-full flex-1 min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-[15px] font-medium text-slate-800 leading-relaxed resize-none"
                                placeholder={isRecording ? 'Listening...' : 'Type your answer here or use the microphone to dictate...'}
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                disabled={!!feedback || loadingFeedback}
                            />
                            
                            {!feedback ? (
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={submitAnswer}
                                        disabled={loadingFeedback || !answerText.trim()}
                                        className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-md shadow-teal-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingFeedback ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        {loadingFeedback ? 'Evaluating...' : 'Submit Answer'}
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8 border-t border-slate-100 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                        {/* Score Circle */}
                                        <div className="relative shrink-0 w-24 h-24 flex flex-col items-center justify-center rounded-full border-4 border-slate-100 shadow-inner bg-white">
                                            {/* We can color it based on score */}
                                            <svg className="absolute top-0 left-0 w-full h-full -rotate-90">
                                                <circle 
                                                    cx="44" 
                                                    cy="44" 
                                                    r="42" 
                                                    fill="none" 
                                                    stroke={feedback.score >= 80 ? '#10b981' : feedback.score >= 60 ? '#f59e0b' : '#ef4444'} 
                                                    strokeWidth="4" 
                                                    strokeDasharray="264" 
                                                    strokeDashoffset={264 - (264 * feedback.score) / 100} 
                                                    className="transition-all duration-1000 ease-out"
                                                    transform="translate(4,4)"
                                                />
                                            </svg>
                                            <span className="text-2xl font-black text-slate-800 relative z-10">{feedback.score}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase relative z-10">Score</span>
                                        </div>
                                        
                                        {/* Feedback Text */}
                                        <div className="flex-1 bg-slate-50 border border-slate-100 p-5 rounded-xl">
                                            <h3 className="flex items-center gap-2 text-sm font-black uppercase text-slate-700 mb-2 tracking-wider">
                                                <Trophy className="w-4 h-4 text-amber-500" /> Assessment Feedback
                                            </h3>
                                            <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
                                                {feedback.text}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button 
                                            onClick={handleTryAgain}
                                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2"
                                        >
                                            <RotateCcw className="w-4 h-4" /> Try Again
                                        </button>
                                        <button 
                                            onClick={handleNextQuestion}
                                            className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm shadow-md hover:bg-slate-900 transition-all flex items-center gap-2"
                                        >
                                            {currentIdx < totalQuestions - 1 ? 'Next Question' : 'Finish Interview'} 
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - AI Guide Sidebar */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4 max-w-4xl mx-auto lg:max-w-none">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden">
                            <Bot className="absolute -right-4 -bottom-4 w-24 h-24 text-indigo-500/10" />
                            <h3 className="font-black text-indigo-900 flex items-center gap-2 text-[13px] uppercase tracking-widest mb-3">
                                <Lightbulb className="w-4 h-4 text-amber-500" /> Interviewer Pro Tip
                            </h3>
                            <p className="text-sm font-medium text-indigo-800/80 leading-relaxed mb-4">
                                Need some guidance? I can give you a quick hint on what the interviewer is specifically looking for in this question.
                            </p>
                            {!aiInsight && !feedback ? (
                                <button 
                                    onClick={fetchRealTimeHelp}
                                    disabled={loadingInsight}
                                    className="w-full py-2 bg-white/60 hover:bg-white text-indigo-700 text-sm font-bold rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loadingInsight ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    {loadingInsight ? 'Thinking...' : 'Get a Hint'}
                                </button>
                            ) : aiInsight ? (
                                <div className="bg-white/80 border border-indigo-100 p-4 rounded-xl text-sm font-medium text-indigo-900 leading-relaxed shadow-sm">
                                    {aiInsight}
                                </div>
                            ) : null}
                        </div>
                        
                        {/* Static Tip Section based on the guideData */}
                        {feedback && (
                            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                                <h3 className="font-black text-emerald-900 flex items-center gap-2 text-[13px] uppercase tracking-widest mb-3">
                                    <Trophy className="w-4 h-4 text-emerald-500" /> Ideal Answer Strategy
                                </h3>
                                <div className="text-sm font-medium text-emerald-800 leading-relaxed space-y-4">
                                    <p>{currentQuestion.answer}</p>
                                    <div className="bg-emerald-100/50 p-3 rounded-lg border border-emerald-200">
                                        <span className="font-bold">Standout Tip:</span> {currentQuestion.tip}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
