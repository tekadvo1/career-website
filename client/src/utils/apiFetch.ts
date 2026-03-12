/**
 * Authenticated fetch wrapper.
 * Automatically adds the JWT `Authorization: Bearer <token>` header
 * to every request so protected API routes work correctly.
 *
 * Usage:
 *   import { apiFetch } from '../utils/apiFetch';
 *   const res = await apiFetch('/api/ai/chat', { method: 'POST', body: ... });
 */
export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set Content-Type to JSON if there is a body and it's not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  // Security Feature 1: Prevent token leakage to external domains
  // We only attach the JWT token if the request is going to our own backend (e.g., relative URLs starting with '/' or same origin)
  const isLocalRequest = url.startsWith('/') || url.startsWith(window.location.origin);

  if (token && isLocalRequest) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  // Security Feature 2: Handle Unauthorized/Forbidden responses
  // If the token is invalid or expired, automatically log the user out and redirect to login
  // BUT skip this on public pages that don't require login
  const publicRoutes = ['/login', '/signup', '/signin', '/p/', '/portfolio/', '/about', '/contact', '/privacy', '/terms', '/cookies'];
  const isPublicPage = publicRoutes.some(route => window.location.pathname.startsWith(route));

  if ((response.status === 401 || response.status === 403) && isLocalRequest && !isPublicPage) {
    localStorage.clear();
    window.location.href = '/signin';
  }

  return response;
};
