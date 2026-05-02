import { useEffect, useState } from 'react';
import { X, User, Mail, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { UserProfile } from '../App';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (profile: UserProfile) => void;
}

export function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailReady, setEmailReady] = useState(false);
  const [passwordReady, setPasswordReady] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setLoading(false);
    setEmailReady(false);
    setPasswordReady(false);
  };

  useEffect(() => {
    resetForm();
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isForgotPassword) {
      setResetEmailSent(true);
      setTimeout(() => {
        resetForm();
      }, 3000);
      return;
    }

    try {
      setLoading(true);

      const url = isLogin
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/register';

      const body = isLogin
        ? { email, password }
        : { fullName: name, email, password };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Authentication failed');
        return;
      }

      if (!data.token) {
        setError('No token returned from server');
        return;
      }

      localStorage.setItem('token', data.token);

      const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        setError(profileData.message || 'Failed to fetch profile');
        return;
      }

      onLogin({
        name: profileData.name || profileData.fullName || name || email.split('@')[0],
        email: profileData.email || email,
        phone: profileData.phone || '',
        organization: profileData.organization || '',
      });

      resetForm();
      onClose();
    } catch (err) {
      setError('Cannot connect to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-gradient-to-br from-white to-amber-50/30 rounded-xl shadow-2xl relative animate-in fade-in zoom-in duration-200 border-2 border-amber-200">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-4 top-4"
          onClick={handleClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-900 rounded-full border-2 border-amber-900/30 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-2xl mb-2 text-amber-900">
              {isForgotPassword
                ? 'Reset Password'
                : isLogin
                  ? 'Welcome Back'
                  : 'Create Account'}
            </h2>

            <p className="text-sm text-amber-800/70">
              {isForgotPassword
                ? 'Enter your email to receive password reset instructions'
                : isLogin
                  ? 'Sign in to access your OCR history'
                  : 'Register to save your OCR history'}
            </p>
          </div>

          {resetEmailSent ? (
            <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-lg text-center">
              <div className="text-amber-800 mb-2">✓ Email Sent!</div>
              <p className="text-sm text-amber-900/70">
                Check your email for password reset instructions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
              {/* Decoy fields to reduce Chrome autofilling the real fields on modal open */}
              <input
                type="text"
                name="fake-username"
                autoComplete="username"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />
              <input
                type="password"
                name="fake-password"
                autoComplete="current-password"
                tabIndex={-1}
                aria-hidden="true"
                className="hidden"
              />

              {!isLogin && !isForgotPassword && (
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    name={isLogin ? 'login-email' : 'register-email'}
                    type="email"
                    autoComplete={isLogin ? 'username' : 'off'}
                    placeholder="Enter your email"
                    value={email}
                    readOnly={!emailReady}
                    onFocus={() => setEmailReady(true)}
                    onClick={() => setEmailReady(true)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      name={isLogin ? 'login-password' : 'new-password'}
                      type="password"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      placeholder="Enter your password"
                      value={password}
                      readOnly={!passwordReady}
                      onFocus={() => setPasswordReady(true)}
                      onClick={() => setPasswordReady(true)}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-amber-800 hover:bg-amber-900 text-white"
                disabled={loading}
              >
                {loading
                  ? 'Please wait...'
                  : isForgotPassword
                    ? 'Send Reset Link'
                    : isLogin
                      ? 'Sign In'
                      : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center space-y-2">
            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsLogin(!isLogin);
                }}
                className="text-sm text-blue-600 hover:underline block w-full"
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : 'Already have an account? Sign In'}
              </button>
            )}

            {isLogin && !isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsForgotPassword(true);
                }}
                className="text-sm text-gray-600 hover:text-blue-600 hover:underline block w-full"
              >
                Forgot your password?
              </button>
            )}

            {isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsLogin(true);
                }}
                className="text-sm text-blue-600 hover:underline block w-full"
              >
                Back to Sign In
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}