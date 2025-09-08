import React, { useState } from 'react';
import { Copy, RotateCcw, Download, Check } from 'lucide-react';

interface ImageActionsProps {
  imageUrl: string;
  onRegenerate?: () => void;
  prompt?: string;
}

export const ImageActions: React.FC<ImageActionsProps> = ({
  imageUrl,
  onRegenerate,
  prompt,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy image URL:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Create filename with will-image-generator prefix and prompt
      let filename = 'will-pro-image-generator';
      if (prompt) {
        // Clean the prompt for filename (remove special characters, limit length)
        const cleanPrompt = prompt
          .trim()
          .toLowerCase()
          .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Remove multiple hyphens
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
          .substring(0, 50); // Limit length to 50 characters
        
        if (cleanPrompt) {
          filename += `-${cleanPrompt}`;
        }
      }
      filename += '.png';
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2 justify-start">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 text-gray-600 dark:text-gray-300 rounded-md transition-colors backdrop-blur-md"
        style={{ outline: 'none', boxShadow: 'none' }}
        title="Copy image URL"
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
      
      <button
        onClick={handleDownload}
        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 text-gray-600 dark:text-gray-300 rounded-md transition-colors backdrop-blur-md"
        style={{ outline: 'none', boxShadow: 'none' }}
        title="Download image"
      >
        <Download className="w-3 h-3" />
        Save
      </button>

      {onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 text-gray-600 dark:text-gray-300 rounded-md transition-colors backdrop-blur-md"
          style={{ outline: 'none', boxShadow: 'none' }}
          title="Regenerate image"
        >
          <RotateCcw className="w-3 h-3" />
          Regenerate
        </button>
      )}
    </div>
  );
};