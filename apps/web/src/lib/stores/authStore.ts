import { writable } from 'svelte/store';
import { currentUser, login as apiLogin, logout as apiLogout, register as apiRegister, type AuthUser } from '../api/authApi';

export const authUser = writable<AuthUser | null>(null);
export const authLoading = writable(false);
export const authError = writable('');

export async function hydrateAuth(): Promise<void> {
  authLoading.set(true);
  try {
    authUser.set(await currentUser());
  } finally {
    authLoading.set(false);
  }
}

export async function login(email: string, password: string): Promise<void> {
  authLoading.set(true);
  authError.set('');
  try {
    authUser.set(await apiLogin(email, password));
    rememberEmail(email);
  } catch (error) {
    authError.set(error instanceof Error ? error.message : 'Unable to sign in');
    throw error;
  } finally {
    authLoading.set(false);
  }
}

export async function register(email: string, password: string): Promise<void> {
  authLoading.set(true);
  authError.set('');
  try {
    authUser.set(await apiRegister(email, password));
    rememberEmail(email);
  } catch (error) {
    authError.set(error instanceof Error ? error.message : 'Unable to register');
    throw error;
  } finally {
    authLoading.set(false);
  }
}

export async function logout(): Promise<void> {
  authLoading.set(true);
  try {
    await apiLogout();
    authUser.set(null);
  } finally {
    authLoading.set(false);
  }
}

export function rememberedEmail(): string {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('axis_last_email') || '';
}

function rememberEmail(email: string): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem('axis_last_email', email.trim().toLowerCase());
}
