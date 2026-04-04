'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import Cookies from 'js-cookie';
import { useAuth } from '@/context/AuthContext';

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
        // Revive Date objects
        const revived = parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(revived);
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
          message: 'Hi Willow, how am I doing?',
          student_name: user?.name || undefined,
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
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 shadow-lg flex items-center justify-center z-50"
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-gray-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  W
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">Willow</h3>
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-gray-400 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 mt-20">
                  <p className="text-sm">Start a conversation with Willow</p>
                  <p className="text-xs mt-1">Your AI wellness companion</p>
                </div>
              )}

              {messages.map((message) => (
                <ChatMessage key={message.id} {...message} />
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-900 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-700"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputValue.trim()}
                  className="w-10 h-10 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
