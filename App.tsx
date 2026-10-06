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
import { User, LogOut, Info, Plus, Share2, ArrowLeft, RefreshCw, MessageCircle, X, ChevronDown, Settings as SettingsIcon } from 'lucide-react';
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
// Floating Background Shapes Component
// ===================================================================

const FloatingShapes: React.FC = () => (
  <div className="floating-shapes" aria-hidden="true">
    <div className="floating-shape shape-1" />
    <div className="floating-shape shape-2" />
    <div className="floating-shape shape-3" />
    <div className="floating-shape shape-4" />
    <div className="floating-shape shape-5" />
    <div className="floating-shape shape-6" />
    <div className="floating-shape shape-7" />
    <div className="floating-shape shape-8" />
    <div className="floating-shape shape-9" />
  </div>
);

// ===================================================================
// Theme Toggle Icon Component
// ===================================================================

const ThemeToggleIcon: React.FC<{ theme: string }> = ({ theme }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    {theme === 'dark' ? (
      <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z" />
    ) : (
      <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" />
    )}
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z" />
  </svg>
);

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
      className="user-pill no-print"
      aria-label={t.logoutConfirm || 'Logout'}
      style={{
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        padding: isUserButtonHovered ? '8px 16px' : '8px 12px',
        borderRadius: '32px',
        backgroundColor: isUserButtonHovered ? 'var(--accent-red)' : 'var(--surface)',
        border: '1px solid var(--border)',
        color: isUserButtonHovered ? 'white' : 'var(--text-primary)',
        fontSize: '0.9rem', 
        fontWeight: '500', 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap'
      }}
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
    <header className={`app-header ${!isHomePage && isScrolled ? 'sticky-scrolled' : ''}`}>
      <div className="logo-container" onClick={handleHomeClick} role="button" tabIndex={0}>
        <div className="logo-image" />
        <h1>nextwiki</h1>
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
        
        <UserMenu
          user={user}
          isMobile={isMobile}
          isUserButtonHovered={isUserButtonHovered}
          setIsUserButtonHovered={setIsUserButtonHovered}
          setIsLogoutModalOpen={setIsLogoutModalOpen}
          handleLogout={handleLogout}
          t={t}
        />
        
        {user ? null : (
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
      <FloatingShapes />
      
      <div className="homepage-brand">
        <div className="homepage-logo" aria-label="NextWiki Logo" role="img" />
        <h1 className="homepage-title">nextwiki</h1>
      </div>

      <div className="homepage-search-container">
        <SearchBar
          onSearch={handleTopicChange}
          isLoading={false}
          placeholder={t.search}
          typingWords={t.placeholderPool}
        />
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

      <main>
        <HistoryDisplay history={history} onHistoryClick={handleTopicChange} onDeleteHistoryItem={handleDeleteHistoryItem} title={t.recent} />

        <ImageDisplay imageUrl={imageUrl} topic={currentTopic} isLoading={isLoading && !imageUrl} error={imageError} />

        <div>
          <h2 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>
            {currentTopic}
          </h2>

          {error && (
            <div className="error-box" role="alert">
              <p style={{ margin: 0 }}>An Error Occurred</p>
              <p style={{ marginTop: '0.5rem', margin: 0 }}>{error}</p>
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
                      <RefreshCw size={16} />
                      {t.retry}
                    </button>
                    <button
                      onClick={handleExtendContent}
                      className="more-button"
                      disabled={isExtending}
                      aria-label={isExtending ? t.extending : t.more}
                    >
                      <Plus size={16} />
                      {isExtending ? t.extending : t.more}
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
                      className="more-button"
                      aria-label={isAskMoreOpen ? t.close : t.askMore}
                      style={isAskMoreOpen ? {
                        backgroundColor: 'var(--text-primary)',
                        color: 'var(--bg)',
                        borderColor: 'var(--text-primary)',
                      } : {}}
                    >
                      {isAskMoreOpen ? <X size={16} /> : <MessageCircle size={16} />}
                      {isAskMoreOpen ? t.close : t.askMore}
                    </button>
                    <button
                      onClick={() => setIsShareMenuOpen(true)}
                      className="share-button"
                      aria-label={t.share}
                    >
                      <Share2 size={16} />
                      {t.share}
                    </button>
                  </div>

                  {isAskMoreOpen && (
                    <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                      <form
                        onSubmit={handleSubmit}
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          alignItems: 'center',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '32px',
                        }}
                      >
                        <MessageCircle size={18} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                        <input
                          type="text"
                          value={askMoreQuery}
                          onChange={(e) => setAskMoreQuery(e.target.value)}
                          placeholder={t.askMorePlaceholder}
                          disabled={isAskMoreLoading}
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            fontSize: '1rem',
                            color: 'inherit',
                            border: 'none',
                            backgroundColor: 'transparent',
                            outline: 'none',
                          }}
                          autoFocus
                          aria-label={t.askMorePlaceholder}
                        />
                      </form>
                      {(askMoreResponse || isAskMoreLoading) && (
                        <div style={{
                          marginTop: '0.75rem',
                          padding: '1rem',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '32px',
                          fontSize: '1rem',
                          lineHeight: '1.6',
                          animation: 'fadeIn 0.3s ease',
                        }}>
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
            <div style={{ color: 'var(--text-secondary)', padding: '2rem 0' }}>
              <p>Content could not be generated.</p>
            </div>
          )}
        </div>
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
    <footer className="sticky-footer no-print">
      <p className="footer-text" style={{ margin: 0 }}>
        {t.madeBy} <a href="http://lollo.dpdns.org" target="_blank" rel="noopener noreferrer">lollo21</a>
        {!isMobile && ` \u00b7 ${t.generatedBy}`}
        {generationTime && ` \u00b7 ${Math.round(generationTime)}ms`}
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
