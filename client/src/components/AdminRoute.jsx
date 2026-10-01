import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AdminRoute guards the /admin path.
 *
 * Rules:
 * 1. Unauthenticated user -> Redirects to /login
 * 2. Authenticated normal user -> Redirects to /dashboard
 * 3. Authenticated superadmin -> Renders children (AdminPanel)
 */
export default function AdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    user = null;
  }

  if (user?.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
