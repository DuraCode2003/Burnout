'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import authService, { type User } from '@/services/authService';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    institution: string;
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
  }) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

function setAuthTokens(token: string, refreshToken?: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

function clearAuthTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      clearAuthTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isLoading && !user) {
      const publicPaths = ['/login', '/register', '/consent'];
      const isPublicPath = publicPaths.some((path) => pathname?.startsWith(path));

      if (!isPublicPath && pathname !== '/') {
        router.push('/login');
      }
    }

    if (!isLoading && user) {
      if (!user.consentGiven && !pathname?.startsWith('/consent')) {
        router.push('/consent');
      }

      if (user.consentGiven && pathname?.startsWith('/consent')) {
        router.push('/dashboard');
      }
    }
  }, [isLoading, user, pathname, router]);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await authService.login({ email, password });
      setAuthTokens(response.token || '', response.refreshToken);
      
      const loggedInUser: User = {
        id: response.userId,
        email: response.email || email,
        name: response.name,
        role: response.role as any,
        isActive: true,
        consentGiven: response.hasConsented,
        createdAt: new Date().toISOString(),
      };
      setUser(loggedInUser);

      if (response.consentRequired) {
        router.push('/consent');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    institution: string;
    agreeToTerms: boolean;
    agreeToPrivacy: boolean;
  }) => {
    setError(null);
    try {
      const response = await authService.register(data);
      setAuthTokens(response.token || '', response.refreshToken);
      
      const newUser: User = {
        id: response.userId,
        email: response.email || data.email,
        name: response.name,
        role: response.role as any,
        isActive: true,
        consentGiven: response.hasConsented,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      router.push('/consent');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthTokens();
      setUser(null);
      router.push('/login');
    }
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    error,
    clearError,
  };
}

export default useAuth;
