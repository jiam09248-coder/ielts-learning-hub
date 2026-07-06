import type { CurrentUser } from '../types/auth';

const CURRENT_USER_KEY = 'ielts_hub_current_user';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getCurrentUser(): CurrentUser | null {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CurrentUser;
    return parsed?.username ? parsed : null;
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
