import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserCheck, GraduationCap, Building2 } from 'lucide-react';
import { RelayMascot } from '../components/brand/RelayMascot';

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
        <div className="flex justify-center mb-3">
          <RelayMascot size="md" interactive={true} />
        </div>
        <h2 className="font-heading text-3xl font-extrabold text-ink tracking-tight">ClubRelay</h2>
        <p className="mt-1 text-xs text-mutedSlate font-medium">The work continues. The knowledge stays.</p>
        <div className="mt-2">
          <Link to="/" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
            Return to overview
          </Link>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-surface py-8 px-6 sm:px-8 border border-border rounded-2xl shadow-card">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
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
            <p className="text-xs font-semibold text-mutedSlate mb-2">
              Instant Demo Logins (Pre-seeded)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser('sarah.gdg@pcu.edu')}
                className={`text-left p-2.5 rounded-xl border text-xs flex items-center justify-between whitespace-nowrap transition-colors ${
                  email === 'sarah.gdg@pcu.edu'
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-semibold'
                    : 'border-border bg-canvas text-ink hover:bg-subtle'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <UserCheck className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                  <span className="truncate">Sarah (GDG)</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 ml-2 flex-shrink-0">
                  President
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('alex.incoming@pcu.edu')}
                className={`text-left p-2.5 rounded-xl border text-xs flex items-center justify-between whitespace-nowrap transition-colors ${
                  email === 'alex.incoming@pcu.edu'
                    ? 'border-mint-500 bg-mint-50 text-mint-900 font-semibold'
                    : 'border-border bg-canvas text-ink hover:bg-subtle'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <UserCheck className="w-3.5 h-3.5 text-mint-600 flex-shrink-0" />
                  <span className="truncate">Alex (GDG)</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-mint-100 text-mint-800 ml-2 flex-shrink-0">
                  Incoming Lead
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('advisor.chen@pcu.edu')}
                className={`text-left p-2.5 rounded-xl border text-xs flex items-center justify-between whitespace-nowrap transition-colors ${
                  email === 'advisor.chen@pcu.edu'
                    ? 'border-sunshine-500 bg-sunshine-50 text-sunshine-900 font-semibold'
                    : 'border-border bg-canvas text-ink hover:bg-subtle'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <GraduationCap className="w-3.5 h-3.5 text-sunshine-700 flex-shrink-0" />
                  <span className="truncate">Dr. Chen</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sunshine-100 text-sunshine-800 ml-2 flex-shrink-0">
                  Faculty
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('admin@pcu.edu')}
                className={`text-left p-2.5 rounded-xl border text-xs flex items-center justify-between whitespace-nowrap transition-colors ${
                  email === 'admin@pcu.edu'
                    ? 'border-coral-500 bg-coral-50 text-coral-900 font-semibold'
                    : 'border-border bg-canvas text-ink hover:bg-subtle'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Building2 className="w-3.5 h-3.5 text-coral-600 flex-shrink-0" />
                  <span className="truncate">Dean Vance</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-coral-100 text-coral-800 ml-2 flex-shrink-0">
                  Admin
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

