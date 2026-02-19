import { useState, useEffect } from 'react';
import { Bot, X, Sparkles, MessageSquare } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    context: any;
    role: string;
    initialQuery?: string;
}

export default function AIChatAssistant({ isOpen, onClose, context, role, isEmbedded = false, initialQuery }: AIChatAssistantProps & { isEmbedded?: boolean }) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [hasSentInitial, setHasSentInitial] = useState(false);

    // Initial greeting or query handling
    useEffect(() => {
        if (isOpen && context && !hasSentInitial) {
            if (initialQuery) {
                handleSendChat(initialQuery);
                setHasSentInitial(true);
            } else if (chatMessages.length === 0) {
                 setChatMessages([
                    { id: '1', role: 'assistant', content: `Hi! I see you have a question about: "${context.currentTask || 'this project'}".\n\nHow can I help you understand this better?` }
                ]);
            }
        }
    }, [context, isOpen, initialQuery, hasSentInitial]);

    const handleSendChat = async (manualMessage?: string) => {
        const messageToSend = manualMessage || chatInput;
        if (!messageToSend.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: messageToSend };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    context: context,
                    role: role
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setChatMessages(prev => [...prev, {
                    id: (Date.now()+1).toString(),
                    role: 'assistant',
                    content: data.reply
                }]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setChatMessages(prev => [...prev, {
                id: (Date.now()+1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again."
            }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    if (!isOpen && !isEmbedded) return null;

    if (isEmbedded) {
        return (
            <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
                <div className="p-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="bg-indigo-500/10 p-1.5 rounded-lg">
                            <Bot className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-white">AI Copilot</h3>
                            <p className="text-[10px] text-gray-500">Context-aware assistant</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
                        {context && (
                            <div className="bg-indigo-900/20 border border-indigo-500/20 p-3 rounded-lg text-xs text-indigo-300 mb-4 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-indigo-400" />
                                <div className="space-y-1">
                                    <p className="font-bold text-indigo-200">Current Scope:</p>
                                    <p className="opacity-80 line-clamp-2">{context.currentTask || context}</p>
                                </div>
                            </div>
                        )}

                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                             <div className="flex justify-start">
                                <div className="bg-gray-800 border border-gray-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                </div>

                <div className="p-3 border-t border-gray-800 bg-gray-900">
                    <div className="flex gap-2 items-center bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 transition-all">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                            placeholder="Ask Copilot..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-200 placeholder:text-gray-500"
                        />
                        <button 
                            onClick={() => handleSendChat()}
                            disabled={!chatInput.trim()}
                            className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] h-[600px] animate-in zoom-in-95 duration-200">
                <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">AI Learning Assistant</h3>
                            <p className="text-xs text-indigo-100 opacity-90">Here to help with your roadmap</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                        {context && (
                            <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-xs text-indigo-800 mb-2 flex items-start gap-2">
                                <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                <p className="line-clamp-2"><strong>Context:</strong> {context}</p>
                            </div>
                        )}

                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                                </div>
                            </div>
                        )}
                </div>

                <div className="p-3 bg-white border-t border-gray-100">
                    <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                            placeholder="Type your question..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder:text-gray-400"
                            autoFocus
                        />
                        <button 
                            onClick={() => handleSendChat()}
                            disabled={!chatInput.trim()}
                            className="p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        AI creates content. Check important info.
                    </p>
                </div>
            </div>
        </div>
    );
}
