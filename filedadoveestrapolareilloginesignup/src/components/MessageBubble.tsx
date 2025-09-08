import React, { useState } from 'react';
import { User, Clock, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types/chat';
import { MessageActions } from './MessageActions';
import { ImageActions } from './ImageActions';
import { useAuth } from '../hooks/useAuth';

// Function to format reasoning content from DeepSeek R1
const formatReasoningContent = (content: string): string => {
  // Check if content contains reasoning tags
  if (content.includes('<think>') && content.includes('</think>')) {
    // Extract thinking process and final answer
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    const finalAnswer = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
    
    if (thinkMatch && thinkMatch[1]) {
      const thinkingProcess = thinkMatch[1].trim();
      
      // Format the response with collapsible thinking section
      return `<details>
<summary><strong>🧠 Reasoning Process</strong> <em>(click to expand)</em></summary>

\
\
\
${thinkingProcess}\
\
\
</details>

---

${finalAnswer}`;
    }
  }
  
  return content;
};

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  isImageGenerator?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  onRegenerate,
  isImageGenerator = false 
}) => {
  const isUser = message.sender === 'user';
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { user } = useAuth();
  
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };
  
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    console.error('Failed to load generated image:', message.generatedImage);
  };

  // Get the original prompt from the conversation for filename
  const getImagePrompt = (): string | undefined => {
    if (message.sender === 'ai' && message.generatedImage) {
      // For AI messages with generated images, we need to find the corresponding user message
      // This is a simplified approach - in a real app you might want to store the prompt with the message
      return message.originalPrompt || undefined;
    }
    return undefined;
  };
  
  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-6`}>
      {/* Avatar */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden backdrop-blur-md
        ${isUser 
          ? 'bg-[#FF8C00]/80 text-white' 
          : 'bg-gray-100/80 dark:bg-gray-700/80'
        }
      `}>
        {isUser ? (
          user && user.photoURL ? (
            <img 
              src={user.photoURL}
              alt={user.displayName || 'User Avatar'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5" />
          )
        ) : (
          <img 
            src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754574404/Will%20Pro%20AI%20favicon/WillPro-watchOS-Default-1024x1024_2x_rbdnnq.png"
            alt="Will Pro AI"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className={`mb-3 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className="flex flex-wrap gap-2 max-w-md">
              {message.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Uploaded image ${index + 1}`}
                  className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600 max-h-48 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Generated Image - Only show image, no text */}
        {message.generatedImage && (
          <div className={`mb-3 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className="max-w-md">
              {imageLoading && (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-[#FF8C00] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Loading image...</p>
                  </div>
                </div>
              )}
              
              {imageError && (
                <div className="w-full h-64 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">Failed to load image</p>
                    <p className="text-xs text-red-500 dark:text-red-300">URL: {message.generatedImage}</p>
                    {onRegenerate && (
                      <button
                        onClick={onRegenerate}
                        className="mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition-colors"
                        style={{ outline: 'none', boxShadow: 'none' }}
                      >
                        Try Again
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <img
                src={message.generatedImage}
                alt="Generated image"
                className={`max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600 shadow-lg ${imageLoading || imageError ? 'hidden' : 'block'}`}
                style={{ maxHeight: '512px', width: 'auto' }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {/* Image Actions for generated images - only show when image is loaded */}
              {!isUser && !imageLoading && !imageError && (
                <ImageActions 
                  imageUrl={message.generatedImage}
                  onRegenerate={onRegenerate}
                  prompt={getImagePrompt()}
                />
              )}
            </div>
          </div>
        )}

        {/* Text Content - Only show if there's no generated image OR if it's a user message */}
        {message.content && (!message.generatedImage || isUser) && (
          <>
            <div className={`
              inline-block px-4 py-3 rounded-2xl backdrop-blur-md
              ${isUser
                ? 'bg-[#FF8C00]/80 text-white rounded-br-md'
                : 'bg-gray-100/80 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-bl-md'
              }
            `}>
              {isUser ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : (
                <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-900 dark:prose-p:text-white prose-strong:text-gray-900 dark:prose-strong:text-white prose-em:text-gray-700 dark:prose-em:text-gray-300 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-700 prose-pre:text-gray-900 dark:prose-pre:text-white prose-h1:text-xl prose-h1:font-bold prose-h2:text-lg prose-h2:font-bold prose-h3:text-base prose-h3:font-bold prose-h4:text-sm prose-h4:font-bold prose-h5:text-sm prose-h5:font-semibold prose-h6:text-sm prose-h6:font-semibold">
                  <ReactMarkdown>{formatReasoningContent(message.content)}</ReactMarkdown>
                </div>
              )}
            </div>
            
            {/* Message Actions - Only for text messages */}
            {!message.generatedImage && (
              <MessageActions 
                content={message.content}
                isUser={isUser}
                onRegenerate={!isUser ? onRegenerate : undefined}
              />
            )}
          </>
        )}
        
        {/* Message Status */}
        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {message.status === 'sending' && (
            <>
              <Clock className="w-3 h-3" />
              Sending...
            </>
          )}
          {message.status === 'error' && (
            <>
              <AlertCircle className="w-3 h-3 text-red-500" />
              Failed to send
            </>
          )}
          {message.status === 'sent' && (
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
    </div>
  );
};
