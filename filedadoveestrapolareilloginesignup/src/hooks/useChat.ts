import { useState, useCallback, useEffect } from 'react';
import { Message, Conversation, ModelType } from '../types/chat';
import { sendMessageToOpenRouter, OpenRouterMessage } from '../services/openrouter';
import { generateChatTitle } from '../services/titleGenerator';
import { generateImage } from '../services/imageGenerator';
import { getModelById } from '../services/models';

const STORAGE_KEY = 'will-pro-ai-conversations';
const ACTIVE_CONVERSATION_KEY = 'will-pro-ai-active-conversation';

// Storage functions
const saveConversations = (conversations: Conversation[]): void => {
  try {
    const serializedConversations = conversations.map(conv => ({
      ...conv,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      messages: conv.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedConversations));
    console.log('✅ Conversations saved to localStorage:', serializedConversations.length);
  } catch (error) {
    console.error('❌ Error saving conversations to localStorage:', error);
  }
};

const loadConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      console.log('📭 No conversations found in localStorage');
      return [];
    }
    
    const parsed = JSON.parse(stored);
    const conversations = parsed.map((conv: any) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
    
    console.log('✅ Conversations loaded from localStorage:', conversations.length);
    return conversations;
  } catch (error) {
    console.error('❌ Error loading conversations from localStorage:', error);
    return [];
  }
};

const saveActiveConversationId = (id: string | null): void => {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_CONVERSATION_KEY, id);
      console.log('✅ Active conversation ID saved:', id);
    } else {
      localStorage.removeItem(ACTIVE_CONVERSATION_KEY);
      console.log('🗑️ Active conversation ID removed');
    }
  } catch (error) {
    console.error('❌ Error saving active conversation ID:', error);
  }
};

const loadActiveConversationId = (): string | null => {
  try {
    const id = localStorage.getItem(ACTIVE_CONVERSATION_KEY);
    console.log('📖 Active conversation ID loaded:', id);
    return id;
  } catch (error) {
    console.error('❌ Error loading active conversation ID:', error);
    return null;
  }
};

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load conversations and active conversation from localStorage on mount
  useEffect(() => {
    console.log('🚀 Initializing Will Pro AI system...');
    
    const loadedConversations = loadConversations();
    const loadedActiveId = loadActiveConversationId();
    
    setConversations(loadedConversations);
    
    // Auto-select conversation logic
    if (loadedActiveId && loadedConversations.some(conv => conv.id === loadedActiveId)) {
      // If saved active conversation exists, select it
      console.log('🎯 Selecting saved active conversation:', loadedActiveId);
      setActiveConversationId(loadedActiveId);
    } else if (loadedConversations.length > 0) {
      // If no valid active conversation, select the most recent one
      const mostRecent = loadedConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      console.log('📅 Selecting most recent conversation:', mostRecent.id);
      setActiveConversationId(mostRecent.id);
      saveActiveConversationId(mostRecent.id);
    } else {
      // If no conversations exist, create a new one immediately
      const newId = Date.now().toString();
      const newConversation: Conversation = {
        id: newId,
        title: 'New chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      console.log('🆕 Creating new conversation:', newId);
      setConversations([newConversation]);
      setActiveConversationId(newId);
      saveActiveConversationId(newId);
    }
    
    setIsInitialized(true);
  }, []);

  // Save conversations to localStorage whenever they change (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    console.log('💾 Saving conversations to localStorage...');
    
    // Always save all conversations, even empty ones
    if (conversations.length > 0) {
      saveConversations(conversations);
    } else {
      // If no conversations, clear localStorage
      localStorage.removeItem(STORAGE_KEY);
      console.log('🗑️ Cleared conversations from localStorage');
    }
  }, [conversations, isInitialized]);

  // Save active conversation ID whenever it changes (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    saveActiveConversationId(activeConversationId);
  }, [activeConversationId, isInitialized]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const createNewConversation = useCallback(() => {
    console.log('🆕 Creating new conversation...');
    
    // Remove current empty conversation if it exists and has no messages
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.messages.length > 0);
      
      const newId = Date.now().toString();
      const newConversation: Conversation = {
        id: newId,
        title: 'New chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return [newConversation, ...filtered];
    });

    const newId = Date.now().toString();
    setActiveConversationId(newId);
    
    // Focus on input after creating new conversation
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }, []);

  const selectConversation = useCallback((id: string) => {
    console.log('🎯 Selecting conversation:', id);
    setActiveConversationId(id);
    
    // Focus on input after selecting conversation
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  }, []);

  const editConversationTitle = useCallback((id: string, newTitle: string) => {
    console.log('✏️ Editing conversation title:', id, newTitle);
    setConversations(prev => prev.map(conv => 
      conv.id === id
        ? { ...conv, title: newTitle, updatedAt: new Date() }
        : conv
    ));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    console.log('🗑️ Deleting conversation:', id);
    
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.id !== id);
      
      // If we're deleting the active conversation, select another one
      if (activeConversationId === id) {
        if (filtered.length > 0) {
          const mostRecent = filtered.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          setActiveConversationId(mostRecent.id);
        } else {
          // If no conversations left, create a new one
          const newId = Date.now().toString();
          const newConversation: Conversation = {
            id: newId,
            title: 'New chat',
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          setActiveConversationId(newId);
          return [newConversation];
        }
      }
      
      return filtered;
    });
  }, [activeConversationId]);

  const updateConversationTitle = useCallback(async (conversationId: string, firstUserMessage: string) => {
    try {
      console.log('🏷️ Updating conversation title for:', conversationId);
      const newTitle = await generateChatTitle(firstUserMessage);
      
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId
          ? { ...conv, title: newTitle, updatedAt: new Date() }
          : conv
      ));
    } catch (error) {
      console.error('❌ Error updating conversation title:', error);
    }
  }, []);

  const prepareMessagesForAPI = (messages: Message[], newMessage?: { content: string; images?: string[] }, selectedModel?: ModelType): OpenRouterMessage[] => {
    const modelInfo = selectedModel ? getModelById(selectedModel) : getModelById('openai/gpt-oss-20b:free');
    const conversationHistory: OpenRouterMessage[] = [];
    
    // Simple system message without custom instructions
    const systemMessage = 'You are a helpful AI assistant. Detect the user\'s preferred language within the first few messages and continue the conversation in that language without mentioning or switching to other languages, unless explicitly instructed to do so. Respond clearly and completely but without being verbose. Never start your response with line breaks, empty lines, or whitespace.';
    
    conversationHistory.push({
      role: 'system',
      content: systemMessage
    });
    
    // Add previous messages for context (last 10 messages to avoid token limits)
    const recentMessages = [...messages];
    if (newMessage) {
      const tempMessage: Message = {
        id: 'temp',
        content: newMessage.content,
        sender: 'user',
        timestamp: new Date(),
        status: 'sent',
        images: newMessage.images,
      };
      recentMessages.push(tempMessage);
    }
    
    const messagesToProcess = recentMessages.slice(-10);
    
    messagesToProcess.forEach(msg => {
      if (modelInfo?.multimodal && msg.images && msg.images.length > 0) {
        // For multimodal messages, create content array
        const content: Array<{type: 'text' | 'image_url'; text?: string; image_url?: {url: string}}> = [];
        
        // Always add text content first, even if empty
        content.push({
          type: 'text',
          text: msg.content || 'Please analyze this image.'
        });
        
        // Add images
        msg.images.forEach(imageUrl => {
          console.log('📸 Adding image to API request:', imageUrl.substring(0, 50) + '...');
          content.push({
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          });
        });
        
        conversationHistory.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: content
        });
      } else {
        // For text-only messages
        conversationHistory.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    });
    
    return conversationHistory;
  };

  const regenerateMessage = useCallback(async (messageId: string, selectedModel?: ModelType) => {
    if (!activeConversationId) return;

    const currentConversation = conversations.find(c => c.id === activeConversationId);
    if (!currentConversation) return;

    // Find the message to regenerate and get all messages before it
    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const messagesBeforeRegenerate = currentConversation.messages.slice(0, messageIndex);
    
    setIsLoading(true);

    try {
      const modelInfo = getModelById(selectedModel || 'openai/gpt-oss-20b:free');
      
      // All models use OpenRouter now
      const conversationHistory = prepareMessagesForAPI(messagesBeforeRegenerate, undefined, selectedModel);

      console.log('🔄 Regenerating with model:', selectedModel || 'openai/gpt-oss-20b:free');

      const aiResponse = await sendMessageToOpenRouter(conversationHistory, selectedModel || 'openai/gpt-oss-20b:free');

      const newAiMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...messagesBeforeRegenerate, newAiMessage],
              updatedAt: new Date(),
            }
          : conv
      ));

    } catch (error) {
      console.error('Error regenerating message:', error);
      
      // Check if it's a rate limit error (429)
      let errorContent = 'Sorry, I encountered an error while regenerating the message. Please try again.';
      if (error instanceof Error && error.message.includes('429')) {
        errorContent = 'Too many requests have been sent to the AI. Please wait a moment before trying again, or check your API usage limits.';
      } else if (error instanceof Error && error.message.includes('502')) {
        errorContent = 'The AI provider is currently experiencing issues. Please try again in a moment.';
      }
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: errorContent,
        sender: 'ai',
        timestamp: new Date(),
        status: 'error',
      };

      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...messagesBeforeRegenerate, errorMessage],
              updatedAt: new Date(),
            }
          : conv
      ));
    } finally {
      setIsLoading(false);
      
      // Focus on input after regenerating
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  }, [activeConversationId, conversations]);

  const sendMessage = useCallback(async (content: string, images?: string[], selectedModel?: ModelType) => {
    let currentActiveId = activeConversationId;
    
    // If no active conversation, this should not happen anymore since we always ensure one exists
    if (!currentActiveId) {
      console.error('❌ No active conversation found when sending message');
      return;
    }

    console.log('📤 Sending message to conversation:', currentActiveId);
    console.log('🤖 Using model:', selectedModel || 'openai/gpt-oss-20b:free');
    console.log('📸 Images attached:', images?.length || 0);

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent',
      images: images,
    };

    // Add user message
    setConversations(prev => prev.map(conv => 
      conv.id === currentActiveId
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            updatedAt: new Date(),
          }
        : conv
    ));

    // Generate title if this is the first message
    const currentConversation = conversations.find(c => c.id === currentActiveId);
    const isFirstMessage = !currentConversation || currentConversation.messages.length === 0;
    
    if (isFirstMessage) {
      // Update title in background
      updateConversationTitle(currentActiveId, content || 'Image generation');
    }

    setIsLoading(true);

    try {
      const modelInfo = getModelById(selectedModel || 'openai/gpt-oss-20b:free');
      
      // All models use OpenRouter now
      const conversationHistory = prepareMessagesForAPI(
        currentConversation?.messages || [], 
        { content, images },
        selectedModel
      );

      console.log('🔄 Sending to OpenRouter with model:', selectedModel || 'openai/gpt-oss-20b:free');
      console.log('📋 Conversation history length:', conversationHistory.length);

      // Get AI response from OpenRouter
      const aiResponse = await sendMessageToOpenRouter(conversationHistory, selectedModel || 'openai/gpt-oss-20b:free');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        status: 'sent',
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentActiveId
          ? {
              ...conv,
              messages: [...conv.messages, aiMessage],
              updatedAt: new Date(),
            }
          : conv
      ));

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Check if it's a rate limit error (429)
      let errorContent = 'Sorry, I encountered an error while processing your message. Please try again.';
      if (error instanceof Error && error.message.includes('429')) {
        errorContent = 'Too many requests have been sent to the AI. Please wait a moment before trying again, or check your API usage limits.';
      } else if (error instanceof Error && error.message.includes('502')) {
        errorContent = 'The AI provider is currently experiencing issues. Please try again in a moment.';
      }
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        sender: 'ai',
        timestamp: new Date(),
        status: 'error',
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentActiveId
          ? {
              ...conv,
              messages: [...conv.messages, errorMessage],
              updatedAt: new Date(),
            }
          : conv
      ));
    } finally {
      setIsLoading(false);
      
      // Focus on input after sending message
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  }, [activeConversationId, conversations, updateConversationTitle]);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    isLoading,
    sendMessage,
    regenerateMessage,
    createNewConversation,
    selectConversation,
    editConversationTitle,
    deleteConversation,
  };
};