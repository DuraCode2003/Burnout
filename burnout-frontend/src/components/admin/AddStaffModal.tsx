"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Shield, Users, Mail, Lock, Building, Loader2 } from "lucide-react";
import adminService from "@/services/adminService";
import { UserManagement } from "@/types/admin";

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserManagement) => void;
}

export function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "COUNSELOR" as "ADMIN" | "COUNSELOR",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newUser = await adminService.createStaffUser(formData);
      onSuccess(newUser);
      onClose();
      setFormData({ name: "", email: "", password: "", role: "COUNSELOR", department: "" });
    } catch (err: any) {
      console.error("Failed to create staff:", err);
      setError(err.response?.data?.message || "Failed to create staff member. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            className="w-full max-w-md bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="relative p-6 border-b border-border-subtle bg-bg-elevated/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-admin flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-sora text-text-primary">Add Staff Member</h3>
                  <p className="text-xs text-text-secondary">Create new Admin or Counselor</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      required
                      type="text"
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      required
                      type="email"
                      placeholder="email@university.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                      System Role
                    </label>
                    <div className="flex gap-2">
                       <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "COUNSELOR" })}
                        className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          formData.role === "COUNSELOR"
                            ? "bg-secondary/10 border-secondary text-secondary shadow-sm"
                            : "bg-bg-elevated border-border-subtle text-text-secondary hover:border-border-strong"
                        }`}
                      >
                        <Users className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">Counselor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "ADMIN" })}
                        className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          formData.role === "ADMIN"
                            ? "bg-primary/10 border-primary text-primary shadow-sm"
                            : "bg-bg-elevated border-border-subtle text-text-secondary hover:border-border-strong"
                        }`}
                      >
                        <Shield className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">Admin</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 ml-1">
                      Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        type="text"
                        placeholder="e.g. Health"
                        className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-text-secondary hover:bg-bg-elevated transition-all border border-border-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center gap-2 px-6 py-3 bg-gradient-admin text-white rounded-xl font-bold shadow-glow-admin hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
