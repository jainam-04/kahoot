import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute guards authenticated routes (/dashboard, /quiz/create, /quiz/my, /reports, etc.)
 *
 * Rules:
 * 1. Unauthenticated user (no token) -> Redirects to /login
 * 2. Authenticated user -> Renders children
 */
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

