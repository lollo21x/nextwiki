/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useMemo } from 'react';

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onWordClick: (word: string) => void;
  isExtending?: boolean;
}

/**
 * Parse content into words and whitespace for interactive display
 */
const parseContent = (content: string): { type: 'word' | 'space'; value: string; index: number }[] => {
  const result: { type: 'word' | 'space'; value: string; index: number }[] = [];
  
  // Split by whitespace but keep the whitespace
  const parts = content.split(/(\s+)/).filter(Boolean);
  
  parts.forEach((part, index) => {
    if (/\s/.test(part)) {
      result.push({ type: 'space', value: part, index });
    } else {
      result.push({ type: 'word', value: part, index });
    }
  });
  
  return result;
};

/**
 * Clean word for clickable action (remove punctuation)
 */
const cleanWord = (word: string): string => {
  return word.replace(/[.,!?;:()"'\u2013\u2014\u2018\u2019\u201C\u201D]/g, '');
};

/**
 * Interactive content that allows clicking on individual words
 */
const InteractiveContent: React.FC<{
  content: string;
  onWordClick: (word: string) => void;
}> = ({ content, onWordClick }) => {
  const parsed = useMemo(() => parseContent(content), [content]);

  return (
    <div className="content-display">
      <p className="content-text">
        {parsed.map((part) => {
          if (part.type === 'space') {
            return <span key={`space-${part.index}`}>{part.value}</span>;
          }
          
          const cleaned = cleanWord(part.value);
          if (cleaned) {
            return (
              <button
                key={`word-${part.index}`}
                onClick={() => onWordClick(cleaned)}
                className="interactive-word"
                aria-label={`Learn more about ${cleaned}`}
                title={`Learn more about ${cleaned}`}
              >
                {part.value}
              </button>
            );
          }
          
          return <span key={`char-${part.index}`}>{part.value}</span>;
        })}
      </p>
    </div>
  );
};

/**
 * Streaming content display with blinking cursor
 */
const StreamingContent: React.FC<{ content: string; isExtending?: boolean }> = ({ content, isExtending }) => (
  <div className="content-display">
    <p className="content-text">
      {content}
      {!isExtending && <span className="blinking-cursor">\u2588</span>}
    </p>
  </div>
);

/**
 * Main ContentDisplay component that switches between loading and interactive states
 */
const ContentDisplay: React.FC<ContentDisplayProps> = ({ 
  content, 
  isLoading, 
  onWordClick, 
  isExtending 
}) => {
  if (isLoading) {
    return <StreamingContent content={content} isExtending={isExtending} />;
  }
  
  if (content) {
    return <InteractiveContent content={content} onWordClick={onWordClick} />;
  }

  return null;
};

export default ContentDisplay;
