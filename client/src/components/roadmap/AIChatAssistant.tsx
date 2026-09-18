import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../utils/apiFetch';
import { 
    Bot, X, Sparkles, Plus, History, Loader2, 
    Zap, Copy, Check, SendHorizontal, Maximize2, Minimize2, ArrowRight,
    Pencil, Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    updatedAt: string;
    topicId?: string;
    topicName?: string;
}

interface AIChatAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    context: any;
    role: string;
    aiLayout?: 'hidden'|'normal'|'maximized';
    setAiLayout?: (layout: 'hidden'|'normal'|'maximized') => void;
}

export default function AIChatAssistant({ isOpen, onClose, context, role, aiLayout, setAiLayout }: AIChatAssistantProps) {
    const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [chatLoadingState, setChatLoadingState] = useState<'idle'|'loading'|'success'|'error'>('idle');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editSessionTitle, setEditSessionTitle] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const user = React.useMemo(() => {
        const u = sessionStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Load Chat History
    useEffect(() => {
        if (!isOpen || !user || !context?.topicName) return;
        if (chatLoadingState === 'loading' || chatLoadingState === 'success') return;

        const loadHistory = async () => {
            setChatLoadingState('loading');
            try {
                const queryParams = new URLSearchParams({
                    userId: user.id.toString(),
                    role: role || 'Software Engineer'
                });
                
                if (context.topicId) {
                    queryParams.append('topicId', context.topicId.toString());
                } else if (context.topicName) {
                    // Fallback to topic name if no id, but ideally we use topicId
                    queryParams.append('topicId', context.topicName); // Hack: Since we fallback to topic_id match, we can just pass name as topicId if needed. But it's better to rely on topic_id if possible.
                }
                
                const res = await apiFetch(`/api/ai/chat-sessions?${queryParams.toString()}`);
                const data = await res.json();
                
                if (data.success) {
                    const loadedHistory: ChatSession[] = data.sessions ? data.sessions.map((s: any) => ({ ...s, messages: [], updatedAt: s.updated_at })) : [];
                    // Filter history manually by topicName if the backend didn't use topicId
                    const filtered = context.topicId ? loadedHistory : loadedHistory.filter(s => s.topicName === context.topicName);
                    
                    setChatHistory(filtered);
                    
                    if (filtered.length > 0) {
                        const mostRecent = filtered[0];
                        setActiveSessionId(mostRecent.id);
                        
                        // Fetch messages
                        const msgRes = await apiFetch(`/api/ai/chat-sessions/${mostRecent.id}/messages`);
                        const msgData = await msgRes.json();
                        if (msgData.success && msgData.messages) {
                            const msgs = msgData.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp).toISOString() }));
                            mostRecent.messages = msgs;
                            setMessages(msgs);
                        } else {
                            setMessages([]);
                        }
                    } else {
                        startNewChat();
                    }
                    setChatLoadingState('success');
                } else {
                    setChatLoadingState('error');
                }
            } catch (err) {
                console.error("Failed to load chat history", err);
                setChatLoadingState('error');
            }
        };

        loadHistory();
    }, [isOpen, user, context, role, chatLoadingState]);

    // Reset state on topic switch
    useEffect(() => {
        setChatLoadingState('idle');
    }, [context?.topicId, context?.topicName]);

    const startNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
        setIsHistoryVisible(false);
    };

    const syncChatHistoryToDB = async () => {
        // Sync is handled by the backend automatically when sending messages
    };

    const handleSwitchSession = async (sessionId: string) => {
        const session = chatHistory.find(s => s.id === sessionId);
        if (session) {
            setActiveSessionId(sessionId);
            
            // Load messages if empty
            if (!session.messages || session.messages.length === 0) {
                try {
                    const msgRes = await apiFetch(`/api/ai/chat-sessions/${sessionId}/messages`);
                    const msgData = await msgRes.json();
                    if (msgData.success && msgData.messages) {
                        const msgs = msgData.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp).toISOString() }));
                        setChatHistory(prev => prev.map(c => c.id === sessionId ? { ...c, messages: msgs } : c));
                        setMessages(msgs);
                    }
                } catch (e) {
                    console.error("Failed to load messages", e);
                }
            } else {
                setMessages(session.messages);
            }
            setIsHistoryVisible(false);
        }
    };

    const handleRenameSession = async (sessionId: string) => {
        if (!editSessionTitle.trim() || !user) {
            setEditingSessionId(null);
            return;
        }
        
        const updatedHistory = chatHistory.map(s => s.id === sessionId ? { ...s, title: editSessionTitle } : s);
        setChatHistory(updatedHistory);
        setEditingSessionId(null);
        
        try {
            await apiFetch(`/api/ai/chat-sessions/${sessionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editSessionTitle })
            });
        } catch (err) {
            console.error("Failed to rename session", err);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!user) return;
        
        const updatedHistory = chatHistory.filter(s => s.id !== sessionId);
        setChatHistory(updatedHistory);
        
        if (activeSessionId === sessionId) {
            startNewChat();
        }
        
        try {
            await apiFetch(`/api/ai/chat-sessions/${sessionId}`, {
                method: 'DELETE'
            });
        } catch (err) {
            console.error("Failed to delete session", err);
        }
    };

    const handleSendMessage = async (customMessage?: string) => {
        const msgToSend = customMessage || inputMessage;
        if (!msgToSend.trim() || !user) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(), role: "user", content: msgToSend, timestamp: new Date().toISOString(),
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        if (!customMessage) setInputMessage("");
        setIsTyping(true);

        const sessionIdToUse = activeSessionId || `session_${Date.now()}`;
        if (!activeSessionId) setActiveSessionId(sessionIdToUse);

        syncChatHistoryToDB();

        try {
            const res = await apiFetch(`/api/ai/chat-sessions/${sessionIdToUse}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msgToSend,
                    context: {
                        ...context,
                        type: 'roadmap',
                    },
                    role: role || 'Software Engineer',
                    stream: true,
                    conversationHistory: newMessages.map(m => ({ role: m.role, content: m.content }))
                })
            });
            
            if (!res.body) throw new Error("No body");
            
            const aiMessageId = (Date.now() + 1).toString();
            let aiContent = "";
            
            setMessages(prev => [...prev, {
                id: aiMessageId, role: "assistant" as const, content: "", timestamp: new Date().toISOString()
            }]);
            
            setIsTyping(false);
            
            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                        try {
                            const data = JSON.parse(line.slice(5));
                            if (data.content) {
                                aiContent += data.content;
                                setMessages(prev => prev.map(m => 
                                    m.id === aiMessageId ? { ...m, content: aiContent } : m
                                ));
                            }
                        } catch (e) {
                            console.error("Error parsing stream chunk", e);
                        }
                    }
                }
            }
            

            syncChatHistoryToDB();

        } catch (error) {
            console.error("Chat error:", error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now().toString(), role: "assistant" as const, content: "Sorry, I'm having trouble connecting right now. Please try again.", timestamp: new Date().toISOString()
            }]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
                        <Bot className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm leading-tight">AI Tutor</h3>
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">{context?.topicName || 'Roadmap'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setIsHistoryVisible(!isHistoryVisible)} 
                        className={`p-1.5 rounded-md transition-colors ${isHistoryVisible ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                        title="Chat History"
                    >
                        <History className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={startNewChat} 
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                        title="New Chat"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                    {setAiLayout && (
                        <button 
                            onClick={() => setAiLayout(aiLayout === 'maximized' ? 'normal' : 'maximized')} 
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors hidden sm:block"
                            title={aiLayout === 'maximized' ? "Restore" : "Maximize"}
                        >
                            {aiLayout === 'maximized' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    )}
                    <button 
                        onClick={onClose} 
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                        title="Close Tutor"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* History Panel Overlay */}
            {isHistoryVisible && (
                <div className="absolute inset-0 top-[57px] bg-white z-20 overflow-y-auto border-r border-slate-200 shadow-xl">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h4 className="font-bold text-slate-700 text-sm">Conversation History</h4>
                        <button onClick={() => setIsHistoryVisible(false)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="p-2 space-y-1">
                        {chatHistory.length > 0 ? chatHistory.map(session => (
                            <div 
                                key={session.id}
                                className={`w-full text-left p-3 rounded-lg transition-colors text-sm group relative ${activeSessionId === session.id ? 'bg-emerald-50 border border-emerald-100 text-emerald-800 font-medium' : 'hover:bg-slate-50 text-slate-600 border border-transparent'}`}
                            >
                                {editingSessionId === session.id ? (
                                    <input 
                                        type="text" 
                                        value={editSessionTitle}
                                        onChange={(e) => setEditSessionTitle(e.target.value)}
                                        onBlur={() => handleRenameSession(session.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleRenameSession(session.id);
                                            if (e.key === 'Escape') setEditingSessionId(null);
                                        }}
                                        className="w-full text-sm p-1 border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                                        autoFocus
                                    />
                                ) : (
                                    <div 
                                        className="truncate mb-1 pr-16 cursor-pointer font-medium"
                                          onClick={() => handleSwitchSession(session.id)}
                                    >
                                        {session.title}
                                    </div>
                                )}
                                <div className="text-[10px] text-slate-400 font-normal">{new Date(session.updatedAt).toLocaleString()}</div>
                                
                                {editingSessionId !== session.id && (
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setEditSessionTitle(session.title || ''); setEditingSessionId(session.id); }} 
                                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" 
                                            title="Rename"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }} 
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" 
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="p-4 text-center text-slate-500 text-sm">No previous conversations for this topic.</div>
                        )}
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                {chatLoadingState === 'loading' ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
                        <p className="text-xs font-medium">Loading session...</p>
                    </div>
                ) : chatLoadingState === 'error' ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Zap className="w-8 h-8 text-rose-500 mb-2 opacity-50" />
                        <p className="text-sm mb-4">Failed to load chat history.</p>
                        <button onClick={() => setChatLoadingState('idle')} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors">Retry</button>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col justify-center pb-10">
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-center">
                            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h4 className="font-bold text-slate-800 text-base mb-2">Need help with {context?.topicName}?</h4>
                            <p className="text-sm text-slate-500 mb-5">Your AI Tutor is ready to explain concepts, provide examples, or unblock you.</p>
                            
                            <div className="flex flex-col gap-2">
                                <button onClick={() => handleSendMessage("Can you explain this topic simply?")} className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-between group">
                                    Explain this simply
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                </button>
                                <button onClick={() => handleSendMessage("Can you give me a practical example of this?")} className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-between group">
                                    Give a practical example
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                </button>
                                <button onClick={() => handleSendMessage("I'm stuck on an exercise for this topic. Can I get a hint?")} className="text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-between group">
                                    I need a hint for an exercise
                                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((message) => (
                            <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                {message.role === "assistant" && (
                                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm mt-1">
                                        <Bot className="w-4 h-4 text-emerald-600" />
                                    </div>
                                )}
                                <div className={`flex flex-col max-w-[88%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                                    <div className={`rounded-2xl p-4 text-[14px] leading-relaxed ${
                                        message.role === "assistant"
                                            ? "bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm"
                                            : "bg-emerald-600 text-white rounded-tr-sm shadow-sm"
                                    }`}>
                                        {message.role === "assistant" ? (
                                            <div className="prose prose-sm max-w-none prose-emerald prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-headings:font-bold prose-headings:text-slate-800 prose-a:text-emerald-600 prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                                                <ReactMarkdown
                                                    components={{
                                                        code({node, inline, className, children, ...props}: any) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            const codeString = String(children).replace(/\n$/, '');
                                                            
                                                            if (!inline && match) {
                                                                return (
                                                                    <div className="relative group mt-3 mb-4 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                                                                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 border-b border-slate-700">
                                                                            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{match[1]}</span>
                                                                            <button 
                                                                                onClick={() => {
                                                                                    navigator.clipboard.writeText(codeString);
                                                                                    setCopiedCode(codeString);
                                                                                    setTimeout(() => setCopiedCode(null), 2000);
                                                                                }}
                                                                                className="p-1.5 hover:bg-slate-700 rounded transition-colors"
                                                                                title="Copy code"
                                                                            >
                                                                                {copiedCode === codeString ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />}
                                                                            </button>
                                                                        </div>
                                                                        <div className="p-3 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-50">
                                                                            <code>{children}</code>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            }
                                                            return <code className={className} {...props}>{children}</code>;
                                                        }
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap">{message.content}</div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 shadow-sm mt-1">
                                    <Bot className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
                <div className="relative flex items-end shadow-sm border border-slate-300 rounded-xl bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Ask your AI Tutor..."
                        className="w-full max-h-32 min-h-[50px] p-3 pr-12 bg-transparent border-none focus:ring-0 resize-none text-sm text-slate-800 placeholder-slate-400"
                        rows={1}
                        style={{ height: inputMessage ? 'auto' : '50px' }}
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputMessage.trim() || isTyping}
                        className="absolute right-2 bottom-2 p-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg transition-colors"
                    >
                        <SendHorizontal className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-slate-400">Do not include passwords, tokens, or sensitive data.</span>
                </div>
            </div>
        </div>
    );
}
