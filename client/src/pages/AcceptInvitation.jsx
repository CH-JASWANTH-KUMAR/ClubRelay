import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { BrandLockup } from '../components/brand/BrandLockup';

export function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser, switchClub } = useAuth();
  const { addToast } = useToast();

  const initialToken = searchParams.get('token') || '';
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMessage, setErrorMessage] = useState('');
  const [acceptedResult, setAcceptedResult] = useState(null);

  useEffect(() => {
    if (!authLoading && !user && initialToken) {
      const target = `/invitations/accept?token=${encodeURIComponent(initialToken)}`;
      navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true });
    }
  }, [authLoading, user, initialToken, navigate]);

  const handleAccept = async (e) => {
    e?.preventDefault();
    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      setErrorMessage('Please paste your invitation token.');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');
    try {
      const res = await fetch('/api/v1/invitations/accept', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: cleanToken }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Unable to accept invitation.');
      }

      setAcceptedResult(json.data);
      setStatus('success');
      if (json.data?.club) {
        switchClub(json.data.club);
      }
      await refreshUser();
      addToast(`Joined ${json.data.club?.name || 'organization'}!`, 'success');
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-sm text-mutedSlate">
        Checking session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Link to="/onboarding">
            <BrandLockup />
          </Link>
        </div>

        <div className="rounded-2xl bg-surface border border-border shadow-card p-6 sm:p-8 space-y-5">
          {status === 'success' && acceptedResult ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-mint-50 text-mint-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-extrabold text-ink">
                  Welcome to {acceptedResult.club?.name}
                </h1>
                <p className="text-sm text-mutedSlate mt-1">
                  Your membership is active
                  {acceptedResult.assignedPositions?.length > 0
                    ? ` with ${acceptedResult.assignedPositions.map((p) => p.name).join(', ')}.`
                    : '.'}
                </p>
              </div>
              <Button
                className="w-full"
                onClick={() => navigate(`/clubs/${acceptedResult.club._id}`)}
              >
                <span>Open Organization Workspace</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-heading text-lg font-extrabold text-ink">Accept Invitation</h1>
                  <p className="text-xs text-mutedSlate">
                    Signed in as <span className="font-semibold text-ink">{user?.email}</span>
                  </p>
                </div>
              </div>

              {status === 'error' && errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-coral-50 border border-coral-200 text-xs text-coral-800">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="invite-token-input" className="block text-xs font-semibold text-ink mb-1.5">
                  Invitation Token
                </label>
                <input
                  id="invite-token-input"
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste your invitation token..."
                  className="w-full h-11 rounded-lg border border-border bg-white px-3 text-sm text-ink focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <Button type="submit" className="w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Verifying Invitation...</span>
                  </>
                ) : (
                  'Verify & Join Organization'
                )}
              </Button>

              <div className="text-center pt-1">
                <Link to="/onboarding" className="text-xs font-semibold text-brand-600 hover:underline">
                  Back to Onboarding Hub
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

