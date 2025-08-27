/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  topic: string;
  isLoading: boolean;
  error: string | null;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageUrl, topic, isLoading, error }) => {
  const accessibilityLabel = `Generated image for ${topic}`;

  return (
    <div className="image-container">
      {isLoading && (
        <div className="image-skeleton" role="progressbar" aria-label="Loading image..."></div>
      )}
      {!isLoading && error && !imageUrl && (
        <div className="image-error">
          <p>Could not load image.</p>
        </div>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={accessibilityLabel}
          className="image-display"
        />
      )}
    </div>
  );
};

export default ImageDisplay;