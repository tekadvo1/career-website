import { useState, useEffect } from 'react';
import { BrainCircuit, Trophy, X } from 'lucide-react';

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

interface QuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    phaseName: string;
    topics: string[];
    role: string;
}

export default function QuizModal({ isOpen, onClose, phaseName, topics, role }: QuizModalProps) {
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
    const [quizScore, setQuizScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
    const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

    // Initial Fetch
    useEffect(() => {
        if (isOpen) {
            generateQuiz();
        } else {
            // Reset state on close
            setQuizQuestions([]);
            setQuizFinished(false);
            setQuizScore(0);
            setCurrentQuizQuestion(0);
            setQuizFeedback(null);
            setSelectedQuizAnswer(null);
        }
    }, [isOpen]);

    const generateQuiz = async () => {
        setQuizLoading(true);
        try {
            const response = await fetch('/api/ai/chat', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: "system",
                    message: `Generate 3 multiple choice quiz questions for the topic "${phaseName}". 
                    Return strictly valid JSON array of objects with keys: id (number), question (string), options (array of 4 strings), correctAnswer (index number 0-3), explanation (string).`,
                    context: `Role: ${role}, Topics: ${topics.join(', ')}`
                })
            });
            
            const data = await response.json();
            const jsonMatch = data.reply.match(/```json\n([\s\S]*?)\n```/) || data.reply.match(/```\n([\s\S]*?)\n```/);
            let parsedQuestions = [];
            
            if (jsonMatch) {
                parsedQuestions = JSON.parse(jsonMatch[1]);
            } else {
                try {
                   parsedQuestions = JSON.parse(data.reply);
                } catch (e) {
                   // Fallback Content
                   parsedQuestions = [
                       {
                           id: 1, 
                           question: `What is a core concept of ${phaseName}?`, 
                           options: ["Concept A", "Concept B", "Concept C", "Concept D"], 
                           correctAnswer: 0, 
                           explanation: "Concept A is fundamental."
                       },
                       {
                          id: 2, 
                          question: "Which tool is commonly used in this phase?", 
                          options: ["Tool X", "Tool Y", "Tool Z", "None"], 
                          correctAnswer: 1, 
                          explanation: "Tool Y is standard."
                      }
                   ];
                }
            }
            setQuizQuestions(parsedQuestions);

        } catch (error) {
              console.error("Quiz generation failed", error);
              setQuizQuestions([
                  {
                      id: 1, 
                      question: "Quiz generation failed. Please try again?", 
                      options: ["OK"], 
                      correctAnswer: 0, 
                      explanation: "Error."
                  }
              ]);
        } finally {
            setQuizLoading(false);
        }
    };

    const handleQuizAnswer = (optionIndex: number) => {
        setSelectedQuizAnswer(optionIndex);
        const correct = quizQuestions[currentQuizQuestion].correctAnswer === optionIndex;
        if (correct) {
            setQuizFeedback("Correct! 🎉");
            setQuizScore(prev => prev + 1);
        } else {
            setQuizFeedback(`Incorrect. The right answer was: ${quizQuestions[currentQuizQuestion].options[quizQuestions[currentQuizQuestion].correctAnswer]}`);
        }

        setTimeout(() => {
            if (currentQuizQuestion < quizQuestions.length - 1) {
                setCurrentQuizQuestion(prev => prev + 1);
                setSelectedQuizAnswer(null);
                setQuizFeedback(null);
            } else {
                setQuizFinished(true);
            }
        }, 2500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="w-6 h-6" />
                        <h2 className="text-xl font-bold">Quick Verification Quiz</h2>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-8">
                    {quizLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-gray-500">Generating questions for this phase...</p>
                        </div>
                    ) : quizFinished ? (
                            <div className="text-center py-8">
                            <div className="inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                                <Trophy className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                            <p className="text-lg text-gray-600 mb-6">
                                You scored <span className="font-bold text-indigo-600">{quizScore} / {quizQuestions.length}</span>
                            </p>
                            <button 
                                onClick={onClose}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                            >
                                Return to Roadmap
                            </button>
                            </div>
                    ) : (
                        <div>
                            <div className="mb-6 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Question {currentQuizQuestion + 1} of {quizQuestions.length}</span>
                                <span className="text-sm font-bold text-indigo-600">Score: {quizScore}</span>
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                {quizQuestions[currentQuizQuestion]?.question}
                            </h3>

                            <div className="grid gap-3 mb-6">
                                {quizQuestions[currentQuizQuestion]?.options.map((option: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuizAnswer(idx)}
                                        disabled={selectedQuizAnswer !== null}
                                        className={`p-4 rounded-lg border-2 text-left transition-all font-medium ${
                                            selectedQuizAnswer === null 
                                            ? 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50' 
                                            : selectedQuizAnswer === idx 
                                                ? (idx === quizQuestions[currentQuizQuestion].correctAnswer ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800')
                                                : (idx === quizQuestions[currentQuizQuestion].correctAnswer ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-100 opacity-50')
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                                                    selectedQuizAnswer === idx ? 'border-current' : 'border-gray-300'
                                            }`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            {option}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {quizFeedback && (
                                <div className={`p-4 rounded-lg animate-in slide-in-from-top-2 ${
                                    quizFeedback.includes('Correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    <p className="font-bold">{quizFeedback}</p>
                                    {!quizFeedback.includes('Correct') && (
                                        <p className="text-sm mt-1">{quizQuestions[currentQuizQuestion].explanation}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
