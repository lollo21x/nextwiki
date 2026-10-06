/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useCallback } from 'react';
import { X, Eye, EyeOff, User as UserIcon, Mail, Lock, Loader2 } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../src/services/firebase';
import { translations, LanguageCode } from '../utils/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  langParams?: typeof translations[LanguageCode];
}

// Google Icon Component
const GoogleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
    <path 
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
      fill="#4285F4"
    />
    <path 
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
      fill="#34A853"
    />
    <path 
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
      fill="#FBBC05"
    />
    <path 
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
      fill="#EA4335"
    />
  </svg>
);

// Input Component for Auth Modal
interface AuthInputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  disabled: boolean;
  error?: string;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

const AuthInput: React.FC<AuthInputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  disabled,
  error,
  showPasswordToggle,
  showPassword,
  onTogglePassword
}) => {
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`form-input-with-icon ${error ? 'has-error' : ''}`}>
      <div className="input-icon">{icon}</div>
      <input
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="form-input auth-input"
        autoComplete={type === 'password' ? 'current-password' : type}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="auth-password-toggle"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
};

// Main AuthModal Component
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, langParams }) => {
  const t = langParams || translations['en'];
  
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Close modal on escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Clear errors when switching tabs
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  // Clear form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(false);
    } else {
      // Reset form after closing
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setShowPassword(false);
      }, 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Email Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      setIsLoading(false);
      return;
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`.trim(),
      });
      onClose();
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error: any) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="modal-content auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="auth-modal-title" className="modal-title">
            <UserIcon size={20} />
            {activeTab === 'login' ? t.login : t.signup}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
            role="tab"
            aria-selected={activeTab === 'login'}
            aria-controls="login-panel"
          >
            {t.login}
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
            role="tab"
            aria-selected={activeTab === 'signup'}
            aria-controls="signup-panel"
          >
            {t.signup}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-md" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' ? (
          <form onSubmit={handleEmailLogin} className="auth-form">
            <AuthInput
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} color="var(--text-tertiary)" />}
              disabled={isLoading}
            />
            
            <AuthInput
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} color="var(--text-tertiary)" />}
              disabled={isLoading}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
            
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t.login}...
                </>
              ) : (
                t.login
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="auth-form">
            <div className="grid grid-cols-2 gap-sm">
              <AuthInput
                type="text"
                placeholder={t.firstName}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                icon={<UserIcon size={18} color="var(--text-tertiary)" />}
                disabled={isLoading}
              />
              <AuthInput
                type="text"
                placeholder={t.lastName}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                icon={<UserIcon size={18} color="var(--text-tertiary)" />}
                disabled={isLoading}
              />
            </div>
            
            <AuthInput
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} color="var(--text-tertiary)" />}
              disabled={isLoading}
            />
            
            <AuthInput
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} color="var(--text-tertiary)" />}
              disabled={isLoading}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
            
            <AuthInput
              type="password"
              placeholder={t.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={18} color="var(--text-tertiary)" />}
              disabled={isLoading}
              error={password !== confirmPassword && confirmPassword ? t.passwordsDoNotMatch : undefined}
            />
            
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={isLoading || !email.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || password !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t.signup}...
                </>
              ) : (
                t.signup
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="auth-divider my-lg" aria-hidden="true">
          <span>{t.or}</span>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="btn btn-outline w-full"
          disabled={isLoading}
        >
          <GoogleIcon />
          {t.signInWithGoogle}
        </button>
      </div>
    </div>
  );
};

// AlertCircle is not imported, but we need it for the error display
// Let's add it here
const AlertCircle: React.FC<{ size: number; className?: string }> = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
