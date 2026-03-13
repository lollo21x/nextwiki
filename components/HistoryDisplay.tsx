/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { X } from 'lucide-react';

interface HistoryDisplayProps {
  history: string[];
  onHistoryClick: (topic: string) => void;
  onDeleteHistoryItem: (topic: string) => void;
  title: string;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onHistoryClick, onDeleteHistoryItem, title }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="history-container">
      <h3 className="history-title">{title}</h3>
      <div className="history-items">
        {history.map((item) => (
          <div key={item} className="history-item">
            <span
              className="history-item-text"
              onClick={() => onHistoryClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onHistoryClick(item); }}
            >
              {item}
            </span>
            <div
              className="history-item-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteHistoryItem(item);
              }}
              role="button"
              tabIndex={0}
              aria-label={`Remove ${item} from history`}
            >
              <X size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryDisplay;
