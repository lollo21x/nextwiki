import React, { useState } from 'react';
import { Plus, MessageCircle, X } from 'lucide-react';
import { Conversation } from '../types/chat';
import { ContextMenu } from './ContextMenu';
import { EditTitleModal } from './EditTitleModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onEditConversationTitle: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onEditConversationTitle,
  onDeleteConversation,
  isOpen,
  onToggle,
  isDark,
  onToggleTheme,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; conversationId: string; } | null>(null);
  const [editingConversation, setEditingConversation] = useState<Conversation | null>(null);
  const [deletingConversation, setDeletingConversation] = useState<Conversation | null>(null);
  const { user } = useAuth();

  const handleContextMenu = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, conversationId });
  };

  const handleEdit = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setEditingConversation(conversation);
    }
  };

  const handleDelete = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setDeletingConversation(conversation);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingConversation) {
      onDeleteConversation(deletingConversation.id);
      setDeletingConversation(null);
    }
  };

  const handleSaveTitle = (newTitle: string) => {
    if (editingConversation) {
      onEditConversationTitle(editingConversation.id, newTitle);
      setEditingConversation(null);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-30 w-80 bg-white/80 dark:bg-gray-900/80
        border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754574404/Will%20Pro%20AI%20favicon/WillPro-iOS-Default-1024x1024_2x_mg7010.png"
                alt="Will Pro Logo"
                className="w-8 h-8 rounded-lg"
              />
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Will Pro
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
              <button
                onClick={onToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-md transition-colors"
                style={{ outline: 'none', boxShadow: 'none' }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={onNewConversation}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#FF8C00] hover:bg-[#FF6B00] backdrop-blur-md text-white rounded-lg transition-colors"
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <Plus className="w-5 h-5" />
              New chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  onContextMenu={(e) => handleContextMenu(e, conversation.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left backdrop-blur-md
                    ${activeConversationId === conversation.id
                      ? 'bg-[#FF8C00]/20 dark:bg-[#FF8C00]/20 text-[#FF8C00] dark:text-[#FF8C00]'
                      : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/80 text-gray-700 dark:text-gray-300'
                    }
                  `}
                  style={{ outline: 'none', boxShadow: 'none' }}
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conversation.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conversation.messages.length} messages
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => handleEdit(contextMenu.conversationId)}
          onDelete={() => handleDelete(contextMenu.conversationId)}
          onClose={() => setContextMenu(null)}
        />
      )}

      {editingConversation && (
        <EditTitleModal
          currentTitle={editingConversation.title}
          onSave={handleSaveTitle}
          onCancel={() => setEditingConversation(null)}
        />
      )}

      {deletingConversation && (
        <ConfirmDeleteModal
          conversationTitle={deletingConversation.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingConversation(null)}
        />
      )}
    </>
  );
};