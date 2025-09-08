import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Loader2, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, images?: string[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
  multimodalEnabled?: boolean;
  isImageGenerator?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false, 
  disabled = false,
  multimodalEnabled = false,
  isImageGenerator = false,
}) => {
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedImages.length > 0) && !disabled && !isLoading) {
      onSendMessage(message.trim(), selectedImages.length > 0 ? selectedImages : undefined);
      setMessage('');
      setSelectedImages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Function to compress and resize image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      img.onload = () => {
        // Calculate new dimensions (max 1024px on longest side)
        const maxSize = 1024;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG with 80% quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Create object URL for the image
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages: string[] = [];

    try {
      // Process each file
      for (const file of fileArray) {
        if (file.type.startsWith('image/')) {
          try {
            const compressedImage = await compressImage(file);
            newImages.push(compressedImage);
          } catch (error) {
            console.error('Error compressing image:', file.name, error);
          }
        }
      }

      // Update state with compressed images
      if (newImages.length > 0) {
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error processing images:', error);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const isButtonDisabled = (!message.trim() && selectedImages.length === 0) || disabled || isLoading;

  // Determine placeholder text
  const getPlaceholder = () => {
    if (isImageGenerator) {
      return "Create an image...";
    }
    if (multimodalEnabled) {
      return window.innerWidth < 768 ? "Message..." : "Type a message or upload an image...";
    }
    return window.innerWidth < 768 ? "Message..." : "Type your message...";
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 lg:left-80 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Selected Images Preview */}
        {selectedImages.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="
                    absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 
                    text-white rounded-full flex items-center justify-center 
                    opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md
                  "
                  style={{ outline: 'none', boxShadow: 'none' }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 items-end">
          {/* Image Upload Button - Solo se multimodale e NON image generator */}
          {multimodalEnabled && !isImageGenerator && (
            <button
              type="button"
              onClick={triggerFileSelect}
              disabled={disabled || isLoading}
              className={`
                flex-shrink-0 w-12 h-12 rounded-xl backdrop-blur-md
                flex items-center justify-center transition-all duration-200
                transform -translate-y-1.5
                ${disabled || isLoading
                  ? 'bg-gray-400/80 dark:bg-gray-600/80 cursor-not-allowed text-gray-500' 
                  : 'bg-gray-500/80 dark:bg-gray-600/80 hover:bg-gray-600/80 dark:hover:bg-gray-500/80 text-white'
                }
              `}
              style={{ outline: 'none', boxShadow: 'none' }}
              title="Upload images"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              disabled={disabled || isLoading}
              className="
                w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 
                bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white backdrop-blur-md
                disabled:cursor-not-allowed
                resize-none min-h-[48px] max-h-32 overflow-y-auto
                placeholder-gray-500 dark:placeholder-gray-400
                font-montserrat
              "
              style={{ 
                outline: 'none',
                boxShadow: 'none',
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                height: '48px'
              }}
              rows={1}
            />
          </div>
          
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className={`
              flex-shrink-0 w-12 h-12 rounded-xl backdrop-blur-md
              flex items-center justify-center text-white transition-all duration-200
              transform -translate-y-1.5
              ${isButtonDisabled 
                ? 'bg-gray-400/80 dark:bg-gray-600/80 cursor-not-allowed' 
                : 'bg-[#FF8C00] hover:bg-[#FF6B00]'
              }
            `}
            style={{ outline: 'none', boxShadow: 'none' }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};