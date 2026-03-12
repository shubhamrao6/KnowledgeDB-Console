import { apiRequest } from './api';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: User;
  subscription: {
    plan: string;
    status: string;
    apiKey: string;
    currentPeriodEnd: string;
  };
}

export interface SignupResponse {
  message: string;
  userId: string;
  apiKey: string;
}

export function getToken(): string {
  return typeof window !== 'undefined' ? localStorage.getItem('kdb_id_token') || '' : '';
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('kdb_user');
  return raw ? JSON.parse(raw) : null;
}

export function setTokens(data: LoginResponse) {
  localStorage.setItem('kdb_id_token', data.idToken);
  localStorage.setItem('kdb_access_token', data.accessToken);
  localStorage.setItem('kdb_refresh_token', data.refreshToken);
  if (data.subscription?.apiKey) {
    localStorage.setItem('kdb_api_key', data.subscription.apiKey);
  }
  if (data.user) {
    localStorage.setItem('kdb_user', JSON.stringify(data.user));
  }
}

export function clearTokens() {
  localStorage.removeItem('kdb_id_token');
  localStorage.removeItem('kdb_access_token');
  localStorage.removeItem('kdb_refresh_token');
  localStorage.removeItem('kdb_api_key');
  localStorage.removeItem('kdb_user');
}

export async function login(email: string, password: string) {
  return apiRequest<LoginResponse>('POST', '/auth/login', { email, password }, false);
}

export async function signup(email: string, password: string, firstName: string, lastName: string) {
  return apiRequest<SignupResponse>('POST', '/auth/signup', { email, password, firstName, lastName }, false);
}

export async function refreshTokens() {
  const refreshToken = localStorage.getItem('kdb_refresh_token');
  if (!refreshToken) throw new Error('No refresh token');
  const { status, data } = await apiRequest<{ accessToken: string; idToken: string; expiresIn: number }>('POST', '/auth/refresh', { refreshToken }, false);
  if (status === 200) {
    localStorage.setItem('kdb_id_token', data.idToken);
    localStorage.setItem('kdb_access_token', data.accessToken);
  }
  return { status, data };
}

export async function logout() {
  const refreshToken = localStorage.getItem('kdb_refresh_token');
  const result = await apiRequest('POST', '/auth/logout', { refreshToken }, true);
  clearTokens();
  return result;
}
