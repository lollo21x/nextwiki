/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { User, LogOut, Info, Plus, Share2, ArrowLeft, RefreshCw, MessageCircle, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './src/services/firebase';

const getTopicFromURL = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('q')?.trim() || '';
  }
  return '';
};

const FloatingShapes: React.FC = () => (
  <div className="floating-shapes">
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

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('searchHistory');
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    if (document.referrer.includes('hub4d.lollo.dpdns.org')) {
      setShowHubBack(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent-color', accentColor);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('generationMode', generationMode);
  }, [generationMode]);

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

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

  const handleDeleteHistoryItem = useCallback((topicToRemove: string) => {
    setHistory(prevHistory => prevHistory.filter(item => item !== topicToRemove));
  }, []);

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

  const handleHomeClick = () => {
    const url = new URL(window.location.toString());
    url.searchParams.delete('q');
    window.history.pushState({}, '', url);
    setCurrentTopic('');
  };

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

  const handleRetry = useCallback(() => {
    if (!currentTopic || isLoading) return;
    // Re-trigger the content generation by forcing a re-fetch
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

  const handleSaveSettings = (settings: { accentColor: string; language: LanguageCode; generationMode: GenerationMode }) => {
    setAccentColor(settings.accentColor);
    setLanguage(settings.language);
    setGenerationMode(settings.generationMode);
    setIsSettingsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const ThemeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {theme === 'dark' ? <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z" /> : <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" />}
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z" />
    </svg>
  );

  // ===== HOMEPAGE VIEW =====
  if (isHomePage) {
    return (
      <div>
        {/* Minimal header for homepage */}
        <header className="app-header">
          <div />
          <div className="header-controls">
            <button onClick={() => window.open('https://privacy.dootinc.dpdns.org', '_blank')} className="info-toggle" aria-label="Privacy Policy" style={{ borderRadius: '32px' }}>
              <Info size={16} />
            </button>
            {showHubBack && (
              <button onClick={() => window.location.href = 'https://hub4d.lollo.dpdns.org/'} className="info-toggle" aria-label="Back to Hub" style={{ borderRadius: '32px' }}>
                <ArrowLeft size={16} />
              </button>
            )}
            {user ? (
              isMobile ? (
                <button onClick={() => setIsLogoutModalOpen(true)} className="user-toggle" aria-label="User account" style={{ borderRadius: '32px' }}>
                  <User size={16} />
                </button>
              ) : (
                <button
                  onClick={handleLogout}
                  onMouseEnter={() => setIsUserButtonHovered(true)}
                  onMouseLeave={() => setIsUserButtonHovered(false)}
                  className="user-pill"
                  aria-label="Logout"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: isUserButtonHovered ? '8px 16px' : '8px 12px',
                    borderRadius: '32px',
                    backgroundColor: isUserButtonHovered ? 'var(--accent-red)' : 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: isUserButtonHovered ? 'white' : 'var(--text-primary)',
                    fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer',
                    transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                  }}
                >
                  <User size={14} />
                  <span>{user.displayName || user.email?.split('@')[0] || 'User'}</span>
                  {isUserButtonHovered && <LogOut size={14} />}
                </button>
              )
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="user-toggle" aria-label="User account" style={{ borderRadius: '32px' }}>
                <User size={16} />
              </button>
            )}
            <button onClick={toggleTheme} className="theme-toggle header-theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} style={{ borderRadius: '32px' }}>
              <ThemeIcon />
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="settings-toggle" aria-label="Open settings" style={{ borderRadius: '24px' }}>
              <div className="settings-icon-img"></div>
            </button>
          </div>
        </header>

        {/* Homepage centered content */}
        <div className="homepage">
          <FloatingShapes />

          <div className="homepage-brand">
            <div className="homepage-logo" />
            <h1 className="homepage-title">nextwiki</h1>
          </div>


          <div className="homepage-search-container">
            <SearchBar onSearch={handleTopicChange} isLoading={false} placeholder={t.search} />
          </div>

          {history.length > 0 && (
            <div className="homepage-history">
              <HistoryDisplay history={history} onHistoryClick={handleTopicChange} onDeleteHistoryItem={handleDeleteHistoryItem} title={t.recent} />
            </div>
          )}
        </div>

        <footer className="sticky-footer">
          <p className="footer-text" style={{ margin: 0 }}>
            {t.madeBy} <a href="http://lollo.dpdns.org" target="_blank" rel="noopener noreferrer">lollo21</a>
          </p>
        </footer>

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

  // ===== ARTICLE VIEW (existing behavior) =====
  return (
    <div>
      <header className={`app-header ${!isHomePage && isScrolled ? 'sticky-scrolled' : ''}`}>
        <div className="logo-container" onClick={handleHomeClick} role="button" tabIndex={0}>
          <div className="logo-image"></div>
          <h1>nextwiki</h1>
        </div>

        {/* Compact search bar that appears when scrolled */}
        {!isHomePage && (
          <div className="header-search-compact">
            <SearchBar onSearch={handleTopicChange} isLoading={isLoading} placeholder={t.search} />
          </div>
        )}

        <div className="header-controls">
          <button onClick={() => window.open('https://privacy.dootinc.dpdns.org', '_blank')} className="info-toggle" aria-label="Privacy Policy" style={{ borderRadius: '32px' }}>
            <Info size={16} />
          </button>
          {showHubBack && (
            <button onClick={() => window.location.href = 'https://hub4d.lollo.dpdns.org/'} className="info-toggle" aria-label="Back to Hub" style={{ borderRadius: '32px' }}>
              <ArrowLeft size={16} />
            </button>
          )}
          {user ? (
            isMobile ? (
              <button onClick={() => setIsLogoutModalOpen(true)} className="user-toggle" aria-label="User account" style={{ borderRadius: '32px' }}>
                <User size={16} />
              </button>
            ) : (
              <button
                onClick={handleLogout}
                onMouseEnter={() => setIsUserButtonHovered(true)}
                onMouseLeave={() => setIsUserButtonHovered(false)}
                className="user-pill"
                aria-label="Logout"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: isUserButtonHovered ? '8px 16px' : '8px 12px',
                  borderRadius: '32px',
                  backgroundColor: isUserButtonHovered ? 'var(--accent-red)' : 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: isUserButtonHovered ? 'white' : 'var(--text-primary)',
                  fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap'
                }}
              >
                <User size={14} />
                <span className="user-name-text">{user.displayName || user.email?.split('@')[0] || 'User'}</span>
                {isUserButtonHovered && <LogOut size={14} />}
              </button>
            )
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="user-toggle" aria-label="User account" style={{ borderRadius: '32px' }}>
              <User size={16} />
            </button>
          )}
          <button onClick={toggleTheme} className="theme-toggle header-theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} style={{ borderRadius: '32px' }}>
            <ThemeIcon />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="settings-toggle" aria-label="Open settings" style={{ borderRadius: '24px' }}>
            <div className="settings-icon-img"></div>
          </button>
        </div>
      </header>

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
            <div className="error-box">
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
                    >
                      <RefreshCw size={16} />
                      {t.retry}
                    </button>
                    <button
                      onClick={handleExtendContent}
                      className="more-button"
                      disabled={isExtending}
                    >
                      <Plus size={16} />
                      {isExtending ? t.extending : t.more}
                    </button>
                    <button
                      onClick={() => {
                        if (isAskMoreOpen) {
                          setIsAskMoreOpen(false);
                          setAskMoreResponse('');
                          setAskMoreQuery('');
                        } else {
                          setIsAskMoreOpen(true);
                        }
                      }}
                      className="more-button"
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
                    >
                      <Share2 size={16} />
                      {t.share}
                    </button>
                  </div>

                  {isAskMoreOpen && (
                    <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleAskMore(askMoreQuery);
                        }}
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

      <footer className="sticky-footer">
        <p className="footer-text" style={{ margin: 0 }}>
          {t.madeBy} <a href="http://lollo.dpdns.org" target="_blank" rel="noopener noreferrer">lollo21</a>
          {!isMobile && ` · ${t.generatedBy}`}
          {generationTime && ` · ${Math.round(generationTime)}ms`}
        </p>
      </footer>

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
