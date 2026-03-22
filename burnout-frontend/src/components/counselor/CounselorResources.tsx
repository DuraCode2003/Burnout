"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, Calendar, Clock, ExternalLink, ChevronRight, MessageCircle } from "lucide-react";

export function CounselorResources() {
  const faqs = [
    {
      question: "When should I escalate an alert?",
      answer: "Escalate to University Health Services immediately if a student explicitly mentions self-harm, severe crisis, or if their burnout score exceeds 95.",
    },
    {
      question: "What is the typical SLA for RED alerts?",
      answer: "RED (Urgent) alerts require a response or contact attempt within 2 hours of generation during working hours.",
    },
    {
      question: "Are student notes strictly confidential?",
      answer: "Yes. Internal notes are only visible to the Wellbeing Team. Student self-reported notes are shared with consent.",
    },
  ];

  const sessions = [
    { time: "10:00 AM", title: "Walk-in Hours Open", duration: "2 hours" },
    { time: "01:30 PM", title: "Wellbeing Workshop", duration: "1 hour" },
    { time: "03:00 PM", title: "Team Case Review", duration: "45 mins" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent-counselor/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-accent-counselor" />
          </div>
          <h2 className="text-xl font-bold font-sora text-text-primary">Policy FAQs</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="p-4 rounded-xl bg-bg-elevated border border-border-subtle/50 hover:border-accent-counselor/30 transition-colors">
              <h3 className="text-sm font-semibold text-text-primary mb-1 flex items-start gap-2">
                <MessageCircle className="w-4 h-4 mt-0.5 text-accent-counselor-light" />
                {faq.question}
              </h3>
              <p className="text-sm text-text-secondary pl-6">{faq.answer}</p>
            </div>
          ))}
        </div>
        
        <button className="mt-4 text-sm text-accent-counselor hover:text-accent-counselor-light font-medium flex items-center gap-1 transition-colors">
          View Full Policy Manual <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Schedule Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <h2 className="text-xl font-bold font-sora text-text-primary">Today's Schedule</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6]">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          {sessions.map((session, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-bg-elevated hover:bg-bg-elevated/80 transition-colors cursor-pointer group">
              <div className="flex flex-col items-center justify-center min-w-[60px] text-center border-r border-border-subtle pr-4">
                <span className="text-sm font-bold text-text-primary font-sora">{session.time.split(' ')[0]}</span>
                <span className="text-xs text-text-muted font-medium">{session.time.split(' ')[1]}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary group-hover:text-[#8b5cf6] transition-colors">{session.title}</h4>
                <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
                  <Clock className="w-3 h-3" />
                  <span>{session.duration}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-[#8b5cf6] transition-colors" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
