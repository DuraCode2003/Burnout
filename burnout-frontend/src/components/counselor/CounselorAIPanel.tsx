'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import Cookies from 'js-cookie';

interface CounselorAIPanelProps {
  alertId: string;
}

interface SummaryData {
  alert_id: string;
  summary: string;
  generated_at: string;
  cached: boolean;
}

export function CounselorAIPanel({ alertId }: CounselorAIPanelProps) {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpHistory, setFollowUpHistory] = useState<{ role: string; content: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);

  const summaryEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSummary();
  }, [alertId]);

  const loadSummary = async () => {
    setIsLoading(true);
    setSummary('');

    try {
      // First try to get cached summary
      const cachedResponse = await fetch(`http://localhost:8001/ai/counselor/summary/${alertId}/cached`, {
        headers: {
          Authorization: `Bearer ${Cookies.get('auth_token') || localStorage.getItem('auth_token')}`,
        },
      });

      if (cachedResponse.ok) {
        const data: SummaryData = await cachedResponse.json();
        setSummary(data.summary);
        setIsLoading(false);
        return;
      }

      // If not cached, generate new summary via streaming
      const response = await fetch(`http://localhost:8001/ai/counselor/summary/${alertId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token') || localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          alert_id: alertId,
          user_id: 'placeholder', // Would get from alert data
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullSummary = '';
      setIsStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(5));

            if (data.type === 'chunk' || data.type === 'cached') {
              fullSummary += data.content;
              setSummary(fullSummary);
            } else if (data.type === 'done') {
              setIsStreaming(false);
            } else if (data.type === 'error') {
              setSummary((prev) => prev + `\n\n*Error: ${data.message}*`);
              setIsStreaming(false);
            }
          } catch (e) {
            // Skip malformed chunks
          }
        }

        // Auto-scroll during streaming
        summaryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Summary error:', error);
      setSummary('*Unable to generate summary. Please refresh or try again later.*');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const askFollowUp = async () => {
    if (!followUpQuestion.trim() || isAsking) return;

    const question = followUpQuestion.trim();
    setFollowUpQuestion('');
    setIsAsking(true);

    // Add question to history
    setFollowUpHistory((prev) => [...prev, { role: 'user', content: question }]);

    try {
      const response = await fetch('http://localhost:8001/ai/counselor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get('auth_token') || localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          message: question,
          alert_id: alertId,
        }),
      });

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(5));

            if (data.type === 'chunk') {
              answer += data.content;
              setFollowUpHistory((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return [...prev.slice(0, -1), { role: 'assistant', content: answer }];
                }
                return [...prev, { role: 'assistant', content: answer }];
              });
            }
          } catch (e) {
            // Skip malformed chunks
          }
        }

        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Follow-up error:', error);
      setFollowUpHistory((prev) => [
        ...prev,
        { role: 'assistant', content: '*Unable to answer. Please try again.*' },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askFollowUp();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3 border-b border-gray-800 flex items-center space-x-2">
        <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3 className="text-white font-medium">AI Clinical Summary</h3>
        {isStreaming && (
          <span className="text-xs text-teal-500 ml-2 animate-pulse">Generating...</span>
        )}
      </div>

      {/* Summary Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="flex space-x-1">
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-teal-500 rounded-full"
              />
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-teal-500 rounded-full"
              />
              <motion.span
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-teal-500 rounded-full"
              />
            </div>
            <span className="text-sm">Generating clinical summary...</span>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{summary}</ReactMarkdown>
            <div ref={summaryEndRef} />
          </div>
        )}
      </div>

      {/* Follow-up Chat */}
      <div className="border-t border-gray-800 p-4 bg-gray-800/50">
        <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
          {followUpHistory.map((msg, idx) => (
            <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div
                className={`inline-block px-3 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={followUpQuestion}
            onChange={(e) => setFollowUpQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a follow-up question..."
            disabled={isAsking || isLoading}
            className="flex-1 bg-gray-900 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 border border-gray-700"
          />
          <button
            onClick={askFollowUp}
            disabled={isAsking || !followUpQuestion.trim() || isLoading}
            className="w-9 h-9 rounded-lg bg-gradient-to-r from-teal-500 to-indigo-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}
