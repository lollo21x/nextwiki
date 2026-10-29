/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { streamDefinition, generateImage, GenerationMode } from './services/geminiService';
import { OPENROUTER_API_URL, OPENROUTER_API_KEY } from './services/geminiService';
import ContentDisplay from './components/ContentDisplay';
import SearchBar from './components/SearchBar';
import LoadingSkeleton from './components/LoadingSkeleton';
import ImageDisplay from './components/ImageDisplay';
import HistoryDisplay from './components/HistoryDisplay';
import SettingsModal from './components/SettingsModal';
import LogoutModal from './components/LogoutModal';
import { AuthModal } from './components/AuthModal';
import ShareMenu from './components/ShareMenu';
import { useAuth } from './src/hooks/useAuth';
import { translations, LanguageCode, languageNameMap } from './utils/translations';
import { User, LogOut, Info, ScrollText, Share2, ArrowLeft, RefreshCw, Feather, X, ArrowUp, Sun, Moon, Settings as SettingsIcon } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './src/services/firebase';

// ===================================================================
// Utility Functions
// ===================================================================

const getTopicFromURL = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('q')?.trim() || '';
  }
  return '';
};

// ===================================================================
// Decorative Components: armillary backdrop, temple pediment, rule
// ===================================================================

const polar = (radius: number, degrees: number) => {
  const a = (degrees * Math.PI) / 180;
  return { x: +(Math.cos(a) * radius).toFixed(2), y: +(Math.sin(a) * radius).toFixed(2) };
};

/** An engraved armillary sphere that turns very slowly behind the homepage. */
const Backdrop: React.FC = () => (
  <div className="backdrop" aria-hidden="true">
    <svg className="backdrop-sphere" viewBox="-500 -500 1000 1000" fill="none" stroke="currentColor" focusable="false">
      <circle r="488" strokeWidth="1.4" />
      <circle r="466" strokeWidth="0.6" />
      <circle r="380" strokeWidth="0.8" />
      <circle r="300" strokeWidth="0.6" />
      <circle r="214" strokeWidth="1" />
      <circle r="130" strokeWidth="0.6" />
      <circle r="52" strokeWidth="0.8" />
      {Array.from({ length: 120 }, (_, i) => {
        const long = i % 5 === 0;
        const a = polar(long ? 444 : 454, i * 3);
        const b = polar(466, i * 3);
        return <line key={`t${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={long ? 1 : 0.6} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const a = polar(52, i * 30);
        const b = polar(380, i * 30);
        return <line key={`s${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth="0.5" />;
      })}
      <polygon points="300,0 0,300 -300,0 0,-300" strokeWidth="0.8" />
      <polygon points="212,212 -212,212 -212,-212 212,-212" strokeWidth="0.8" />
      {Array.from({ length: 12 }, (_, i) => {
        const c = polar(418, i * 30 + 15);
        return <circle key={`d${i}`} cx={c.x} cy={c.y} r="4" fill="currentColor" stroke="none" />;
      })}
      <g className="ring-b" strokeWidth="0.9">
        <ellipse rx="430" ry="150" transform="rotate(-23.5)" />
        <ellipse rx="430" ry="150" transform="rotate(23.5)" />
        <ellipse rx="430" ry="38" />
      </g>
    </svg>
  </div>
);

/** A line-drawn temple front. Each stroke is traced in on first paint. */
const Pediment: React.FC = () => {
  const columns = [30, 66, 102, 138, 174, 210];
  const dentils = Array.from({ length: 38 }, (_, i) => `M${12 + i * 6} 46V50`).join('');
  return (
    <svg viewBox="0 0 240 118" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path className="trace" pathLength={1} d="M8 41L120 7L232 41Z" />
      <path className="trace" pathLength={1} d="M28 37L120 15L212 37" strokeWidth="0.9" />
      <circle className="trace" pathLength={1} cx="120" cy="28" r="4.5" strokeWidth="1" />
      <path className="trace" pathLength={1} d="M112 7C114 0 126 0 128 7" strokeWidth="1.1" />
      <path className="trace" pathLength={1} d="M5 41H235V50H5Z" />
      <path className="trace" pathLength={1} d={dentils} strokeWidth="0.8" />
      {columns.map((x) => (
        <React.Fragment key={x}>
          <path className="trace trace-late" pathLength={1} d={`M${x - 10} 53H${x + 10}`} />
          <path className="trace trace-late" pathLength={1} d={`M${x - 7} 56H${x + 7}`} strokeWidth="1" />
          <path className="trace trace-late" pathLength={1} d={`M${x - 6} 56V98M${x + 6} 56V98`} />
          <path className="trace trace-late" pathLength={1} d={`M${x} 58V96`} strokeWidth="0.6" />
          <path className="trace trace-late" pathLength={1} d={`M${x - 9} 98H${x + 9}M${x - 10} 101H${x + 10}`} />
        </React.Fragment>
      ))}
      <path className="trace trace-late" pathLength={1} d="M4 105H236" />
      <path className="trace trace-late" pathLength={1} d="M0 109.5H240" />
      <path className="trace trace-late" pathLength={1} d="M-4 114H244" />
    </svg>
  );
};

/** Engraved rule with a lozenge. */
const Ornament: React.FC = () => (
  <div className="ornament" aria-hidden="true">
    <span className="ornament-gem" />
  </div>
);

// ===================================================================
// Theme Toggle Icon Component
// ===================================================================

const ThemeToggleIcon: React.FC<{ theme: string }> = ({ theme }) =>
  theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />;

// ===================================================================
// User Menu Dropdown Component
// ===================================================================

interface UserMenuProps {
  user: any;
  isMobile: boolean;
  isUserButtonHovered: boolean;
  setIsUserButtonHovered: (hovered: boolean) => void;
  setIsLogoutModalOpen: (open: boolean) => void;
  handleLogout: () => void;
  t: any;
}

const UserMenu: React.FC<UserMenuProps> = ({
  user,
  isMobile,
  isUserButtonHovered,
  setIsUserButtonHovered,
  setIsLogoutModalOpen,
  handleLogout,
  t
}) => {
  if (isMobile) {
    return (
      <button 
        onClick={() => setIsLogoutModalOpen(true)} 
        className="user-toggle no-print"
        aria-label={t.logoutConfirm || 'Logout'}
        data-tooltip={user.displayName || user.email?.split('@')[0] || 'User'}
      >
        <User size={18} />
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      onMouseEnter={() => setIsUserButtonHovered(true)}
      onMouseLeave={() => setIsUserButtonHovered(false)}
      className={`user-pill no-print ${isUserButtonHovered ? 'is-danger' : ''}`}
      aria-label={t.logoutConfirm || 'Logout'}
    >
      <User size={16} />
      <span className="user-name-text">{user.displayName || user.email?.split('@')[0] || 'User'}</span>
      {isUserButtonHovered && <LogOut size={16} />}
    </button>
  );
};

// ===================================================================
// Header Component
// ===================================================================

interface HeaderProps {
  isHomePage: boolean;
  isScrolled: boolean;
  handleHomeClick: () => void;
  handleTopicChange: (topic: string) => void;
  isLoading: boolean;
  user: any;
  isMobile: boolean;
  isUserButtonHovered: boolean;
  setIsUserButtonHovered: (hovered: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsLogoutModalOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  handleLogout: () => void;
  toggleTheme: () => void;
  theme: string;
  showHubBack: boolean;
  t: any;
}

const Header: React.FC<HeaderProps> = ({
  isHomePage,
  isScrolled,
  handleHomeClick,
  handleTopicChange,
  isLoading,
  user,
  isMobile,
  isUserButtonHovered,
  setIsUserButtonHovered,
  setIsAuthModalOpen,
  setIsLogoutModalOpen,
  setIsSettingsOpen,
  handleLogout,
  toggleTheme,
  theme,
  showHubBack,
  t
}) => {
  return (
    <header className={`app-header ${isHomePage ? 'is-home' : ''} ${!isHomePage && isScrolled ? 'sticky-scrolled' : ''}`}>
      <div
        className="logo-container"
        onClick={handleHomeClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleHomeClick(); } }}
        role="button"
        tabIndex={0}
        aria-label="nextwiki"
      >
        <div className="logo-image" aria-hidden="true" />
        <span className="logo-wordmark">nextwiki</span>
      </div>

      {/* Compact search bar that appears when scrolled */}
      {!isHomePage && (
        <div className="header-search-compact">
          <SearchBar onSearch={handleTopicChange} isLoading={isLoading} placeholder={t.search} />
        </div>
      )}

      <div className="header-controls">
        <button 
          onClick={() => window.open('https://privacy.dootinc.dpdns.org', '_blank')} 
          className="info-toggle no-print"
          aria-label={t.or || 'Privacy Policy'}
          data-tooltip="Privacy Policy"
        >
          <Info size={18} />
        </button>
        
        {showHubBack && (
          <button 
            onClick={() => window.location.href = 'https://hub4d.lollo.dpdns.org/'} 
            className="info-toggle no-print"
            aria-label="Back to Hub"
            data-tooltip="Back to Hub"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        
        {user ? (
          <UserMenu
            user={user}
            isMobile={isMobile}
            isUserButtonHovered={isUserButtonHovered}
            setIsUserButtonHovered={setIsUserButtonHovered}
            setIsLogoutModalOpen={setIsLogoutModalOpen}
            handleLogout={handleLogout}
            t={t}
          />
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)} 
            className="user-toggle no-print"
            aria-label="User account"
            data-tooltip="Login"
          >
            <User size={18} />
          </button>
        )}
        
        <button 
          onClick={toggleTheme} 
          className="theme-toggle header-theme-toggle no-print"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          data-tooltip={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <ThemeToggleIcon theme={theme} />
        </button>
        
        <button 
          onClick={() => setIsSettingsOpen(true)} 
          className="settings-toggle no-print"
          aria-label="Open settings"
          data-tooltip="Settings"
        >
          <SettingsIcon size={18} />
        </button>
      </div>
    </header>
  );
};

// ===================================================================
// Homepage Component
// ===================================================================

interface HomepageProps {
  handleTopicChange: (topic: string) => void;
  history: string[];
  handleDeleteHistoryItem: (topic: string) => void;
  t: any;
}

const Homepage: React.FC<HomepageProps> = ({
  handleTopicChange,
  history,
  handleDeleteHistoryItem,
  t
}) => {
  return (
    <div className="homepage">
      <Backdrop />

      <div className="homepage-frame">
        <div className="homepage-brand">
          <div className="homepage-logo" aria-label="NextWiki Logo" role="img">
            <Pediment />
          </div>
          <h1 className="homepage-title">next<span className="title-accent">wiki</span></h1>
          <p className="homepage-tenets" aria-hidden="true">
            <span>Scientia</span><i /><span>Sapientia</span><i /><span>Ratio</span>
          </p>
        </div>

        <Ornament />

        <div className="homepage-search-container">
          <SearchBar
            onSearch={handleTopicChange}
            isLoading={false}
            placeholder={t.search}
            typingWords={t.placeholderPool}
          />
        </div>

        <p className="homepage-motto" aria-hidden="true">Sapere aude</p>
      </div>

      {history.length > 0 && (
        <div className="homepage-history">
          <HistoryDisplay 
            history={history} 
            onHistoryClick={handleTopicChange} 
            onDeleteHistoryItem={handleDeleteHistoryItem} 
            title={t.recent} 
          />
        </div>
      )}
    </div>
  );
};

// ===================================================================
// Article View Component
// ===================================================================

interface ArticleViewProps {
  currentTopic: string;
  content: string;
  isLoading: boolean;
  error: string | null;
  imageUrl: string | null;
  imageError: string | null;
  generationTime: number | null;
  isScrolled: boolean;
  history: string[];
  handleTopicChange: (topic: string) => void;
  handleDeleteHistoryItem: (topic: string) => void;
  handleRetry: () => void;
  handleExtendContent: () => void;
  isExtending: boolean;
  isAskMoreOpen: boolean;
  setIsAskMoreOpen: (open: boolean) => void;
  askMoreQuery: string;
  setAskMoreQuery: (query: string) => void;
  askMoreResponse: string;
  handleAskMore: (question: string) => void;
  isAskMoreLoading: boolean;
  setIsShareMenuOpen: (open: boolean) => void;
  t: any;
  isMobile: boolean;
}

const ArticleView: React.FC<ArticleViewProps> = ({
  currentTopic,
  content,
  isLoading,
  error,
  imageUrl,
  imageError,
  generationTime,
  isScrolled,
  history,
  handleTopicChange,
  handleDeleteHistoryItem,
  handleRetry,
  handleExtendContent,
  isExtending,
  isAskMoreOpen,
  setIsAskMoreOpen,
  askMoreQuery,
  setAskMoreQuery,
  askMoreResponse,
  handleAskMore,
  isAskMoreLoading,
  setIsShareMenuOpen,
  t,
  isMobile
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (askMoreQuery.trim()) {
      handleAskMore(askMoreQuery.trim());
    }
  };

  return (
    <>
      <div className={`main-search-wrapper ${isScrolled ? 'hidden' : ''}`}>
        <SearchBar onSearch={handleTopicChange} isLoading={isLoading} placeholder={t.search} />
      </div>

      <main className="article-page">
        <HistoryDisplay history={history} onHistoryClick={handleTopicChange} onDeleteHistoryItem={handleDeleteHistoryItem} title={t.recent} />

        <article className="article">
          <header className="article-head" key={currentTopic}>
            <span className="article-kicker caps" aria-hidden="true">Lemma</span>
            <h1 className="article-title">
              {currentTopic}
            </h1>
            <Ornament />
          </header>

          <div className="article-grid">
          <div className="article-body">

            {error && (
              <div className="error-box" role="alert">
                <p className="error-title">An Error Occurred</p>
                <p className="error-detail">{error}</p>
              </div>
            )}

            {isLoading && content.length === 0 && !error && <LoadingSkeleton />}

            {content.length > 0 && !error && (
              <>
                <ContentDisplay
                  content={content}
                  isLoading={isLoading || isExtending}
                  onWordClick={handleTopicChange}
                  isExtending={isExtending}
                />
                {!isLoading && !isExtending && (
                  <>
                    <div className="action-buttons">
                      <button
                        onClick={handleRetry}
                        className="more-button"
                        aria-label={t.retry}
                      >
                        <RefreshCw size={18} />
                        <span>{t.retry}</span>
                      </button>
                      <button
                        onClick={handleExtendContent}
                        className="more-button"
                        disabled={isExtending}
                        aria-label={isExtending ? t.extending : t.more}
                      >
                        <ScrollText size={18} />
                        <span>{isExtending ? t.extending : t.more}</span>
                      </button>
                      <button
                        onClick={() => {
                          if (isAskMoreOpen) {
                            setIsAskMoreOpen(false);
                            setAskMoreQuery('');
                          } else {
                            setIsAskMoreOpen(true);
                          }
                        }}
                        className={`more-button ${isAskMoreOpen ? 'is-active' : ''}`}
                        aria-label={isAskMoreOpen ? t.close : t.askMore}
                        aria-pressed={isAskMoreOpen}
                      >
                        {isAskMoreOpen ? <X size={18} /> : <Feather size={18} />}
                        <span>{isAskMoreOpen ? t.close : t.askMore}</span>
                      </button>
                      <button
                        onClick={() => setIsShareMenuOpen(true)}
                        className="share-button"
                        aria-label={t.share}
                      >
                        <Share2 size={18} />
                        <span>{t.share}</span>
                      </button>
                    </div>

                    {isAskMoreOpen && (
                      <div className="ask-more">
                        <form onSubmit={handleSubmit} className="ask-form">
                          <Feather size={18} />
                          <input
                            type="text"
                            value={askMoreQuery}
                            onChange={(e) => setAskMoreQuery(e.target.value)}
                            placeholder={t.askMorePlaceholder}
                            disabled={isAskMoreLoading}
                            className="ask-input"
                            autoFocus
                            enterKeyHint="send"
                            aria-label={t.askMorePlaceholder}
                          />
                          <button
                            type="submit"
                            className="ask-send"
                            disabled={isAskMoreLoading || !askMoreQuery.trim()}
                            aria-label={t.askMore}
                          >
                            <ArrowUp size={20} />
                          </button>
                        </form>
                        {(askMoreResponse || isAskMoreLoading) && (
                          <div className="ask-answer">
                            {askMoreResponse}
                            {isAskMoreLoading && <span className="blinking-cursor">|</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {!isLoading && !error && content.length === 0 && (
              <div className="empty-state">
                <p>Content could not be generated.</p>
              </div>
            )}
          </div>

          <aside className="article-media">
            <ImageDisplay imageUrl={imageUrl} topic={currentTopic} isLoading={isLoading && !imageUrl} error={imageError} />
          </aside>
          </div>
        </article>
      </main>
    </>
  );
};

// ===================================================================
// Footer Component
// ===================================================================

interface FooterProps {
  t: any;
  generationTime: number | null;
  isMobile: boolean;
}

const Footer: React.FC<FooterProps> = ({ t, generationTime, isMobile }) => {
  return (
    <footer className="app-footer no-print">
      <p className="footer-text">
        {t.madeBy} <a href="http://lollo.dpdns.org" target="_blank" rel="noopener noreferrer">lollo21</a>
      </p>
      <p className="footer-meta">
        {!isMobile && <span>{t.generatedBy}</span>}
        {generationTime && <span className="footer-time">{Math.round(generationTime)}ms</span>}
      </p>
    </footer>
  );
};

// ===================================================================
// Main App Component
// ===================================================================

const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<string>(getTopicFromURL);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // --- Settings State ---
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accentColor') || 'default');
  const [language, setLanguage] = useState<LanguageCode>(() => (localStorage.getItem('language') || 'en') as LanguageCode);
  const [generationMode, setGenerationMode] = useState<GenerationMode>(() => (localStorage.getItem('generationMode') || 'encyclopedia') as GenerationMode);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // --- Auth State ---
  const { user, isLoading: authLoading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isUserButtonHovered, setIsUserButtonHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // --- Share and Extend State ---
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [showHubBack, setShowHubBack] = useState(false);

  // --- Ask More State ---
  const [isAskMoreOpen, setIsAskMoreOpen] = useState(false);
  const [askMoreQuery, setAskMoreQuery] = useState('');
  const [askMoreResponse, setAskMoreResponse] = useState('');
  const [isAskMoreLoading, setIsAskMoreLoading] = useState(false);

  const isHomePage = currentTopic === '';
  const t = translations[language];

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('searchHistory');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setHistory([]);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(history));
    }
  }, [history]);

  // Check if coming from hub
  useEffect(() => {
    if (document.referrer.includes('hub4d.lollo.dpdns.org')) {
      setShowHubBack(true);
    }
  }, []);

  // Theme management
  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151210' : '#F2EBDA');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Accent color management
  useEffect(() => {
    document.documentElement.setAttribute('data-accent-color', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  // Language management
  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Generation mode management
  useEffect(() => {
    localStorage.setItem('generationMode', generationMode);
  }, [generationMode]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentTopic(getTopicFromURL());
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Scroll detection for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Handle topic change
  const handleTopicChange = useCallback((topic: string) => {
    const newTopic = topic.trim();
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      // Update URL without page reload
      const url = new URL(window.location.toString());
      url.searchParams.set('q', newTopic);
      window.history.pushState({ topic: newTopic }, '', url);

      setCurrentTopic(newTopic);

      setHistory(prevHistory => {
        const normalizedNewTopic = newTopic.toLowerCase();
        const filteredHistory = prevHistory.filter(item => item.toLowerCase() !== normalizedNewTopic);
        const updatedHistory = [newTopic, ...filteredHistory];
        return updatedHistory.slice(0, 10);
      });
    }
  }, [currentTopic]);

  // Delete history item
  const handleDeleteHistoryItem = useCallback((topicToRemove: string) => {
    setHistory(prevHistory => prevHistory.filter(item => item !== topicToRemove));
  }, []);

  // Handle home click
  const handleHomeClick = () => {
    const url = new URL(window.location.toString());
    url.searchParams.delete('q');
    window.history.pushState({}, '', url);
    setCurrentTopic('');
  };

  // Fetch content and image
  useEffect(() => {
    if (!currentTopic) {
      // Homepage: reset content state
      setContent('');
      setIsLoading(false);
      setError(null);
      setImageUrl(null);
      setImageError(null);
      setGenerationTime(null);
      return;
    }

    let isCancelled = false;

    const fetchContentAndImage = async () => {
      setIsLoading(true);
      setError(null);
      setImageError(null);
      setContent('');
      setImageUrl(null);
      setGenerationTime(null);
      const startTime = performance.now();

      generateImage(currentTopic, language)
        .then(url => { if (!isCancelled) setImageUrl(url); })
        .catch(err => {
          if (!isCancelled) {
            const msg = err instanceof Error ? err.message : 'Failed to generate image.';
            console.error(msg);
            setImageError(msg);
          }
        });

      let accumulatedContent = '';
      try {
        for await (const chunk of streamDefinition(currentTopic, language, generationMode)) {
          if (isCancelled) break;
          if (chunk.startsWith('Error:')) throw new Error(chunk);
          accumulatedContent += chunk;
          if (!isCancelled) setContent(accumulatedContent);
        }
      } catch (e: unknown) {
        if (!isCancelled) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
          setError(errorMessage);
          setContent('');
          console.error(e);
        }
      } finally {
        if (!isCancelled) {
          const endTime = performance.now();
          setGenerationTime(endTime - startTime);
          setIsLoading(false);
        }
      }
    };

    fetchContentAndImage();

    return () => { isCancelled = true; };
  }, [currentTopic, language, generationMode]);

  // Handle extend content
  const handleExtendContent = useCallback(async () => {
    if (isExtending || !content) return;

    setIsExtending(true);
    const startTime = performance.now();

    let extendedContent = content;
    let isFirstChunk = true;
    try {
      const extendPrompt = `Continue the explanation of "${currentTopic}" from where it left off. Provide additional detailed information, examples, or related aspects. Keep the same style and format. Do not respond as a chatbot - continue seamlessly as if this were part of the original article. Do not use any formatting like asterisks for bold text or other markdown elements.`;
      const prompt = `${extendPrompt} The response must be in ${languageNameMap[language] || 'English'}. Be informative. Do not use markdown, titles, or any special formatting. Respond with only the text of the response itself.`;

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Could not get response body reader.');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            if (jsonStr === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const chunk = parsed.choices[0]?.delta?.content;
              if (chunk) {
                if (isFirstChunk) {
                  extendedContent += ' ' + chunk;
                  isFirstChunk = false;
                } else {
                  extendedContent += chunk;
                }
                setContent(extendedContent);
              }
            } catch (e) {
              console.error('Failed to parse stream chunk:', jsonStr, e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error extending content:', e);
    } finally {
      const endTime = performance.now();
      setGenerationTime(prev => prev ? prev + (endTime - startTime) : (endTime - startTime));
      setIsExtending(false);
    }
  }, [content, currentTopic, language, isExtending]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (!currentTopic || isLoading) return;
    setContent('');
    setIsLoading(true);
    setError(null);
    setImageError(null);
    setGenerationTime(null);
    setIsAskMoreOpen(false);
    setAskMoreResponse('');
    setAskMoreQuery('');

    let isCancelled = false;
    const startTime = performance.now();

    (async () => {
      let accumulatedContent = '';
      try {
        for await (const chunk of streamDefinition(currentTopic, language, generationMode)) {
          if (isCancelled) break;
          if (chunk.startsWith('Error:')) throw new Error(chunk);
          accumulatedContent += chunk;
          if (!isCancelled) setContent(accumulatedContent);
        }
      } catch (e: unknown) {
        if (!isCancelled) {
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
          setError(errorMessage);
          setContent('');
          console.error(e);
        }
      } finally {
        if (!isCancelled) {
          const endTime = performance.now();
          setGenerationTime(endTime - startTime);
          setIsLoading(false);
        }
      }
    })();
  }, [currentTopic, language, generationMode, isLoading]);

  // Handle ask more
  const handleAskMore = useCallback(async (question: string) => {
    if (!question.trim() || isAskMoreLoading || !content) return;

    setIsAskMoreLoading(true);
    setAskMoreResponse('');

    try {
      const prompt = `The user was reading an article about "${currentTopic}". Here is the article content:\n\n${content.substring(0, 2000)}\n\nThe user now asks: "${question}"\n\nProvide a brief, concise answer (2-3 sentences max) in ${languageNameMap[language] || 'English'}. Do not use markdown, titles, or any special formatting. Respond with only the text of the response itself.`;

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [{ role: 'user', content: prompt }],
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Could not get response body reader.');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.substring(6);
            if (jsonStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(jsonStr);
              const chunk = parsed.choices[0]?.delta?.content;
              if (chunk) {
                accumulated += chunk;
                setAskMoreResponse(accumulated);
              }
            } catch (e) {
              console.error('Failed to parse stream chunk:', jsonStr, e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error in ask more:', e);
      setAskMoreResponse('Error generating response.');
    } finally {
      setIsAskMoreLoading(false);
    }
  }, [content, currentTopic, language, isAskMoreLoading]);

  // Handle save settings
  const handleSaveSettings = (settings: { accentColor: string; language: LanguageCode; generationMode: GenerationMode }) => {
    setAccentColor(settings.accentColor);
    setLanguage(settings.language);
    setGenerationMode(settings.generationMode);
    setIsSettingsOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Skip link for accessibility
  const skipToMain = () => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.setAttribute('tabindex', '-1');
      mainElement.focus();
      setTimeout(() => mainElement.removeAttribute('tabindex'), 1000);
    }
  };

  // ===== HOMEPAGE VIEW =====
  if (isHomePage) {
    return (
      <div className="app">
        {/* Skip to main content for accessibility */}
        <button 
          className="skip-link sr-only-focusable"
          onClick={skipToMain}
        >
          Skip to main content
        </button>
        
        <Header
          isHomePage={isHomePage}
          isScrolled={isScrolled}
          handleHomeClick={handleHomeClick}
          handleTopicChange={handleTopicChange}
          isLoading={isLoading}
          user={user}
          isMobile={isMobile}
          isUserButtonHovered={isUserButtonHovered}
          setIsUserButtonHovered={setIsUserButtonHovered}
          setIsAuthModalOpen={setIsAuthModalOpen}
          setIsLogoutModalOpen={setIsLogoutModalOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          handleLogout={handleLogout}
          toggleTheme={toggleTheme}
          theme={theme}
          showHubBack={showHubBack}
          t={t}
        />

        <Homepage
          handleTopicChange={handleTopicChange}
          history={history}
          handleDeleteHistoryItem={handleDeleteHistoryItem}
          t={t}
        />

        <Footer t={t} generationTime={generationTime} isMobile={isMobile} />

        {/* Modals */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          accentColor={accentColor}
          language={language}
          generationMode={generationMode}
          onSave={handleSaveSettings}
          translations={t}
        />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} langParams={t} />
        <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} onConfirm={handleLogout} translations={t} />
      </div>
    );
  }

  // ===== ARTICLE VIEW =====
  return (
    <div className="app">
      {/* Skip to main content for accessibility */}
      <button 
        className="skip-link sr-only-focusable"
        onClick={skipToMain}
      >
        Skip to main content
      </button>
      
      <Header
        isHomePage={isHomePage}
        isScrolled={isScrolled}
        handleHomeClick={handleHomeClick}
        handleTopicChange={handleTopicChange}
        isLoading={isLoading}
        user={user}
        isMobile={isMobile}
        isUserButtonHovered={isUserButtonHovered}
        setIsUserButtonHovered={setIsUserButtonHovered}
        setIsAuthModalOpen={setIsAuthModalOpen}
        setIsLogoutModalOpen={setIsLogoutModalOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        handleLogout={handleLogout}
        toggleTheme={toggleTheme}
        theme={theme}
        showHubBack={showHubBack}
        t={t}
      />

      <ArticleView
        currentTopic={currentTopic}
        content={content}
        isLoading={isLoading}
        error={error}
        imageUrl={imageUrl}
        imageError={imageError}
        generationTime={generationTime}
        isScrolled={isScrolled}
        history={history}
        handleTopicChange={handleTopicChange}
        handleDeleteHistoryItem={handleDeleteHistoryItem}
        handleRetry={handleRetry}
        handleExtendContent={handleExtendContent}
        isExtending={isExtending}
        isAskMoreOpen={isAskMoreOpen}
        setIsAskMoreOpen={setIsAskMoreOpen}
        askMoreQuery={askMoreQuery}
        setAskMoreQuery={setAskMoreQuery}
        askMoreResponse={askMoreResponse}
        handleAskMore={handleAskMore}
        isAskMoreLoading={isAskMoreLoading}
        setIsShareMenuOpen={setIsShareMenuOpen}
        t={t}
        isMobile={isMobile}
      />

      <Footer t={t} generationTime={generationTime} isMobile={isMobile} />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accentColor={accentColor}
        language={language}
        generationMode={generationMode}
        onSave={handleSaveSettings}
        translations={t}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        langParams={t}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        translations={t}
      />

      <ShareMenu
        isOpen={isShareMenuOpen}
        onClose={() => setIsShareMenuOpen(false)}
        url={window.location.href}
        title={`${currentTopic} - nextwiki`}
        theme={theme}
        langParams={t}
      />
    </div>
  );
};

export default App;
