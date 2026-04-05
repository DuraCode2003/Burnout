'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import lumaLogoSrc from '@/assets/luma-logo.png';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, timestamp, isStreaming }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 150 }}
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] group relative ${
          isUser
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl rounded-tr-sm shadow-lg shadow-indigo-500/10 px-5 py-4'
            : 'bg-white/[0.03] text-white rounded-2xl rounded-tl-sm border border-white/5 px-5 py-4 backdrop-blur-sm'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lumaLogoSrc.src} alt="Luma" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">Luma.AI</span>
          </div>
        )}

        <div className={`text-[13px] leading-relaxed font-medium ${isUser ? 'text-white' : 'text-text-primary'}`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-black text-white">{children}</strong>,
              em: ({ children }) => <em className="italic opacity-80">{children}</em>,
              code: ({ children }) => <code className="bg-black/20 rounded px-1.5 py-0.5 font-mono text-[11px]">{children}</code>,
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block w-1.5 h-3 bg-teal-400 ml-1 align-middle rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]"
            />
          )}
        </div>

        <div
          className={`text-[9px] mt-4 font-black uppercase tracking-tighter ${
            isUser ? 'text-white/40' : 'text-text-secondary/30'
          } flex items-center justify-between pointer-events-none`}
        >
          <span>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isUser && !isStreaming && (
            <span className="text-white/60">✓ Sync.OK</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
