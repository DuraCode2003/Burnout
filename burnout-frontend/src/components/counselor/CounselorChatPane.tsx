"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, 
  User, 
  ShieldCheck, 
  Lock, 
  Loader2,
  MessageCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useSupportChat } from "@/hooks/useSupportChat";
import { supportService } from "@/services/supportService";
import { SupportSession } from "@/types/support";
import toast from "react-hot-toast";

interface CounselorChatPaneProps {
  session: SupportSession;
  onSessionUpdated: (session: SupportSession) => void;
}

export function CounselorChatPane({ session, onSessionUpdated }: CounselorChatPaneProps) {
  const { messages, isConnected, sendMessage } = useSupportChat(session.id);
  const [inputText, setInputText] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const updated = await supportService.joinSession(session.id);
      onSessionUpdated(updated);
      toast.success("Joined support session");
    } catch (error) {
      toast.error("Failed to join session");
    } finally {
      setIsJoining(false);
    }
  };

  const isPending = session.status === 'PENDING';
  const studentDisplay = session.isAnonymous 
    ? `Anonymized ${session.student.anonymousId}` 
    : (session.student.name || session.student.anonymousId);

  return (
    <div className="flex flex-col h-full bg-bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <MessageCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary">Support Chat</h4>
            <div className="flex items-center gap-1.5">
              {session.isAnonymous ? (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                  <Lock className="w-2.5 h-2.5 text-rose-400" />
                  <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">ANONYMOUS</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">IDENTIFIED</span>
                </div>
              )}
              <span className="text-[10px] text-text-muted font-medium">Session with {studentDisplay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-primary/30"
      >
        {isPending && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 animate-pulse">
              <MessageCircle className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-text-primary">New Support Request</h5>
              <p className="text-xs text-text-secondary mt-1">Student is waiting to connect with a counselor.</p>
            </div>
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-glow-indigo hover:bg-indigo-500 transition-all disabled:opacity-50"
            >
              {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : "Accept & Start Chat"}
            </button>
          </div>
        )}

        {!isPending && messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex flex-col ${msg.senderType === 'COUNSELOR' ? 'items-end' : 'items-start'}`}
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
                <div className={`max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.senderType === 'COUNSELOR' 
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-glow-indigo/10' 
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

      {/* Input */}
      {!isPending && (
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="relative">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Provide empathetic support..."
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
          <div className="mt-2 flex items-center gap-2 justify-center opacity-30">
            <Clock className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Active Clinical Session</span>
          </div>
        </div>
      )}
    </div>
  );
}
