import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldAlert, KeyRound, User as UserIcon, HelpCircle } from 'lucide-react';
import { loginUser, registerUser } from '../utils/mockDb';
import type { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (!isLogin && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);
    // Simulate minor network delay for premium loader appearance
    setTimeout(() => {
      if (isLogin) {
        const user = loginUser(username, password);
        if (user) {
          onAuthSuccess(user);
        } else {
          setError('Invalid username or password.');
          setIsLoading(false);
        }
      } else {
        const user = registerUser(username, name, password);
        if (user) {
          onAuthSuccess(user);
        } else {
          setError('Username already exists. Please choose another.');
          setIsLoading(false);
        }
      }
    }, 800);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const user = loginUser('demo', 'password');
      if (user) {
        onAuthSuccess(user);
      } else {
        setError('Demo account error.');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-circle-1"></div>
        <div className="auth-circle-2"></div>
      </div>

      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <LogIn size={28} />
            <span>Taskly</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? 'Manage projects with clarity and ease' : 'Join and start organizing your pipeline'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div className="auth-form-group animate-fade-in">
              <label className="auth-form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="glass-input"
                  style={{ paddingLeft: '42px' }}
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div className="auth-form-group">
            <label className="auth-form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                className="glass-input"
                style={{ paddingLeft: '42px' }}
                placeholder="Username (e.g. demo)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input
                type="password"
                className="glass-input"
                style={{ paddingLeft: '42px' }}
                placeholder={isLogin ? '••••••••' : 'Create password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="glass-btn" style={{ marginTop: '10px' }} disabled={isLoading}>
            {isLoading ? (
              <span className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg className="spinner" viewBox="0 0 50 50" style={{ width: '20px', height: '20px', animation: 'rotate 1.5s linear infinite' }}>
                  <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="80, 200" strokeDashoffset="0" strokeLinecap="round" />
                </svg>
                Processing...
              </span>
            ) : (
              <>
                {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              </>
            )}
          </button>
        </form>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Or</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)' }} />
        </div>

        <button
          onClick={handleDemoLogin}
          className="glass-btn-secondary"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          disabled={isLoading}
        >
          <HelpCircle size={18} style={{ color: 'var(--primary-color)' }} />
          <span>Explore with Demo Account</span>
        </button>

        <div className="auth-footer">
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="glass-btn-text"
            style={{ fontWeight: '700', padding: 0 }}
            disabled={isLoading}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }
        .spinner circle {
          stroke-linecap: round;
        }
      `}</style>
    </div>
  );
};
