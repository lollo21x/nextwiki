/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import { streamDefinition, generateImage } from './services/geminiService';
import ContentDisplay from './components/ContentDisplay';
import SearchBar from './components/SearchBar';
import LoadingSkeleton from './components/LoadingSkeleton';
import ImageDisplay from './components/ImageDisplay';

const App: React.FC = () => {
  const [currentTopic, setCurrentTopic] = useState<string>('wiki');
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

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
        .then(url => {
          if (!isCancelled) setImageUrl(url);
        })
        .catch(err => {
          if (!isCancelled) {
            const msg = err instanceof Error ? err.message : 'Failed to generate image.';
            console.error(msg);
            setImageError(msg);
          }
        });

      let accumulatedContent = '';
      try {
        for await (const chunk of streamDefinition(currentTopic)) {
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
  }, [currentTopic]);

  const handleTopicChange = useCallback((topic: string) => {
    const newTopic = topic.trim();
    if (newTopic && newTopic.toLowerCase() !== currentTopic.toLowerCase()) {
      setCurrentTopic(newTopic);
    }
  }, [currentTopic]);

  const handleHomeClick = () => handleTopicChange('wiki');

  const ThemeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      {theme === 'dark' ? (
        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8V16Z" />
      ) : (
        <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" />
      )}
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
        <button onClick={toggleTheme} className="theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          <ThemeIcon />
        </button>
      </header>
      
      <SearchBar onSearch={handleTopicChange} isLoading={isLoading} />
      
      <main>
        <ImageDisplay imageUrl={imageUrl} topic={currentTopic} isLoading={isLoading && !imageUrl} error={imageError} />

        <div>
          <h2 style={{ marginBottom: '1rem', textTransform: 'capitalize' }}>
            {currentTopic}
          </h2>

          {error && (
            <div style={{ border: '1px solid #cc0000', padding: '1rem', color: '#cc0000', borderRadius: '8px' }}>
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
          Made by <a href="http://lollo.dpdns.org" target="_blank" rel="noopener noreferrer">lollo21</a> · Content by OpenRouter
          {generationTime && ` · ${Math.round(generationTime)}ms`}
        </p>
      </footer>
    </div>
  );
};

export default App;