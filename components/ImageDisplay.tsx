/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageDisplayProps {
  imageUrl: string | null;
  topic: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Image skeleton loader component
 */
const ImageSkeleton: React.FC = () => (
  <div 
    className="image-skeleton" 
    role="progressbar" 
    aria-label="Loading image..."
    aria-busy="true"
  />
);

/**
 * Image error display component
 */
const ImageError: React.FC<{ error: string; topic: string }> = ({ error, topic }) => (
  <div className="image-error" role="alert" aria-live="polite">
    <AlertCircle size={48} color="var(--ink-3)" />
    <div>
      <p>Could not load image for "{topic}"</p>
      <p className="text-sm text-tertiary">{error}</p>
    </div>
  </div>
);

/**
 * Main ImageDisplay component
 */
const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  imageUrl, 
  topic, 
  isLoading, 
  error 
}) => {
  const accessibilityLabel = `Generated image for ${topic}`;

  return (
    <figure className="plate">
      <div className="plate-frame">
        <div className="image-container" role="region" aria-label={accessibilityLabel}>
          {isLoading && !imageUrl && <ImageSkeleton />}
          
          {!isLoading && error && !imageUrl && (
            <ImageError error={error} topic={topic} />
          )}
          
          {imageUrl && (
            <img
              src={imageUrl}
              alt={accessibilityLabel}
              className="image-display"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          )}
          
          {!isLoading && !error && !imageUrl && (
            <div className="image-error" role="status">
              <ImageIcon size={48} color="var(--ink-3)" />
              <p>No image available</p>
            </div>
          )}
        </div>
      </div>
      <figcaption className="plate-caption">
        <span className="plate-no" aria-hidden="true">Fig. I</span>
        <span className="plate-title">{topic}</span>
      </figcaption>
    </figure>
  );
};

export default ImageDisplay;
