/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';

/**
 * Loading skeleton component for content loading states
 */
const LoadingSkeleton: React.FC = () => {
  return (
    <div 
      aria-label="Loading content..." 
      role="progressbar" 
      aria-busy="true"
      className="skeleton-container"
    >
      <div className="skeleton-bar" style={{ width: '100%' }} />
      <div className="skeleton-bar" style={{ width: '83.33%' }} />
      <div className="skeleton-bar" style={{ width: '100%' }} />
      <div className="skeleton-bar" style={{ width: '75%' }} />
      <div className="skeleton-bar" style={{ width: '66.66%' }} />
    </div>
  );
};

export default LoadingSkeleton;
