import React, { useState } from 'react';
import { X, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '../src/services/firebase';
import { translations } from '../utils/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  langParams?: typeof translations['en'];
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, langParams }) => {
  if (!isOpen) return null;
  const t = langParams || translations['en'];
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '420px', width: '90%', maxHeight: '85vh', overflow: 'auto', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '500', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserIcon size={20} />
            {activeTab === 'login' ? t.login : t.signup}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, border-color 0.2s ease'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'var(--surface)', borderRadius: '12px', padding: '4px', marginBottom: '1.5rem' }}>
          <button
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'login' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'login' ? 'var(--bg)' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('login')}
          >
            {t.login}
          </button>
          <button
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '0.9rem',
              fontWeight: '500',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: activeTab === 'signup' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'signup' ? 'var(--bg)' : 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('signup')}
          >
            {t.signup}
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--accent-red)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '48px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: 'var(--bg)',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'filter 0.2s ease, transform 0.2s ease'
              }}
            >
              {t.login}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              placeholder={t.firstName}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
            <input
              type="text"
              placeholder={t.lastName}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              required
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '48px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.confirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  paddingRight: '48px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--accent)',
                color: 'var(--bg)',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'filter 0.2s ease, transform 0.2s ease'
              }}
            >
              {t.signup}
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <span style={{ padding: '0 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.or}</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        </div>

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'background-color 0.2s ease, border-color 0.2s ease'
          }}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '16px', height: '16px' }} />
          {t.signInWithGoogle}
        </button>
      </div>
    </div>
  );
};
