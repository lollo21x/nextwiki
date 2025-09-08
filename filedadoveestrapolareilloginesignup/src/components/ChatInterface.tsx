import React, { useRef, useEffect } from 'react';
import { Brain, Code } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Message } from '../types/chat';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string, images?: string[]) => void;
  onRegenerateMessage: (messageId: string) => void;
  isLoading?: boolean;
  conversationTitle?: string;
  multimodalEnabled?: boolean;
  isImageGenerator?: boolean;
  isReasoningModel?: boolean;
  isCoderModel?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onRegenerateMessage,
  isLoading = false,
  conversationTitle = 'New chat',
  multimodalEnabled = false,
  isImageGenerator = false,
  isReasoningModel = false,
  isCoderModel = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getEmptyStateMessage = () => {
    if (isImageGenerator) {
      return "Describe the image you want to create and I'll generate it for you!";
    }
    if (multimodalEnabled) {
      return "Ask me anything or upload an image for analysis! I'm here to help you with questions, creative tasks, analysis, and much more.";
    }
    return "Ask me anything! I'm here to help you with questions, creative tasks, analysis, and much more.";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 relative" style={{ zIndex: 1 }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 pb-24">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-[#FF8C00]/20 dark:bg-[#FF8C00]/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754574404/Will%20Pro%20AI%20favicon/WillPro-watchOS-Default-1024x1024_2x_rbdnnq.png"
                alt="Will Pro AI"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              {isImageGenerator ? 'Create amazing images' : 'Start a conversation'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {getEmptyStateMessage()}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                onRegenerate={message.sender === 'ai' ? () => onRegenerateMessage(message.id) : undefined}
                isImageGenerator={isImageGenerator}
              />
            ))}
            {isLoading && (
              <div className="flex gap-4 mb-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-md flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754574404/Will%20Pro%20AI%20favicon/WillPro-watchOS-Default-1024x1024_2x_rbdnnq.png"
                    alt="Will Pro AI"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 max-w-3xl">
                  <div className="inline-block px-4 py-3 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl rounded-bl-md">
                    {isReasoningModel ? (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Brain className="w-4 h-4 text-black dark:text-white animate-pulse" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    ) : isCoderModel ? (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <Code className="w-4 h-4 text-black dark:text-white animate-pulse" />
                        <span className="text-sm">Coding...</span>
                      </div>
                    ) : isImageGenerator ? (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <div className="w-4 h-4 border-2 border-[#FF8C00] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Generating...</span>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input - Now floating with blur */}
      <ChatInput 
        onSendMessage={onSendMessage} 
        isLoading={isLoading} 
        multimodalEnabled={multimodalEnabled}
        isImageGenerator={isImageGenerator}
      />
    </div>
  );
};