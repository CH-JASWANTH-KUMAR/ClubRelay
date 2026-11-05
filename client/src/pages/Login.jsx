import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ShieldCheck, UserCheck, GraduationCap, Building2 } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('sarah.gdg@pcu.edu');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
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
        navigate('/campus');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      addToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 sm:px-6 lg:px-8 select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-forest-700 text-white font-bold text-xl shadow-subtle mb-3">
          CR
        </div>
        <h2 className="text-2xl font-bold text-charcoal-900 tracking-tight">ClubRelay</h2>
        <p className="mt-1 text-xs text-charcoal-500 font-medium">The work continues. The knowledge stays.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 sm:px-8 border border-border rounded-lg shadow-card">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {error}
              </div>
            )}

            <Input
              label="University Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </Button>
          </form>

          {/* Quick Demo Personas */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-400 mb-2">
              Instant Demo Logins (Pre-seeded)
            </p>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => setDemoUser('sarah.gdg@pcu.edu')}
                className={`text-left p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                  email === 'sarah.gdg@pcu.edu'
                    ? 'border-forest-700 bg-forest-50/70 text-forest-900 font-semibold'
                    : 'border-border bg-subtle text-charcoal-700 hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-forest-700" />
                  <span>Sarah Jenkins (Outgoing President · GDG)</span>
                </div>
                <span className="text-[10px] text-charcoal-400">Student</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('alex.incoming@pcu.edu')}
                className={`text-left p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                  email === 'alex.incoming@pcu.edu'
                    ? 'border-forest-700 bg-forest-50/70 text-forest-900 font-semibold'
                    : 'border-border bg-subtle text-charcoal-700 hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-forest-700" />
                  <span>Alex Rivera (Incoming President · GDG)</span>
                </div>
                <span className="text-[10px] text-charcoal-400">Student</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('advisor.chen@pcu.edu')}
                className={`text-left p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                  email === 'advisor.chen@pcu.edu'
                    ? 'border-forest-700 bg-forest-50/70 text-forest-900 font-semibold'
                    : 'border-border bg-subtle text-charcoal-700 hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
                  <span>Dr. Evelyn Chen (Faculty Coordinator)</span>
                </div>
                <span className="text-[10px] text-charcoal-400">Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('admin@pcu.edu')}
                className={`text-left p-2 rounded border text-xs flex items-center justify-between transition-colors ${
                  email === 'admin@pcu.edu'
                    ? 'border-forest-700 bg-forest-50/70 text-forest-900 font-semibold'
                    : 'border-border bg-subtle text-charcoal-700 hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-charcoal-700" />
                  <span>Dean Marcus Vance (Campus Administrator)</span>
                </div>
                <span className="text-[10px] text-charcoal-400">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
