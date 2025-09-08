import { useState, useEffect } from 'react';
import { ModelType, ModelInfo } from '../types/chat';
import { getPrimaryModels, getDefaultModel, getModelById } from '../services/models';

const MODEL_STORAGE_KEY = 'will-pro-ai-selected-model';

export const useModel = (onModelChange?: () => void) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>(() => {
    try {
      const saved = localStorage.getItem(MODEL_STORAGE_KEY);
      if (saved && getModelById(saved as ModelType)) {
        return saved as ModelType;
      }
      return getDefaultModel();
    } catch (error) {
      console.error('Error loading Will Pro AI selected model:', error);
      return getDefaultModel();
    }
  });

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    } catch (error) {
      console.error('Error saving Will Pro AI selected model:', error);
    }
  }, [selectedModel]);

  const currentModel: ModelInfo = getModelById(selectedModel) || getModelById(getDefaultModel())!;

  const selectModel = (modelId: ModelType) => {
    if (modelId !== selectedModel) {
      setSelectedModel(modelId);
      
      // Don't trigger new chat on first load
      if (!isFirstLoad && onModelChange) {
        onModelChange();
      }
    }
    
    if (isFirstLoad) {
      setIsFirstLoad(false);
    }
  };

  return {
    selectedModel,
    currentModel,
    availableModels: getPrimaryModels(),
    selectModel,
  };
};