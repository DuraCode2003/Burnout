"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserTable } from "@/components/admin/UserTable";
import { UserManagement } from "@/types/admin";
import adminService from "@/services/adminService";
import AdminDashboardSkeleton from "@/components/admin/AdminSkeleton";
import { Users, UserCheck, ShieldCheck, Ghost, UserPlus } from "lucide-react";
import { AddStaffModal } from "@/components/admin/AddStaffModal";

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStaffCreated = (newUser: UserManagement) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  if (loading) return <AdminDashboardSkeleton />;

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    counselors: users.filter((u) => u.role === "COUNSELOR").length,
    students: users.filter((u) => u.role === "STUDENT").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-sora text-text-primary mb-2">
            User Management
          </h1>
          <p className="text-text-secondary">
            View all registered users and create new administrative or counselor accounts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-admin text-white rounded-xl font-bold shadow-glow-admin hover:opacity-90 transition-all group"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Add Staff Member</span>
          </button>

          <div className="flex gap-4">
            <div className="px-4 py-2 bg-bg-card border border-border-subtle rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xs text-text-secondary font-medium">Admins</div>
                <div className="text-lg font-bold text-text-primary leading-tight">{stats.admins}</div>
              </div>
            </div>
            <div className="px-4 py-2 bg-bg-card border border-border-subtle rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <div className="text-xs text-text-secondary font-medium">Counselors</div>
                <div className="text-lg font-bold text-text-primary leading-tight">{stats.counselors}</div>
              </div>
            </div>
            <div className="px-4 py-2 bg-bg-card border border-border-subtle rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-text-secondary/10 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-text-secondary" />
              </div>
              <div>
                <div className="text-xs text-text-secondary font-medium">Students</div>
                <div className="text-lg font-bold text-text-primary leading-tight">{stats.students}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-12 bg-danger/5 border border-danger/20 rounded-2xl text-center">
          <Ghost className="w-12 h-12 text-danger/50 mx-auto mb-4" />
          <h3 className="text-danger font-semibold mb-1">Error Loading Users</h3>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <button 
            onClick={() => fetchUsers()}
            className="px-6 py-2 bg-danger text-bg-main rounded-xl font-semibold hover:bg-danger-hover transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <UserTable initialUsers={users} />
      )}

      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleStaffCreated}
      />
    </div>
  );
}
