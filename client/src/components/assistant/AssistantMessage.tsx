import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, User, Sparkles } from 'lucide-react';
import type { Message } from './types';

interface AssistantMessageProps {
  message: Message;
}

export default function AssistantMessage({ message }: AssistantMessageProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    });
  };

  return (
    <div className={`py-6 px-4 md:px-8 ${message.type === 'assistant' ? 'bg-slate-50' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto flex gap-4 md:gap-6">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          {message.type === 'assistant' ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center shadow-sm">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-slate-900 text-sm">
              {message.type === 'assistant' ? 'AI Assistant' : 'You'}
            </span>
            {message.type === 'assistant' && (
              <button
                onClick={handleCopyMessage}
                className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded p-1"
                aria-label="Copy answer"
                title="Copy answer"
              >
                {copiedMessage ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="prose prose-slate prose-sm md:prose-base max-w-none break-words">
            <ReactMarkdown
              components={{
                a: ({ node, href, children, ...props }) => {
                  const safeHref = href?.startsWith('javascript:') ? '#' : href;
                  return (
                    <a href={safeHref} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline" {...props}>
                      {children}
                    </a>
                  );
                },
                img: ({ node, src, alt }) => {
                  const safeSrc = src?.startsWith('javascript:') ? '' : src;
                  return (
                    <a href={safeSrc} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 underline" title="View external image">
                      [Image: {alt || 'External resource'}]
                    </a>
                  );
                },
                table: ({ node, children, ...props }) => (
                  <div className="overflow-x-auto my-4 rounded-lg border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ node, children, ...props }) => (
                  <th className="bg-slate-50 px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider" {...props}>
                    {children}
                  </th>
                ),
                td: ({ node, children, ...props }) => (
                  <td className="px-4 py-2 text-sm text-slate-700 border-t border-slate-200" {...props}>
                    {children}
                  </td>
                ),
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const isBlock = !inline && match;
                  
                  if (!isBlock) {
                    return (
                      <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono break-words" {...props}>
                        {children}
                      </code>
                    );
                  }

                  const codeContent = String(children).replace(/\n$/, '');
                  const isCopied = copiedCode === codeContent;

                  return (
                    <div className="relative my-4 rounded-lg bg-slate-900 overflow-hidden shadow-sm">
                      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-300 text-xs">
                        <span className="font-mono uppercase">{language || 'code'}</span>
                        <button
                          onClick={() => handleCopyCode(codeContent)}
                          className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400 rounded px-1"
                          aria-label="Copy code"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="overflow-x-auto p-4 scrollbar-thin scrollbar-thumb-slate-700">
                        <pre className="text-sm font-mono text-slate-50 m-0" style={{ whiteSpace: 'pre' }}>
                          <code {...props}>{children}</code>
                        </pre>
                      </div>
                    </div>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {message.status === 'failed' && (
            <div className="mt-2 text-xs text-red-500 font-medium flex items-center gap-1">
              Message failed to send. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
