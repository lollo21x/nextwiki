import React, { useState } from 'react';
import { Copy, RotateCcw, Check } from 'lucide-react';

interface MessageActionsProps {
  content: string;
  isUser: boolean;
  onRegenerate?: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  isUser,
  onRegenerate,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 text-gray-600 dark:text-gray-300 rounded-md transition-colors backdrop-blur-md"
        style={{ outline: 'none', boxShadow: 'none' }}
        title="Copy message"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            Copy
          </>
        )}
      </button>
      
      {!isUser && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 text-gray-600 dark:text-gray-300 rounded-md transition-colors backdrop-blur-md"
          style={{ outline: 'none', boxShadow: 'none' }}
          title="Regenerate response"
        >
          <RotateCcw className="w-3 h-3" />
          Regenerate
        </button>
      )}
    </div>
  );
};