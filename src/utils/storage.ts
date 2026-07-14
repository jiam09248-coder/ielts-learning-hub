import type { CurrentUser } from '../types/auth';
import { PRESET_ACCOUNTS } from '../data/accounts';

const CURRENT_USER_KEY = 'ielts_hub_current_user';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getCurrentUser(): CurrentUser | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CurrentUser;
    const isKnownUser = PRESET_ACCOUNTS.some((account) => account.username === parsed?.username);
    const hasValidLoginAt = Number.isFinite(parsed?.loginAt) && Date.now() - parsed.loginAt < SESSION_MAX_AGE_MS;
    if (!isKnownUser || !hasValidLoginAt) {
      window.localStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: CurrentUser): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(CURRENT_USER_KEY);
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
