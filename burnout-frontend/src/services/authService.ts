import api from './api';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN' | 'COUNSELOR';
  department?: string;
  isActive: boolean;
  consentGiven: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institution: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

export interface ConsentData {
  hasConsented: boolean;
  anonymizeData: boolean;
}

export interface AuthResponse {
  token?: string;
  refreshToken?: string;
  userId: string;
  name: string;
  email?: string;
  role: string;
  consentRequired: boolean;
  hasConsented: boolean;
  anonymizeData: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string[]>;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    if (response.data.token) {
      Cookies.set('auth_token', response.data.token, { expires: 7, path: '/' });
      Cookies.set('consent_given', !response.data.consentRequired ? 'true' : 'false', { expires: 7, path: '/' });
    }
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register', {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
      department: data.institution,
    });
    if (response.data.token) {
      Cookies.set('auth_token', response.data.token, { expires: 7, path: '/' });
      Cookies.set('consent_given', !response.data.consentRequired ? 'true' : 'false', { expires: 7, path: '/' });
    }
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      Cookies.remove('auth_token', { path: '/' });
      Cookies.remove('consent_given', { path: '/' });
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<AuthResponse>('/api/auth/me');
      const data = response.data;
      if (data) {
        Cookies.set('consent_given', !data.consentRequired ? 'true' : 'false', { expires: 7, path: '/' });
        return {
          id: data.userId,
          email: data.email || '',
          name: data.name,
          role: data.role as any,
          isActive: true,
          consentGiven: !data.consentRequired,
          createdAt: new Date().toISOString(), // Fallback if not provided
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  async updateConsent(data: ConsentData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/consent', data);
    if (response.data) {
      Cookies.set('consent_given', !response.data.consentRequired ? 'true' : 'false', { expires: 7, path: '/' });
    }
    return response.data;
  },

  async refreshToken(): Promise<{ token: string; expiresIn: number }> {
    const response = await api.post<{ token: string; expiresIn: number }>('/api/auth/refresh');
    return response.data;
  },
};

export default authService;
