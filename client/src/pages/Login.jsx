import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RelayMascot } from '../components/brand/RelayMascot';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [providers, setProviders] = useState({
    google: { enabled: false },
    github: { enabled: false },
  });

  // Read error parameter passed from OAuth redirect
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const errorMap = {
        invalid_state: 'Session state expired or invalid. Please try signing in again.',
        unverified_email: 'Your social account lacks a verified institutional email address.',
        registration_disabled: 'Self-registration is disabled for this campus. Please contact your campus administrator.',
        account_deactivated: 'Your account has been deactivated. Please reach out to your campus coordinator.',
        no_campus_found: 'No campus matching your email domain could be found.',
        oauth_not_configured: 'This authentication provider is not yet enabled on this server.',
        token_exchange_failed: 'Authentication provider token exchange failed. Please retry.',
        userinfo_failed: 'Failed to retrieve profile information from provider.',
        access_denied: 'Social authentication was cancelled.',
      };
      const message = errorMap[oauthError] || `Authentication failed: ${oauthError}`;
      setError(message);
    }
  }, [searchParams]);

  // Fetch available OAuth providers
  useEffect(() => {
    let isMounted = true;
    async function checkProviders() {
      try {
        const endpoint =
          typeof window !== 'undefined' && window.location?.origin
            ? `${window.location.origin}/api/v1/auth/providers`
            : '/api/v1/auth/providers';
        const res = await fetch(endpoint);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setProviders(json.data);
          }
        }
      } catch (_err) {
        // Fall back to disabled defaults cleanly
      }
    }
    checkProviders();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setError('Please provide both your university email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      addToast(`Welcome back, ${user.fullName}!`, 'success');
      if (user.campusRole === 'CAMPUS_ADMIN') {
        navigate('/campus');
      } else if (user.campusRole === 'FACULTY_COORDINATOR') {
        navigate('/faculty/approvals');
      } else if (user.memberships && user.memberships.length > 0) {
        navigate(`/clubs/${user.memberships[0].clubId._id}`);
      } else {
        navigate('/my-work');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      addToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthClick = (provider) => {
    window.location.href = `/api/v1/auth/${provider}`;
  };

  return (
    <div className="min-h-screen dark-grid-viewport text-ink-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative select-none">
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-3">
          <RelayMascot size="md" interactive={true} />
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">ClubRelay</h1>
        <p className="mt-1 text-xs text-ink-200 font-medium">Build the club. Keep the momentum.</p>
        <div className="mt-2">
          <Link
            to="/"
            className="text-xs font-semibold text-brand-300 hover:text-brand-200 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-sm"
          >
            ← Return to overview
          </Link>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative">
        <div className="dark-grid-card rounded-2xl py-8 px-6 sm:px-8 shadow-card">
          {error && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-800 font-medium leading-relaxed"
            >
              {error}
            </div>
          )}

          {/* Social Authentication Providers */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleOAuthClick('google')}
              disabled={!providers.google?.enabled}
              className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-semibold btn-nowrap whitespace-nowrap transition-colors duration-150 ${
                providers.google?.enabled
                  ? 'bg-white hover:bg-ink-50 text-ink-900 border-ink-100 shadow-sm active:scale-[0.99] cursor-pointer'
                  : 'bg-white/10 text-ink-300 border-white/10 cursor-not-allowed opacity-60'
              }`}
              title={providers.google?.enabled ? 'Sign in with Google Workspace' : 'Google OAuth configured by campus IT'}
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="whitespace-nowrap">Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthClick('github')}
              disabled={!providers.github?.enabled}
              className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border text-xs font-semibold btn-nowrap whitespace-nowrap transition-colors duration-150 ${
                providers.github?.enabled
                  ? 'bg-ink-800 hover:bg-ink-700 text-white border-ink-600 shadow-sm active:scale-[0.99] cursor-pointer'
                  : 'bg-white/10 text-ink-300 border-white/10 cursor-not-allowed opacity-60'
              }`}
              title={providers.github?.enabled ? 'Sign in with GitHub' : 'GitHub OAuth configured by campus IT'}
            >
              <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span className="whitespace-nowrap">Continue with GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-brand-500/20" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-ink-900 px-3 text-ink-200 font-medium">
                Or institutional credentials
              </span>
            </div>
          </div>

          {/* Direct Credentials Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="university-email" className="block text-xs font-semibold text-ink-200 mb-1.5">
                University Email
              </label>
              <input
                id="university-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
                autoComplete="email"
                className="w-full rounded-xl dark-grid-input px-3.5 py-2.5 text-sm text-white placeholder:text-ink-400 transition-colors duration-150 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>

            <div>
              <label htmlFor="account-password" className="block text-xs font-semibold text-ink-200 mb-1.5">
                Password
              </label>
              <input
                id="account-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl dark-grid-input px-3.5 py-2.5 text-sm text-white placeholder:text-ink-400 transition-colors duration-150 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 inline-flex items-center justify-center font-semibold text-sm rounded-xl px-4 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-subtle transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              {loading ? 'Authenticating…' : 'Sign In to Workspace'}
            </button>
          </form>

          {/* Multi-Tenant Campus Notice */}
          <p className="mt-6 text-center text-[11px] text-ink-300 leading-normal">
            Multi-tenant institutional access. Protected under campus single-sign-on and club governance custody.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
