/**
 * auth.ts — Centralised session storage helpers.
 *
 * WHY sessionStorage for token + user?
 *   localStorage is SHARED across every tab of the same origin.
 *   When two accounts are open in two tabs, signing into Tab 2 would
 *   overwrite Tab 1's token, causing both tabs to show Account 2.
 *
 *   sessionStorage is PER-TAB, so each tab keeps its own independent
 *   session — exactly the behaviour users expect.
 *
 * Non-sensitive UI-cache keys (lastRoleAnalysis, roadmap_progress_*, etc.)
 * are intentionally left in localStorage because they are fetched fresh
 * from the server on login and are safe to share / be stale.
 */

// ── Token helpers ──────────────────────────────────────────────────────────────

export const getToken = (): string | null =>
  sessionStorage.getItem('token');

export const setToken = (token: string): void =>
  sessionStorage.setItem('token', token);

export const removeToken = (): void =>
  sessionStorage.removeItem('token');

// ── User helpers ───────────────────────────────────────────────────────────────

export const getUser = <T = Record<string, unknown>>(): T | null => {
  const raw = sessionStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setUser = (user: unknown): void =>
  sessionStorage.setItem('user', JSON.stringify(user));

export const removeUser = (): void =>
  sessionStorage.removeItem('user');

// ── Full session clear (logout) ────────────────────────────────────────────────
// Clears only session-scoped auth keys.
// Non-auth localStorage keys (UI cache) can be handled separately if desired.
export const clearSession = (): void => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};
