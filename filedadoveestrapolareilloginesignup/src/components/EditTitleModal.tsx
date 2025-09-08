import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface EditTitleModalProps {
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}

export const EditTitleModal: React.FC<EditTitleModalProps> = ({
  currentTitle,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(currentTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit chat title
        </h3>
        
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white backdrop-blur-md placeholder-gray-500 dark:placeholder-gray-400"
            style={{ outline: 'none', boxShadow: 'none' }}
            placeholder="Enter new title..."
            maxLength={50}
          />
          
          <div className="flex gap-3 mt-4">
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#BF00FF]/80 hover:bg-[#BF00FF]/90 disabled:bg-gray-400/80 disabled:cursor-not-allowed text-white rounded-lg transition-colors backdrop-blur-md"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <Check className="w-4 h-4" />
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500/80 hover:bg-gray-600/80 text-white rounded-lg transition-colors backdrop-blur-md"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};