import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useMediaQuery } from '../components/marketing/hooks/useMediaQuery';
import { BrandLockup } from '../components/brand/BrandLockup';
import { RelayMascot } from '../components/brand/RelayMascot';
import { MascotSpeechBubble } from '../components/auth/MascotSpeechBubble';
import { AuthStagePanel } from '../components/auth/AuthStagePanel';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getPasswordStrengthDetails(password) {
  if (!password) {
    return { score: 0, label: 'Minimum 8 characters', tone: 'text-ink-600' };
  }
  if (password.length < 8) {
    return {
      score: 1,
      label: `Minimum 8 characters (${password.length}/8)`,
      tone: 'text-coral-700',
    };
  }
  let score = 2; // length >= 8
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) && password.length >= 10) score += 1;
  else if ((/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) && score < 3) score += 1;

  if (score >= 4) {
    return { score: 4, label: 'Strong password', tone: 'text-mint-700' };
  }
  if (score === 3) {
    return { score: 3, label: 'Good password', tone: 'text-brand-600' };
  }
  return { score: 2, label: 'Fair password', tone: 'text-sunshine-700' };
}

function getAuthenticatedRedirectPath(user, requestedRedirect = '') {
  if (requestedRedirect && requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//')) {
    return requestedRedirect;
  }
  if (!user) return '/onboarding';
  if (user.campusRole === 'CAMPUS_ADMIN') return '/campus';
  if (user.campusRole === 'FACULTY_COORDINATOR') return '/faculty/approvals';
  if (user.memberships && user.memberships.length > 0) {
    const preferredId = user.lastActiveClubId || localStorage.getItem('clubrelay_active_club');
    const matched = user.memberships.find((m) => (m.clubId?._id || m.clubId) === preferredId);
    const targetId = matched?.clubId?._id || user.memberships[0]?.clubId?._id;
    if (targetId) return `/clubs/${targetId}`;
  }
  return '/onboarding';
}

export function Login({ initialTab = 'login' }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register: contextRegister, user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const leftPanelRef = useRef(null);
  const signInTabRef = useRef(null);
  const createAccountTabRef = useRef(null);
  const signInPasswordRef = useRef(null);
  const skipNextFocusResetRef = useRef(false);

  const queryTab = searchParams.get('tab');
  const resolvedInitialTab = queryTab === 'register' || initialTab === 'register' ? 'register' : 'login';

  const [activeTab, setActiveTab] = useState(resolvedInitialTab);

  // Sign in state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Create account state
  const [fullName, setFullName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usePersonalAccount, setUsePersonalAccount] = useState(false);
  const [touchedSignUp, setTouchedSignUp] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Campus domain resolution state
  const [resolveState, setResolveState] = useState({
    status: 'idle', // 'idle' | 'checking' | 'resolved' | 'not_found'
    campus: null,
    checkedDomain: '',
  });

  // Submission & feedback state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [providers, setProviders] = useState({
    google: { enabled: false },
    github: { enabled: false },
  });

  // Mascot focus & event state
  const [focusedField, setFocusedField] = useState(null); // null | 'name' | 'email' | 'signin-password' | 'signup-password' | 'signup-confirm'
  const [mascotEvent, setMascotEvent] = useState('none'); // 'none' | 'error' | 'signup_success' | 'signin_success'

  // Redirect authenticated users cleanly
  useEffect(() => {
    if (!authLoading && user) {
      navigate(getAuthenticatedRedirectPath(user), { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Prevent reserved scrollbar-gutter strip next to full-bleed split stage
  useEffect(() => {
    const htmlEl = document.documentElement;
    const prev = htmlEl.style.scrollbarGutter;
    htmlEl.style.scrollbarGutter = 'auto';
    return () => {
      htmlEl.style.scrollbarGutter = prev;
    };
  }, []);

  // Read OAuth error query parameter if present
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const errorMap = {
        invalid_state: 'Session state expired or invalid. Please try signing in again.',
        unverified_email: 'Your social account lacks a verified institutional email address.',
        registration_disabled: 'Self-registration is disabled for this campus. Please contact your campus administrator.',
        account_deactivated: 'Your account has been deactivated. Please reach out to your campus coordinator.',
        no_campus_found: 'No campus matching your email domain could be found.',
        ambiguous_campus: 'Multiple institutions share this domain. Please sign in with your institutional credentials.',
        ambiguous_account: 'Multiple accounts match this email. Please sign in with your campus credentials.',
        linking_failed: 'Failed to link social identity to existing account. Please try again or use direct login.',
        registration_failed: 'Failed to create student account. Please contact your campus coordinator.',
        oauth_not_configured: 'This authentication provider is not yet enabled on this server.',
        token_exchange_failed: 'Authentication provider token exchange failed. Please retry.',
        userinfo_failed: 'Failed to retrieve profile information from provider.',
        access_denied: 'Social authentication was cancelled.',
      };
      setError(errorMap[oauthError] || `Authentication failed: ${oauthError}`);
      setMascotEvent('error');
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
      } catch {
        // Leave providers disabled cleanly
      }
    }
    checkProviders();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced campus domain resolution on Create account email input (400ms)
  useEffect(() => {
    if (activeTab !== 'register') return;

    const trimmedEmail = signUpEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setResolveState({ status: 'idle', campus: null, checkedDomain: '' });
      return;
    }

    const domain = trimmedEmail.split('@')[1];
    if (!domain) {
      setResolveState({ status: 'idle', campus: null, checkedDomain: '' });
      return;
    }

    let cancelled = false;
    setResolveState((prev) => ({
      status: 'checking',
      campus: prev.checkedDomain === domain ? prev.campus : null,
      checkedDomain: domain,
    }));

    const timerId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/v1/campuses/resolve?domain=${encodeURIComponent(domain)}`
        );
        if (cancelled) return;

        if (res.ok) {
          const json = await res.json();
          if (json.data?.campus?.id) {
            setResolveState({
              status: 'resolved',
              campus: json.data.campus,
              checkedDomain: domain,
            });
            return;
          }
        }

        setResolveState({
          status: 'not_found',
          campus: null,
          checkedDomain: domain,
        });
      } catch {
        if (!cancelled) {
          setResolveState({
            status: 'not_found',
            campus: null,
            checkedDomain: domain,
          });
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [signUpEmail, activeTab]);

  // Compute mascot state, pose, and mood for both desktop stage and mobile compact header
  const getMascotPresentation = () => {
    if (mascotEvent === 'signin_success') {
      return { bubbleState: 'signin_success', pose: 'idle', mood: 'celebrate' };
    }
    if (mascotEvent === 'signup_success') {
      return { bubbleState: 'signup_success', pose: 'idle', mood: 'celebrate' };
    }
    if (mascotEvent === 'error') {
      return { bubbleState: 'error', pose: 'idle', mood: 'error' };
    }

    if (focusedField === 'signin-password') {
      return {
        bubbleState: showSignInPassword ? 'peek' : 'password',
        pose: showSignInPassword ? 'peek' : 'password',
        mood: 'friendly',
      };
    }
    if (focusedField === 'signup-password') {
      return {
        bubbleState: showSignUpPassword ? 'peek' : 'password',
        pose: showSignUpPassword ? 'peek' : 'password',
        mood: 'friendly',
      };
    }
    if (focusedField === 'signup-confirm') {
      return {
        bubbleState: showConfirmPassword ? 'peek' : 'password',
        pose: showConfirmPassword ? 'peek' : 'password',
        mood: 'friendly',
      };
    }
    if (focusedField === 'email') {
      return { bubbleState: 'email', pose: 'focus-text', mood: 'friendly' };
    }
    if (focusedField === 'name') {
      return { bubbleState: 'idle', pose: 'focus-text', mood: 'friendly' };
    }
    return { bubbleState: 'idle', pose: 'idle', mood: 'friendly' };
  };

  const { bubbleState, pose: mascotPose, mood: mascotMood } = getMascotPresentation();

  const handleFieldFocus = (fieldKey) => {
    setFocusedField(fieldKey);
    if (skipNextFocusResetRef.current) {
      skipNextFocusResetRef.current = false;
      return;
    }
    if (mascotEvent !== 'none') {
      setMascotEvent('none');
    }
  };

  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  const handleTabSwitch = (nextTab) => {
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    setError('');
    if (nextTab === 'register') {
      setSuccessMessage('');
    }
    setMascotEvent('none');
    setFocusedField(null);
  };

  const handleTabKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const targetTab = activeTab === 'login' ? 'register' : 'login';
      handleTabSwitch(targetTab);
      if (targetTab === 'login') {
        signInTabRef.current?.focus();
      } else {
        createAccountTabRef.current?.focus();
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleTabSwitch('login');
      signInTabRef.current?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      handleTabSwitch('register');
      createAccountTabRef.current?.focus();
    }
  };

  const handleSignInSubmit = async (e) => {
    e?.preventDefault();
    if (!signInEmail.trim() || !signInPassword) {
      setError('Please provide both your university email and password.');
      setMascotEvent('error');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    setMascotEvent('none');

    try {
      const loggedInUser = await login(signInEmail.trim().toLowerCase(), signInPassword);
      setMascotEvent('signin_success');
      addToast(`Welcome back, ${loggedInUser.fullName}!`, 'success');
      navigate(getAuthenticatedRedirectPath(loggedInUser, searchParams.get('redirect') || ''));
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      setMascotEvent('error');
    } finally {
      setSubmitting(false);
    }
  };

  // Sign Up Validation
  const normalizedSignUpName = fullName.trim();
  const normalizedSignUpEmail = signUpEmail.trim().toLowerCase();
  const nameError =
    touchedSignUp.fullName && normalizedSignUpName.length < 2
      ? 'Full name must be at least 2 characters.'
      : '';
  const emailFormatError =
    touchedSignUp.email && !EMAIL_REGEX.test(normalizedSignUpEmail)
      ? 'Please enter a valid university email address.'
      : '';
  const passwordStrength = getPasswordStrengthDetails(signUpPassword);
  const passwordError =
    touchedSignUp.password && signUpPassword.length < 8
      ? 'Password must be at least 8 characters.'
      : '';
  const confirmPasswordError =
    touchedSignUp.confirmPassword && confirmPassword !== signUpPassword
      ? 'Passwords do not match.'
      : '';
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === signUpPassword;

  const campusResolvedOrPersonal =
    (resolveState.status === 'resolved' && Boolean(resolveState.campus?.id)) ||
    (resolveState.status === 'not_found' && usePersonalAccount);

  const isSignUpValid =
    normalizedSignUpName.length >= 2 &&
    EMAIL_REGEX.test(normalizedSignUpEmail) &&
    campusResolvedOrPersonal &&
    signUpPassword.length >= 8 &&
    passwordsMatch;

  const handleSignUpSubmit = async (e) => {
    e?.preventDefault();
    setTouchedSignUp({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isSignUpValid) {
      setMascotEvent('error');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMessage('');
    setMascotEvent('none');

    try {
      const accountTypePayload =
        resolveState.status === 'not_found' && usePersonalAccount ? 'PERSONAL' : undefined;

      if (typeof contextRegister === 'function') {
        await contextRegister({
          fullName: normalizedSignUpName,
          email: normalizedSignUpEmail,
          password: signUpPassword,
          ...(accountTypePayload ? { accountType: accountTypePayload } : {}),
        });
      } else {
        const res = await fetch('/api/v1/auth/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: normalizedSignUpName,
            email: normalizedSignUpEmail,
            password: signUpPassword,
            ...(accountTypePayload ? { accountType: accountTypePayload } : {}),
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error?.message || 'Could not create account.');
        }
      }

      skipNextFocusResetRef.current = true;
      setMascotEvent('signup_success');
      setSuccessMessage('Account created. Sign in to continue.');
      setSignInEmail(normalizedSignUpEmail);
      setSignInPassword('');
      setSignUpPassword('');
      setConfirmPassword('');
      setActiveTab('login');
      setFocusedField(null);

      requestAnimationFrame(() => {
        signInPasswordRef.current?.focus();
      });
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
      setMascotEvent('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuthClick = (provider) => {
    window.location.href = `/api/v1/auth/${provider}`;
  };

  const showGoogle = Boolean(providers.google?.enabled);
  const showGithub = Boolean(providers.github?.enabled);
  const hasAnyProvider = showGoogle || showGithub;

  const segmentColors = ['bg-coral-500', 'bg-sunshine-500', 'bg-brand-500', 'bg-mint-500'];

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-canvas">
      {/* LEFT PANEL: Form on Soft Canvas with faint grid */}
      <main
        ref={leftPanelRef}
        className="auth-canvas-grid text-ink flex flex-col justify-between px-6 py-4 sm:py-6 sm:px-12 lg:px-16 xl:px-20 min-h-screen lg:min-h-0 lg:h-full overflow-y-auto"
      >
        <div className="w-full max-w-[420px] mx-auto flex flex-col flex-1 justify-between">
          {/* Top Bar: Logo lockup left + Back to overview right */}
          <header className="flex items-center justify-between gap-4 pb-3">
            <Link
              to="/"
              aria-label="ClubRelay home"
              className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <BrandLockup size="sm" variant="color" />
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-brand-600 transition-colors px-2 py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Back to overview</span>
            </Link>
          </header>

          {/* Center Form Block */}
          <div className="my-auto py-2">
            {/* Mobile Compact Mascot + Speech Bubble (only rendered below 1024px) */}
            {!isDesktop && (
              <div className="flex flex-col items-center mb-4">
                <MascotSpeechBubble mascotState={bubbleState} className="mb-3.5" />
                <RelayMascot
                  size="mobile"
                  interactive
                  idleFloat={false}
                  containerRef={leftPanelRef}
                  mood={mascotMood}
                  pose={mascotPose}
                />
              </div>
            )}

            {/* Dynamic Heading */}
            <div className="mb-5">
              <h1 className="font-heading text-2xl sm:text-[28px] font-extrabold text-ink tracking-tight leading-tight">
                {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="mt-1 text-sm text-ink-600 font-medium">
                {activeTab === 'login'
                  ? 'Sign in to your club workspace.'
                  : 'Use your university email to get started.'}
              </p>
            </div>

            {/* Accessible Mode Tabs */}
            <div
              role="tablist"
              aria-label="Authentication mode"
              onKeyDown={handleTabKeyDown}
              className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-subtle border border-border mb-5"
            >
              <button
                ref={signInTabRef}
                id="tab-signin"
                type="button"
                role="tab"
                aria-selected={activeTab === 'login'}
                aria-controls="panel-signin"
                tabIndex={activeTab === 'login' ? 0 : -1}
                onClick={() => handleTabSwitch('login')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  activeTab === 'login'
                    ? 'bg-white text-ink shadow-subtle'
                    : 'text-ink-600 hover:text-ink'
                }`}
              >
                Sign in
              </button>
              <button
                ref={createAccountTabRef}
                id="tab-register"
                type="button"
                role="tab"
                aria-selected={activeTab === 'register'}
                aria-controls="panel-register"
                tabIndex={activeTab === 'register' ? 0 : -1}
                onClick={() => handleTabSwitch('register')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  activeTab === 'register'
                    ? 'bg-white text-ink shadow-subtle'
                    : 'text-ink-600 hover:text-ink'
                }`}
              >
                Create account
              </button>
            </div>

            {/* Single Inline Status / Error Region */}
            <div aria-live="polite" className="mb-1">
              {successMessage && (
                <div
                  role="status"
                  className="mb-4 p-3 rounded-xl bg-mint-50 border border-mint-200 text-xs text-mint-800 font-medium flex items-start gap-2 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{successMessage}</span>
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-xl bg-coral-50 border border-coral-200 text-xs text-coral-800 font-medium flex items-start gap-2 leading-relaxed"
                >
                  <AlertCircle className="w-4 h-4 text-coral-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Sign In Tab Panel */}
            {activeTab === 'login' && (
              <div id="panel-signin" role="tabpanel" aria-labelledby="tab-signin">
                {hasAnyProvider && (
                  <>
                    <div className="space-y-2.5">
                      {showGoogle && (
                        <button
                          type="button"
                          onClick={() => handleOAuthClick('google')}
                          className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-border bg-white hover:bg-subtle text-ink text-xs font-semibold whitespace-nowrap transition-colors duration-150 shadow-subtle cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
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
                          <span>Continue with Google</span>
                        </button>
                      )}

                      {showGithub && (
                        <button
                          type="button"
                          onClick={() => handleOAuthClick('github')}
                          className="w-full h-12 flex items-center justify-center gap-3 px-4 rounded-xl border border-ink-800 bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold whitespace-nowrap transition-colors duration-150 shadow-subtle cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                        >
                          <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                            />
                          </svg>
                          <span>Continue with GitHub</span>
                        </button>
                      )}
                    </div>

                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-canvas px-3 text-ink-600 font-medium">
                          Or institutional credentials
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <form className="space-y-4" onSubmit={handleSignInSubmit} noValidate>
                  <div>
                    <label htmlFor="signin-email" className="block text-xs font-semibold text-ink-700 mb-1.5">
                      University Email
                    </label>
                    <input
                      id="signin-email"
                      type="email"
                      value={signInEmail}
                      onChange={(e) => {
                        setSignInEmail(e.target.value);
                        if (error) setError('');
                        if (mascotEvent === 'error') setMascotEvent('none');
                      }}
                      onFocus={() => handleFieldFocus('email')}
                      onBlur={handleFieldBlur}
                      placeholder="name@university.edu"
                      required
                      autoComplete="email"
                      className="w-full h-12 rounded-xl bg-white border border-border px-3.5 text-sm text-ink placeholder:text-ink-300 transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                    />
                  </div>

                  <div>
                    <label htmlFor="signin-password" className="block text-xs font-semibold text-ink-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        ref={signInPasswordRef}
                        id="signin-password"
                        type={showSignInPassword ? 'text' : 'password'}
                        value={signInPassword}
                        onChange={(e) => {
                          setSignInPassword(e.target.value);
                          if (error) setError('');
                          if (mascotEvent !== 'none') setMascotEvent('none');
                        }}
                        onFocus={() => handleFieldFocus('signin-password')}
                        onBlur={handleFieldBlur}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        className="w-full h-12 rounded-xl bg-white border border-border pl-3.5 pr-11 text-sm text-ink placeholder:text-ink-300 transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword((prev) => !prev)}
                        aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-ink-600 hover:text-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {showSignInPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-ink-600 font-medium">
                    Forgot password? Coming soon
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-subtle transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                    <span>{submitting ? 'Signing in...' : 'Sign In to Workspace'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* Create Account Tab Panel */}
            {activeTab === 'register' && (
              <div id="panel-register" role="tabpanel" aria-labelledby="tab-register">
                <form className="space-y-3" onSubmit={handleSignUpSubmit} noValidate>
                  <div>
                    <label htmlFor="signup-name" className="block text-xs font-semibold text-ink-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="signup-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (error) setError('');
                      }}
                      onFocus={() => handleFieldFocus('name')}
                      onBlur={() => {
                        handleFieldBlur();
                        setTouchedSignUp((prev) => ({ ...prev, fullName: true }));
                      }}
                      placeholder="Jordan Builder"
                      required
                      autoComplete="name"
                      aria-invalid={Boolean(nameError)}
                      aria-describedby={nameError ? 'signup-name-error' : undefined}
                      className="w-full h-12 rounded-xl bg-white border border-border px-3.5 text-sm text-ink placeholder:text-ink-300 transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                    />
                    {nameError && (
                      <p id="signup-name-error" className="mt-1 text-xs text-coral-700 font-medium">
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="block text-xs font-semibold text-ink-700 mb-1">
                      University Email
                    </label>
                    <input
                      id="signup-email"
                      type="email"
                      value={signUpEmail}
                      onChange={(e) => {
                        setSignUpEmail(e.target.value);
                        if (error) setError('');
                      }}
                      onFocus={() => handleFieldFocus('email')}
                      onBlur={() => {
                        handleFieldBlur();
                        setTouchedSignUp((prev) => ({ ...prev, email: true }));
                      }}
                      placeholder="name@university.edu"
                      required
                      autoComplete="email"
                      aria-invalid={Boolean(emailFormatError || resolveState.status === 'not_found')}
                      aria-describedby="signup-email-status"
                      className="w-full h-12 rounded-xl bg-white border border-border px-3.5 text-sm text-ink placeholder:text-ink-300 transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                    />
                    <div id="signup-email-status" className="mt-1 min-h-[18px] text-xs">
                      {emailFormatError ? (
                        <p className="text-coral-700 font-medium">{emailFormatError}</p>
                      ) : resolveState.status === 'checking' ? (
                        <p className="text-ink-600">Checking campus domain...</p>
                      ) : resolveState.status === 'resolved' && resolveState.campus ? (
                        <p className="inline-flex items-center gap-1.5 text-mint-700 font-semibold">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{resolveState.campus.name}</span>
                        </p>
                      ) : resolveState.status === 'not_found' ? (
                        <div className="space-y-1.5">
                          <p className="text-coral-700 font-medium leading-snug">
                            Your campus is not on ClubRelay yet. Ask your club lead to get your campus set up.
                          </p>
                          <label className="inline-flex items-center gap-2 text-xs text-ink-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={usePersonalAccount}
                              onChange={(e) => setUsePersonalAccount(e.target.checked)}
                              className="rounded border-border text-brand-500 focus:ring-brand-500"
                            />
                            <span>Continue with a personal account and request campus setup inside</span>
                          </label>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="block text-xs font-semibold text-ink-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showSignUpPassword ? 'text' : 'password'}
                        value={signUpPassword}
                        onChange={(e) => {
                          setSignUpPassword(e.target.value);
                          if (error) setError('');
                        }}
                        onFocus={() => handleFieldFocus('signup-password')}
                        onBlur={() => {
                          handleFieldBlur();
                          setTouchedSignUp((prev) => ({ ...prev, password: true }));
                        }}
                        placeholder="Create a password (min. 8 chars)"
                        required
                        autoComplete="new-password"
                        aria-invalid={Boolean(passwordError)}
                        aria-describedby="signup-password-hint"
                        className="w-full h-12 rounded-xl bg-white border border-border pl-3.5 pr-11 text-sm text-ink placeholder:text-ink-300 transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword((prev) => !prev)}
                        aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-ink-600 hover:text-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>

                    {/* 4-segment strength meter */}
                    <div
                      className="grid grid-cols-4 gap-1.5 mt-2"
                      data-testid="password-strength-meter"
                      aria-hidden="true"
                    >
                      {[0, 1, 2, 3].map((segmentIdx) => {
                        const isActive = segmentIdx < passwordStrength.score;
                        const activeColor = segmentColors[passwordStrength.score - 1] || 'bg-coral-500';
                        return (
                          <span
                            key={segmentIdx}
                            className={`h-1.5 rounded-full transition-colors duration-150 ${
                              isActive ? activeColor : 'bg-border'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p
                      id="signup-password-hint"
                      className={`mt-1 text-xs font-medium ${
                        passwordError ? 'text-coral-700' : passwordStrength.tone
                      }`}
                    >
                      {passwordError || passwordStrength.label}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm-password"
                      className="block text-xs font-semibold text-ink-700 mb-1"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (error) setError('');
                        }}
                        onFocus={() => handleFieldFocus('signup-confirm')}
                        onBlur={() => {
                          handleFieldBlur();
                          setTouchedSignUp((prev) => ({ ...prev, confirmPassword: true }));
                        }}
                        placeholder="Re-enter your password"
                        required
                        autoComplete="new-password"
                        aria-invalid={Boolean(confirmPasswordError)}
                        aria-describedby="signup-confirm-status"
                        className="w-full h-12 rounded-xl bg-white border border-border pl-3.5 pr-11 text-sm text-ink placeholder:text-ink-300 transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-ink-600 hover:text-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <div id="signup-confirm-status" className="mt-1 min-h-[16px] text-xs">
                      {confirmPasswordError ? (
                        <p className="text-coral-700 font-medium">{confirmPasswordError}</p>
                      ) : passwordsMatch ? (
                        <p className="inline-flex items-center gap-1 text-mint-700 font-semibold">
                          <Check className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Passwords match</span>
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !isSignUpValid}
                    className="w-full h-12 mt-1 inline-flex items-center justify-center gap-2 font-semibold text-sm rounded-xl px-4 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-subtle transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                    <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Muted Footer */}
          <footer className="pt-4">
            <p className="text-xs text-ink-600 leading-normal">
              Multi-tenant institutional access. Protected under campus governance custody.
            </p>
          </footer>
        </div>
      </main>

      {/* RIGHT PANEL: Desktop Stage (1024px+ only, single DOM) */}
      {isDesktop && (
        <AuthStagePanel
          mascotState={bubbleState}
          pose={mascotPose}
          mood={mascotMood}
        />
      )}
    </div>
  );
}

export default Login;
