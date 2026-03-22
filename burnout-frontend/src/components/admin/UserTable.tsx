"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserManagement } from "@/types/admin";
import adminService from "@/services/adminService";
import { User, Shield, GraduationCap, Search, Filter, Loader2, CheckCircle2, XCircle, Building } from "lucide-react";

interface UserTableProps {
  initialUsers: UserManagement[];
}

export function UserTable({ initialUsers }: UserTableProps) {
  const [users, setUsers] = useState<UserManagement[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");

  const departments = Array.from(new Set(initialUsers.map(u => u.department).filter(Boolean))) as string[];

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesDept = deptFilter === "ALL" || user.department === deptFilter;
    
    return matchesSearch && matchesRole && matchesDept;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-4 h-4 text-primary" />;
      case "COUNSELOR":
        return <User className="w-4 h-4 text-secondary" />;
      default:
        return <GraduationCap className="w-4 h-4 text-text-secondary" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-primary/10 text-primary border-primary/20";
      case "COUNSELOR":
        return "bg-secondary/10 text-secondary border-secondary/20";
      default:
        return "bg-text-secondary/10 text-text-secondary border-text-secondary/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select
              className="pl-10 pr-8 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer min-w-[140px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="COUNSELOR">Counselors</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select
              className="pl-10 pr-8 py-2.5 bg-bg-elevated border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer min-w-[170px]"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <motion.div
        className="card-glow-admin bg-bg-card rounded-2xl border border-border-subtle overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-elevated/50">
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Department</th>
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Joined</th>
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">System Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  className="hover:bg-bg-elevated/30 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-text-primary">{user.name}</div>
                        <div className="text-xs text-text-secondary">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-text-secondary">{user.department || "N/A"}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-text-secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      {user.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                          <span className="text-xs font-medium text-success uppercase tracking-wider">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-danger" />
                          <span className="text-xs font-medium text-danger uppercase tracking-wider">Inactive</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-bg-elevated/50 border-border-subtle text-text-secondary">
                      {user.role}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-bg-elevated border border-border-subtle mb-4">
              <Search className="w-6 h-6 text-text-secondary" />
            </div>
            <h4 className="text-text-primary font-semibold mb-1">No users found</h4>
            <p className="text-text-secondary text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
