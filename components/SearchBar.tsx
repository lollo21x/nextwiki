/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder: string;
  typingWords?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, placeholder, typingWords }) => {
  const [query, setQuery] = useState('');
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(placeholder);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingActiveRef = useRef(false);

  useEffect(() => {
    // Reset to default placeholder if no typing words or query is not empty
    if (!typingWords || typingWords.length === 0 || query !== '') {
      setAnimatedPlaceholder(placeholder);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      isTypingActiveRef.current = false;
      return;
    }

    let isMounted = true;
    let wordIndex = Math.floor(Math.random() * typingWords.length);
    let charIndex = 0;
    let isDeleting = false;

    const type = () => {
      if (!isMounted || !isTypingActiveRef.current || query !== '') return;
      
      const currentWord = typingWords[wordIndex];
      
      if (isDeleting) {
        setAnimatedPlaceholder(currentWord.substring(0, charIndex - 1));
        charIndex--;
      } else {
        setAnimatedPlaceholder(currentWord.substring(0, charIndex + 1));
        charIndex++;
      }

      let typingSpeed = isDeleting ? 30 : 80;

      if (!isDeleting && charIndex === currentWord.length) {
        typingSpeed = 2000; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = Math.floor(Math.random() * typingWords.length);
        typingSpeed = 500; // Pause before new word
      }

      typingTimeoutRef.current = setTimeout(type, typingSpeed);
    };

    // Wait 3 seconds before starting the animation
    const initTimeout = setTimeout(() => {
      if (isMounted && query === '') {
        isTypingActiveRef.current = true;
        type();
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [typingWords, placeholder, query]);

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim() && !isLoading) {
      onSearch(searchTerm.trim());
      setQuery('');
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <svg
          className="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={animatedPlaceholder}
          className="search-input"
          aria-label="Search for a topic"
          disabled={isLoading}
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default SearchBar;
