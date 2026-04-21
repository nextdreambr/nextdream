import type { AuthSession } from './api';
import { isSandboxEnvironment } from '../config/environment';

export const AUTH_STORAGE_KEY = 'nextdream.auth.session';

function getPrimaryStorage() {
  if (typeof window === 'undefined') return null;
  return isSandboxEnvironment() ? window.sessionStorage : window.localStorage;
}

function getSecondaryStorage() {
  if (typeof window === 'undefined') return null;
  return isSandboxEnvironment() ? window.localStorage : window.sessionStorage;
}

function readStoredSession(raw: string | null): AuthSession | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed.user) return null;

    return parsed as AuthSession;
  } catch {
    return null;
  }
}

export function loadStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  return (
    readStoredSession(getPrimaryStorage()?.getItem(AUTH_STORAGE_KEY) ?? null) ??
    readStoredSession(getSecondaryStorage()?.getItem(AUTH_STORAGE_KEY) ?? null)
  );
}

export function persistStoredSession(session: AuthSession) {
  if (typeof window === 'undefined') return;
  getPrimaryStorage()?.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  getSecondaryStorage()?.removeItem(AUTH_STORAGE_KEY);
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  getPrimaryStorage()?.removeItem(AUTH_STORAGE_KEY);
  getSecondaryStorage()?.removeItem(AUTH_STORAGE_KEY);
}
