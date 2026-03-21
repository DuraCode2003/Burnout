"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Trash2, Shield, User, Loader2 } from "lucide-react";
import type { CounselorNote } from "@/types/counselor";

interface NoteEditorProps {
  notes: CounselorNote[];
  onAddNote: (content: string, isInternal: boolean) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
  currentCounselorId?: string;
}

export function NoteEditor({
  notes,
  onAddNote,
  onDeleteNote,
  currentCounselorId,
}: NoteEditorProps) {
  const [noteText, setNoteText] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setLoading(true);
    try {
      await onAddNote(noteText.trim(), isInternal);
      setNoteText("");
      setIsInternal(false);
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!onDeleteNote) return;
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await onDeleteNote(noteId);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-counselor-light" />
            Add Note
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="w-4 h-4 rounded border-border-subtle bg-bg-elevated text-accent-counselor focus:ring-accent-counselor focus:ring-offset-0"
            />
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Internal only
            </span>
          </label>
        </div>

        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Add a note about this alert..."
          className="w-full h-24 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-counselor transition-colors resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!noteText.trim() || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-counselor text-white font-medium shadow-glow-counselor hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add Note</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Notes List */}
      {notes.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border-subtle">
          <h4 className="text-sm font-semibold text-text-primary">
            Notes ({notes.length})
          </h4>
          <div className="space-y-2">
            {notes.map((note, index) => {
              const isOwnNote = currentCounselorId && note.counselorId === currentCounselorId;
              const canDelete = isOwnNote && onDeleteNote;

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border ${
                    note.isInternal
                      ? "bg-purple-500/5 border-purple-500/20"
                      : "bg-bg-elevated border-border-subtle"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-accent-counselor/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-accent-counselor-light" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {note.counselorName}
                        </p>
                        <p className="text-xs text-text-muted">
                          {new Date(note.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {note.isInternal && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Internal
                        </span>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1 rounded text-text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">
                    {note.content}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {notes.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No notes yet</p>
          <p className="text-xs">Add the first note to document this alert</p>
        </div>
      )}
    </div>
  );
}

export default NoteEditor;
