"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService, AuthResponse, RegisterData, LoginCredentials as LoginData, ConsentData, User } from "@/services/authService";
import Cookies from "js-cookie";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateConsent: (data: ConsentData) => Promise<AuthResponse>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = Cookies.get("auth_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
      Cookies.remove("auth_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (data: LoginData): Promise<AuthResponse> => {
    const response = await authService.login(data);
    await refreshUser();
    return response;
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    const response = await authService.register(data);
    await refreshUser();
    return response;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateConsent = async (data: ConsentData): Promise<AuthResponse> => {
    const response = await authService.updateConsent(data);
    await refreshUser();
    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateConsent,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
