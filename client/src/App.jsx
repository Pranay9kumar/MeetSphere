import React, { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// ── Code-split view imports ───────────────────────────────────────────────────
const ActivityView  = lazy(() => import('./components/ActivityView'));
const ChannelsView  = lazy(() => import('./components/ChannelsView'));
const DashboardView = lazy(() => import('./components/DashboardView'));
const DocumentsView = lazy(() => import('./components/DocumentsView'));
const LobbyPage     = lazy(() => import('./pages/LobbyPage'));
const RoomPage      = lazy(() => import('./pages/RoomPage'));
const MeetingPage   = lazy(() => import('./pages/MeetingPage'));
const SettingsPage  = lazy(() => import('./pages/SettingsPage'));

// ── Utility wrapper ───────────────────────────────────────────────────────────
function RouteSuspense({ children }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

// ── Auth forms (login / register) ────────────────────────────────────────────
function AuthForm({ mode }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const isRegister = mode === 'register';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) await register(form);
      else await login({ email: form.email, password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to complete that request.');
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-surface px-6 text-on-surface transition-colors">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-outline-variant bg-surface-container-low p-8 shadow-2xl backdrop-blur-xl"
      >
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">MeetSphere workspace</p>
        <h1 className="mt-4 font-display text-3xl font-black text-on-surface">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          {isRegister
            ? 'Set up your secure collaboration workspace.'
            : 'Sign in to continue to your workspace.'}
        </p>

        {isRegister && (
          <label className="mt-6 block text-sm">
            <span className="mb-2 block text-on-surface font-medium">Name</span>
            <input
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
            />
          </label>
        )}

        <label className="mt-6 block text-sm">
          <span className="mb-2 block text-on-surface font-medium">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
          />
        </label>

        <label className="mt-4 block text-sm">
          <span className="mb-2 block text-on-surface font-medium">Password</span>
          <input
            required
            minLength={6}
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-xl border border-outline-variant bg-surface px-3 py-3 text-on-surface outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl border border-error/30 bg-error-container/20 px-3 py-2 text-sm text-on-error-container">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-bold text-on-primary shadow-glow transition hover:opacity-90 active:scale-95"
        >
          {isRegister ? 'Create account' : 'Sign in'}
        </button>
        <button
          type="button"
          onClick={() => navigate(isRegister ? '/login' : '/register')}
          className="mt-4 w-full text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
        </button>
      </form>
    </main>
  );
}

// ── Root index redirect ───────────────────────────────────────────────────────
function RootRoute() {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return <Navigate to={user && token ? '/dashboard' : '/login'} replace />;
}

// ── Catch-all redirect ────────────────────────────────────────────────────────
function CatchAllRoute() {
  const { user, token, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return <Navigate to={user && token ? '/dashboard' : '/login'} replace />;
}

// ── Root app router ───────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('light', savedTheme === 'light');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<AuthForm mode="login" />} />
        <Route path="/register" element={<AuthForm mode="register" />} />
        <Route path="/"         element={<RootRoute />} />

        {/* Authenticated routes — guarded by ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          {/* Fullscreen interactive views */}
          <Route path="/lobby"         element={<RouteSuspense><LobbyPage /></RouteSuspense>} />
          <Route path="/lobby/:roomId" element={<RouteSuspense><LobbyPage /></RouteSuspense>} />
          <Route path="/room/:roomId"  element={<RouteSuspense><RoomPage /></RouteSuspense>} />
          <Route path="/meeting/:meetingId" element={<RouteSuspense><MeetingPage /></RouteSuspense>} />

          {/* Main workspace layout */}
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<RouteSuspense><DashboardView /></RouteSuspense>} />
            <Route path="/channels"  element={<RouteSuspense><ChannelsView /></RouteSuspense>} />
            <Route path="/documents" element={<RouteSuspense><DocumentsView /></RouteSuspense>} />
            <Route path="/activity"  element={<RouteSuspense><ActivityView /></RouteSuspense>} />
            <Route path="/settings"  element={<RouteSuspense><SettingsPage /></RouteSuspense>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<CatchAllRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
