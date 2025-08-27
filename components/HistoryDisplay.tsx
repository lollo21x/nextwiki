/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface HistoryDisplayProps {
  history: string[];
  onHistoryClick: (topic: string) => void;
  title: string;
}

const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onHistoryClick, title }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="history-container">
      <h3 className="history-title">{title}</h3>
      <div className="history-items">
        {history.map((item) => (
          <button
            key={item}
            className="history-item"
            onClick={() => onHistoryClick(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryDisplay;
