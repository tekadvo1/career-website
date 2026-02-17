import React, { useState, useEffect } from 'react';
import { Bot, X, Sparkles, MessageSquare } from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    context: string;
    role: string;
}

export default function AIChatAssistant({ isOpen, onClose, context, role }: AIChatAssistantProps) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);

    // Context changes
    useEffect(() => {
        if (isOpen && context) {
            setChatMessages([
                { id: '1', role: 'assistant', content: `Hi! I see you have a question about: "${context}".\n\nHow can I help you understand this better?` }
            ]);
        }
    }, [context, isOpen]);

    const handleSendChat = async () => {
        if (!chatInput.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput };
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

    if (!isOpen) return null;

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
                            onClick={handleSendChat}
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
