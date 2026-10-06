/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { X, Clock } from 'lucide-react';

interface HistoryDisplayProps {
  history: string[];
  onHistoryClick: (topic: string) => void;
  onDeleteHistoryItem: (topic: string) => void;
  title: string;
}

/**
 * History item component with delete functionality
 */
const HistoryItem: React.FC<{
  item: string;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ item, onClick, onDelete }) => (
  <div className="history-item" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
    <span
      className="history-item-text"
      onClick={onClick}
    >
      {item}
    </span>
    <button
      className="history-item-delete"
      onClick={onDelete}
      aria-label={`Remove ${item} from history`}
      tabIndex={-1}
    >
      <X size={14} />
    </button>
  </div>
);

/**
 * Main HistoryDisplay component
 */
const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ 
  history, 
  onHistoryClick, 
  onDeleteHistoryItem, 
  title 
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="history-container" aria-label="Search history">
      <h3 className="history-title">
        <Clock size={18} />
        {title}
      </h3>
      <div className="history-items" role="list">
        {history.map((item) => (
          <HistoryItem
            key={item}
            item={item}
            onClick={() => onHistoryClick(item)}
            onDelete={(e) => {
              e.stopPropagation();
              onDeleteHistoryItem(item);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HistoryDisplay;
