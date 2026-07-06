import type { LoginCredentials } from '../types/auth';

export const PRESET_ACCOUNTS: LoginCredentials[] = Array.from({ length: 200 }, (_, index) => {
  const number = String(index + 1).padStart(3, '0');
  return {
    username: `ielts${number}`,
    password: `ielts${number}pass`,
  };
});

export function validatePresetAccount(credentials: LoginCredentials): boolean {
  const username = credentials.username.trim().toLowerCase();
  const password = credentials.password.trim();

  return PRESET_ACCOUNTS.some(
    (account) => account.username === username && account.password === password,
  );
}
