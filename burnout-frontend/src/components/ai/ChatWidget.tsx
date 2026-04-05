'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';
import lumaLogoSrc from '@/assets/luma-logo.png';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Hydrate state from localStorage on mount explicitly to avoid SSR hydration mismatches
    const cachedSession = localStorage.getItem('ai_session_id');
    const cachedMessages = localStorage.getItem('ai_messages');
    
    if (cachedSession) setSessionId(cachedSession);
    if (cachedMessages) {
      try {
        const parsed = JSON.parse(cachedMessages);
        // Detect and clear "Duranka" hallucination or wrong user data
        const hasWrongName = parsed.some((m: any) => 
          m.role === 'assistant' && m.content.includes('Duranka')
        );
        
        if (hasWrongName) {
          localStorage.removeItem('ai_session_id');
          localStorage.removeItem('ai_messages');
          setMessages([]);
          setSessionId(null);
        } else {
          // Revive Date objects
          const revived = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
          setMessages(revived);
        }
      } catch (e) {
         // ignore
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      if (sessionId) localStorage.setItem('ai_session_id', sessionId);
      localStorage.setItem('ai_messages', JSON.stringify(messages));
    }
  }, [messages, sessionId, isInitialized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const startChat = async () => {
    setIsOpen(true);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8001/ai/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token') || localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          message: 'Hi Luma, how am I doing today?',
          student_name: user?.name || 'Student',
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(5));
            
            if (data.type === 'chunk') {
              assistantMessage.content += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m
                )
              );
            } else if (data.type === 'done' || data.type === 'cached') {
              assistantMessage.isStreaming = false;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
                )
              );
              if (data.session_id) {
                setSessionId(data.session_id);
              }
            }
          } catch (e) {
            // Skip malformed chunks
          }
        }
      }

      setIsLoading(false);
      setIsTyping(false);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
          isStreaming: false,
        },
      ]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Add user message optimistically
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8001/ai/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token') || localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          message: content.trim(),
          session_id: sessionId || messages[0]?.id || Date.now().toString(),
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(5));

            if (data.type === 'chunk') {
              assistantMessage.content += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: assistantMessage.content } : m
                )
              );
            } else if (data.type === 'done' || data.type === 'cached') {
              assistantMessage.isStreaming = false;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? { ...m, isStreaming: false } : m
                )
              );
              if (data.session_id) {
                setSessionId(data.session_id);
              }
            }
          } catch (e) {
            // Skip malformed chunks
          }
        }
      }

      setIsLoading(false);
      setIsTyping(false);
    } catch (error) {
      console.error('Send message error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again.",
          timestamp: new Date(),
          isStreaming: false,
        },
      ]);
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if (sessionId || messages.length > 0) {
      sendMessage(inputValue);
    } else {
      startChat().then(() => sendMessage(inputValue));
    }
  };

  const resetChat = () => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem('ai_session_id');
    localStorage.removeItem('ai_messages');
    if (isOpen) {
      startChat();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, shadow: "0 0 0px rgba(99, 102, 241, 0)" }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, shadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            setIsOpen(true);
            if (messages.length === 0) {
              startChat();
            }
          }
        }}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-2xl flex items-center justify-center z-[110] border border-white/20 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {isOpen ? (
          <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </motion.div>
          </div>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-28 right-8 w-[400px] h-[600px] bg-bg-card/40 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_80px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-[100] border border-white/10"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg shadow-teal-500/20 border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lumaLogoSrc.src} alt="Luma" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-white font-black font-sora text-base tracking-tight leading-tight">Luma</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]"></span>
                    <span className="text-text-secondary/60 text-[10px] font-bold uppercase tracking-widest">Core.System_Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={resetChat}
                  title="Reset Conversation"
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <motion.div 
                  className="h-full flex flex-col items-center justify-center text-center opacity-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                >
                  <div className="w-20 h-20 mb-6 bg-white/[0.02] rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold font-sora tracking-wide">System Initialization...</p>
                  <p className="text-[10px] mt-1 uppercase tracking-[0.2em] font-black text-text-secondary/60">Awaiting your query</p>
                </motion.div>
              )}

              {messages.map((message) => (
                <ChatMessage key={message.id} {...message} />
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white/[0.02]">
              <div className="flex items-center space-x-3 bg-white/[0.03] p-2 rounded-[24px] border border-white/5 focus-within:border-indigo-500/30 focus-within:bg-white/[0.05] transition-all duration-300">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Luma something..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white placeholder-text-secondary/50 rounded-2xl px-4 py-2 text-sm focus:outline-none"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isLoading || !inputValue.trim() 
                      ? 'bg-white/5 text-text-secondary/30' 
                      : 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40'
                  }`}
                >
                  <svg className="w-5 h-5 rotate-45 -translate-y-0.5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </motion.button>
              </div>
              <p className="text-[10px] text-center mt-4 text-text-secondary/40 font-bold uppercase tracking-[0.2em] pointer-events-none">Luma AI — Your Wellbeing Guide</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
