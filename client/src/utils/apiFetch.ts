/**
 * Authenticated fetch wrapper.
 * Automatically adds the JWT `Authorization: Bearer <token>` header
 * to every request so protected API routes work correctly.
 *
 * Usage:
 *   import { apiFetch } from '../utils/apiFetch';
 *   const res = await apiFetch('/api/ai/chat', { method: 'POST', body: ... });
 */
export const apiFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set Content-Type to JSON if there is a body and it's not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
};
