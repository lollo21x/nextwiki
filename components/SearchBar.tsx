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
  const [isBlurred, setIsBlurred] = useState(false);
  const poolTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cycleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // If we have a query or no pool, just show default placeholder
    if (!typingWords || typingWords.length === 0 || query !== '') {
      setAnimatedPlaceholder(placeholder);
      setIsBlurred(false);
      if (poolTimeoutRef.current) clearTimeout(poolTimeoutRef.current);
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
      return;
    }

    // Start behavior after 4 seconds
    poolTimeoutRef.current = setTimeout(() => {
      if (query !== '') return;

      const changePlaceholder = () => {
        setIsBlurred(true);
        setTimeout(() => {
          const randomIndex = Math.floor(Math.random() * typingWords.length);
          setAnimatedPlaceholder(typingWords[randomIndex]);
          setIsBlurred(false);
        }, 300); // Reverted to 300ms
      };

      // Initial change
      changePlaceholder();

      // Cycle every 4 seconds (keeping the 4s timing between words)
      cycleIntervalRef.current = setInterval(changePlaceholder, 4000);
    }, 4000);

    return () => {
      if (poolTimeoutRef.current) clearTimeout(poolTimeoutRef.current);
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
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
          className={`search-input ${isBlurred ? 'placeholder-blurred' : ''}`}
          aria-label="Search for a topic"
          disabled={isLoading}
          autoComplete="off"
          style={{
            transition: 'filter 0.3s ease, opacity 0.3s ease',
            filter: isBlurred ? 'blur(4px)' : 'none',
            opacity: isBlurred ? 0.5 : 1
          }}
        />
      </form>
    </div>
  );
};

export default SearchBar;
