import { BACKEND_URL } from './client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || body.error?.message || 'Authentication request failed');
  return body as T;
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const result = await authRequest<{ user: AuthUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return result.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const result = await authRequest<{ user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return result.user;
}

export async function currentUser(): Promise<AuthUser | null> {
  try {
    const result = await authRequest<{ user: AuthUser }>('/api/auth/me');
    return result.user;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await authRequest('/api/auth/logout', { method: 'POST' });
}
