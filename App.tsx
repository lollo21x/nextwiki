/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import { streamDefinition, generateImage, GenerationMode } from './services/geminiService';
import ContentDisplay from './components/ContentDisplay';
import SearchBar from './components/SearchBar';
import LoadingSkeleton from './components/LoadingSkeleton';
import ImageDisplay from './components/ImageDisplay';
import HistoryDisplay from './components/HistoryDisplay';
import SettingsModal from './components/SettingsModal';
import LogoutModal from './components/LogoutModal';
import { AuthModal } from './components/AuthModal';
import { useAuth } from './src/hooks/useAuth';
import { translations, LanguageCode } from './utils/translations';
import { User, LogOut, Info } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './src/services/firebase';

const getTopicFromURL = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('q')?.trim() || 'wiki';
  }
  return 'wiki';
};

const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<string>(getTopicFromURL);
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
   // --- End Settings State ---

    // --- Auth State ---
    const { user, isLoading: authLoading } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isUserButtonHovered, setIsUserButtonHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    // --- End Auth State ---

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

  useEffect(() => {
    if (!currentTopic) return;

    let isCancelled = false;

    const fetchContentAndImage = async () => {
      setIsLoading(true);
      setError(null);
      setImageError(null);
      setContent('');
      setImageUrl(null);
      setGenerationTime(null);
      const startTime = performance.now();

      generateImage(currentTopic)
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

  const handleHomeClick = () => handleTopicChange('wiki');

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

  return (
    <div>
      <header className="app-header">
        <div className="logo-container" onClick={handleHomeClick} role="button" tabIndex={0}>
          <div className="logo-image"></div>
          <h1>nextwiki</h1>
        </div>
          <div className="header-controls">
             <button onClick={() => window.open('https://privacy.dootinc.dpdns.org', '_blank')} className="info-toggle" aria-label="Privacy Policy" style={{ borderRadius: '32px' }}>
               <Info size={16} />
             </button>
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
             <button onClick={toggleTheme} className="theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} style={{ borderRadius: '32px' }}>
               <ThemeIcon />
             </button>
             <button onClick={() => setIsSettingsOpen(true)} className="settings-toggle" aria-label="Open settings" style={{ borderRadius: '24px' }}>
               <div className="settings-icon-img"></div>
             </button>
          </div>
      </header>
      
      <SearchBar onSearch={handleTopicChange} isLoading={isLoading} placeholder={t.search} />
      
      <main>
        <HistoryDisplay history={history} onHistoryClick={handleTopicChange} title={t.recent} />

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
             <ContentDisplay 
               content={content} 
               isLoading={isLoading} 
               onWordClick={handleTopicChange} 
             />
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
        />

        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          translations={t}
        />

      </div>
  );
};

export default App;