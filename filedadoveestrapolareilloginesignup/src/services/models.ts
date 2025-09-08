import { ModelInfo, ModelType } from '../types/chat';

export const AVAILABLE_MODELS: ModelInfo[] = [
  // Primary models (shown in main selector)
  {
    id: 'openai/gpt-oss-20b:free',
    name: 'GPT-OSS',
    description: 'OpenAI GPT-OSS 20B model for general tasks',
    multimodal: false,
    isPrimary: true,
    isReasoning: true,
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1',
    description: 'Advanced reasoning model with step-by-step thinking',
    multimodal: false,
    isPrimary: true,
    isReasoning: true,
  },
  {
    id: 'google/gemma-3-27b-it:free',
    name: 'Gemma 3',
    description: 'Google Gemma 3 27B model with instruction tuning',
    multimodal: false,
    isPrimary: true,
    isBase: true,
  },
  // Secondary models (shown in expanded view)
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM-4.5 Air',
    description: 'Lightweight GLM model for fast responses',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2',
    description: 'Moonshot AI Kimi K2 model',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'moonshotai/kimi-dev-72b:free',
    name: 'Kimi Dev 72B',
    description: 'Moonshot AI Kimi Dev 72B model for development tasks',
    multimodal: false,
    isPrimary: false,
    isCoder: true,
  },
  {
    id: 'mistralai/mistral-small-3.2-24b-instruct:free',
    name: 'Mistral Small 3.2',
    description: 'Mistral Small 3.2 24B instruction-tuned model',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'mistralai/devstral-small-2505:free',
    name: 'Devstral Small',
    description: 'Mistral Devstral Small model for development tasks',
    multimodal: false,
    isPrimary: false,
    isCoder: true,
  },
  {
    id: 'qwen/qwen3-4b:free',
    name: 'Qwen3 4B',
    description: 'Qwen3 4B lightweight model',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'qwen/qwen3-8b:free',
    name: 'Qwen3 8B',
    description: 'Qwen3 8B model for general tasks',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'qwen/qwen3-14b:free',
    name: 'Qwen3 14B',
    description: 'Qwen3 14B model for various tasks',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen3 Coder',
    description: 'Qwen3 Coder model specialized for programming',
    multimodal: false,
    isPrimary: false,
    isCoder: true,
  },
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek V3',
    description: 'DeepSeek V3 model optimized for conversations',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'deepseek/deepseek-chat-v3.1:free',
    name: 'DeepSeek V3.1',
    description: 'Latest DeepSeek V3.1 model with improved performance',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    name: 'DeepSeek R1 Qwen',
    description: 'DeepSeek R1 model with Qwen3 8B integration',
    multimodal: false,
    isPrimary: false,
    isReasoning: true,
  },
  {
    id: 'meta-llama/llama-3.2-11b-vision-instruct:free',
    name: 'Llama 3.2',
    description: 'Meta Llama 3.2 11B with vision capabilities',
    multimodal: true,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'google/gemini-2.5-flash-image-preview:free',
    name: 'Gemini 2.5 Flash Image Preview',
    description: 'Google Gemini 2.5 Flash with image generation capabilities',
    multimodal: true,
    isPrimary: false,
    isImageGenerator: true,
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash Experimental',
    description: 'Google Gemini 2.0 Flash experimental model',
    multimodal: true,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'openrouter/sonoma-dusk-alpha',
    name: 'Sonoma Dusk Alpha',
    description: 'OpenRouter Sonoma Dusk Alpha experimental model',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
  {
    id: 'openrouter/sonoma-sky-alpha',
    name: 'Sonoma Sky Alpha',
    description: 'OpenRouter Sonoma Sky Alpha experimental model',
    multimodal: false,
    isPrimary: false,
    isBase: true,
  },
];

export const getPrimaryModels = (): ModelInfo[] => {
  return AVAILABLE_MODELS.filter(model => model.isPrimary);
};

export const getSecondaryModels = (): ModelInfo[] => {
  return AVAILABLE_MODELS.filter(model => !model.isPrimary);
};

export const getModelById = (id: ModelType): ModelInfo | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === id);
};

export const getDefaultModel = (): ModelType => 'openai/gpt-oss-20b:free';

// Group models by provider
export const getModelsByProvider = (): Record<string, ModelInfo[]> => {
  const grouped: Record<string, ModelInfo[]> = {};
  
  AVAILABLE_MODELS.forEach(model => {
    const provider = model.id.split('/')[0];
    if (!grouped[provider]) {
      grouped[provider] = [];
    }
    grouped[provider].push(model);
  });
  
  return grouped;
};

// Get provider display name
export const getProviderDisplayName = (provider: string): string => {
  switch (provider) {
    case 'openai':
      return 'OpenAI';
    case 'z-ai':
      return 'Z-AI';
    case 'moonshotai':
      return 'Moonshot AI';
    case 'mistralai':
      return 'Mistral AI';
    case 'qwen':
      return 'Qwen';
    case 'deepseek':
      return 'DeepSeek';
    case 'google':
      return 'Google';
    case 'meta-llama':
      return 'Meta';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
    case 'openrouter':
      return 'OpenRouter';
  }
};