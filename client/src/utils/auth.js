import { queryClient } from '../queryClient';

/**
 * Persists an authenticated user session, clears stale cache from any prior user,
 * and notifies all UI components across the application.
 */
export function setAuthSession(token, user) {
  if (token) {
    localStorage.setItem('token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Clear query cache to prevent any data leakage from previously logged in user
  try {
    queryClient.clear();
  } catch (err) {
    console.warn('[AUTH] Error clearing query client cache:', err);
  }

  // Notify components (like Navbar, Sidebar, ProfileModal) of the active user change
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: user }));
  }
}

/**
 * Clears the authenticated user session, purges TanStack Query cache,
 * and dispatches event so UI immediately reverts to unauthenticated state.
 */
export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('current_hosted_pin');
  localStorage.removeItem('guest_playerName');
  localStorage.removeItem('guest_pin');
  localStorage.removeItem('guest_avatar');

  // Purge any cached user-specific queries (quizzes, results, stats)
  try {
    queryClient.clear();
  } catch (err) {
    console.warn('[AUTH] Error clearing query client cache on logout:', err);
  }

  // Broadcast logout event to all mounted components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('user-profile-updated', { detail: null }));
  }
}

/**
 * Safely retrieves stored user from localStorage
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authentication token
 */
export function getStoredToken() {
  return localStorage.getItem('token') || null;
}
