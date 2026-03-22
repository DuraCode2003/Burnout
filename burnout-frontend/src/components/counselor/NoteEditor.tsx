"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Shield, Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface NoteEditorProps {
  alertId: string;
  onSave: (note: string) => Promise<void>;
}

const MAX_CHARS = 400;

export function NoteEditor({ alertId, onSave }: NoteEditorProps) {
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setSaving(true);
    try {
      await onSave(noteText.trim());
      setNoteText("");
      toast.success("Note saved successfully");
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const remainingChars = MAX_CHARS - noteText.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent-counselor-light" />
          Add Internal Note
        </h4>
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <Shield className="w-3 h-3" />
          Internal only — student cannot see
        </span>
      </div>

      <textarea
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        placeholder="Document your observations, actions taken, or follow-up plans..."
        className="w-full h-28 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-counselor transition-colors resize-none"
        maxLength={MAX_CHARS + 50}
      />

      <div className="flex items-center justify-between">
        <span
          className={`text-xs ${
            isOverLimit ? "text-danger" : "text-text-muted"
          }`}
        >
          {remainingChars} characters remaining
        </span>
        <motion.button
          whileHover={{ scale: noteText.trim() && !saving ? 1.05 : 1 }}
          whileTap={{ scale: noteText.trim() && !saving ? 0.95 : 1 }}
          onClick={handleSubmit}
          disabled={!noteText.trim() || saving || isOverLimit}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-counselor text-white font-medium shadow-glow-counselor hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Save Note</span>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

export default NoteEditor;
