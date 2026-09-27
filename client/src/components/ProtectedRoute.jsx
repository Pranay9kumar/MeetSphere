import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * Wraps private pages that require authentication.
 *
 * Behaviour:
 *  - While AuthContext is hydrating from localStorage → show a glass-morphism loading state
 *  - If no authenticated user/token → redirect to /
 *  - Otherwise → render nested routes via <Outlet />
 */
export default function ProtectedRoute() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <main className="grid h-screen w-screen place-items-center bg-slate-950 text-slate-100">
        <div
          className="flex items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-6 py-5 shadow-glass backdrop-blur-md"
          role="status"
          aria-label="Restoring session"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-cyan-300" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">
            Restoring session
          </span>
        </div>
      </main>
    );
  }
  if (!user || !token) return <Navigate to="/" replace />;

  return <Outlet />;
}
