"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Send, 
  User, 
  ShieldCheck, 
  Lock, 
  MoreVertical,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useSupportChat } from "@/hooks/useSupportChat";
import { supportService } from "@/services/supportService";
import toast from "react-hot-toast";

interface StudentChatPaneProps {
  sessionId: string;
  isAnonymous: boolean;
  onClose: () => void;
  onIdentityRevealed: () => void;
}

export function StudentChatPane({ sessionId, isAnonymous, onClose, onIdentityRevealed }: StudentChatPaneProps) {
  const { messages, isConnected, sendMessage } = useSupportChat(sessionId);
  const [inputText, setInputText] = useState("");
  const [isRevealing, setIsRevealing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText.trim());
    setInputText("");
  };

  const handleRevealIdentity = async () => {
    if (confirm("Revealing your identity will share your name and department with the counselor. This cannot be undone. Proceed?")) {
      setIsRevealing(true);
      try {
        await supportService.revealIdentity(sessionId);
        toast.success("Identity shared with counselor");
        onIdentityRevealed();
      } catch (error) {
        toast.error("Failed to share identity");
      } finally {
        setIsRevealing(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-bg-card border border-white/10 rounded-2xl shadow-3xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
              <User className="w-6 h-6 text-indigo-400" />
            </div>
            {isConnected && (
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-bg-card" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">Campus Counselor</h4>
            <div className="flex items-center gap-1.5">
              {isAnonymous ? (
                <>
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Anonymous Session</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Identified Session</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-white/5 text-text-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.senderType === 'STUDENT' ? 'items-end' : 'items-start'}`}
          >
            {msg.senderType === 'SYSTEM' ? (
              <div className="w-full flex justify-center my-2">
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 text-text-muted" />
                  <span className="text-[10px] font-medium text-text-muted italic">{msg.content}</span>
                </div>
              </div>
            ) : (
              <>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.senderType === 'STUDENT' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white/5 border border-white/5 text-text-primary rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[9px] font-bold text-text-muted mt-1 px-1 opacity-50 uppercase tracking-tighter">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer / Input */}
      <div className="p-4 border-t border-white/5 space-y-4">
        {isAnonymous && (
          <button 
            onClick={handleRevealIdentity}
            disabled={isRevealing}
            className="w-full py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
          >
            {isRevealing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
            I trust this counselor — Reveal Identity
          </button>
        )}

        <div className="relative">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="absolute right-2 top-1.5 p-2 rounded-lg bg-indigo-600 text-white shadow-glow-indigo hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
