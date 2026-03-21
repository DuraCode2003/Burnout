"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { HeartHandshake, AlertTriangle, Lock, ArrowLeft } from "lucide-react";

interface CounselorRoleGuardProps {
  children: React.ReactNode;
}

export function CounselorRoleGuard({ children }: CounselorRoleGuardProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "COUNSELOR" && user.role !== "ADMIN") {
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }

    setChecked(true);
  }, [user, loading, router]);

  if (loading || !checked) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-counselor flex items-center justify-center shadow-glow-counselor"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <HeartHandshake className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-text-primary font-medium mb-2">
            Verifying Counselor Access
          </p>
          <p className="text-text-secondary text-sm">
            Please wait...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="card-glow p-8 bg-bg-card rounded-2xl border border-border-subtle text-center">
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-bg-elevated flex items-center justify-center border border-border-subtle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              <Lock className="w-10 h-10 text-danger" />
            </motion.div>

            <h1 className="text-2xl font-bold font-sora text-text-primary mb-3">
              Access Denied
            </h1>

            <p className="text-text-secondary mb-6">
              Counselor access required. Your current role does not have permission to view this page.
            </p>

            <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-bg-elevated border border-border-subtle mb-6">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-sm text-text-secondary">
                {user?.role === "STUDENT"
                  ? "Student account detected"
                  : "Insufficient privileges"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg-elevated border border-border-subtle text-text-primary hover:bg-bg-card transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-counselor text-white font-semibold shadow-glow-counselor hover:opacity-90 transition-opacity"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>

            {user?.role === "STUDENT" && (
              <motion.p
                className="mt-6 text-xs text-text-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                If you are a counselor and believe you should have access, please contact your system administrator.
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

export default CounselorRoleGuard;
