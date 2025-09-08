import React from 'react';
import { Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  conversationTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  conversationTitle,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-300 dark:border-gray-600 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100/80 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Delete chat
          </h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete the chat <strong>"{conversationTitle}"</strong>? 
          This action cannot be undone.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500/80 hover:bg-gray-600/80 text-white rounded-lg transition-colors backdrop-blur-md"
            style={{ outline: 'none', boxShadow: 'none' }}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/80 hover:bg-red-700/80 text-white rounded-lg transition-colors backdrop-blur-md"
            style={{ outline: 'none', boxShadow: 'none' }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};