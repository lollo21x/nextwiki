import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, Grid3X3, Eye, Brain, Sparkles, Code } from 'lucide-react';
import { ModelType, ModelInfo } from '../types/chat';
import { AVAILABLE_MODELS, getPrimaryModels, getSecondaryModels } from '../services/models';
import { AllModelsModal } from './AllModelsModal';

interface ModelSelectorProps {
  currentModel: ModelInfo;
  availableModels: ModelInfo[];
  onSelectModel: (modelId: ModelType) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModel,
  availableModels,
  onSelectModel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllModels, setShowAllModels] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleModelSelect = (modelId: ModelType) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  const handleAllModelsSelect = (modelId: ModelType) => {
    onSelectModel(modelId);
    setShowAllModels(false);
  };

  // Function to get model badge
  const getModelBadge = (model: ModelInfo) => {
    if (model.isReasoning) {
      return (
        <span className="px-2 py-0.5 bg-blue-100/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full font-medium flex items-center gap-1">
          <Brain className="w-3 h-3" />
          Reasoning
        </span>
      );
    }
    if (model.isCoder) {
      return (
        <span className="px-2 py-0.5 bg-green-100/80 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full font-medium flex items-center gap-1">
          <Code className="w-3 h-3" />
          Coding
        </span>
      );
    }
    if (model.multimodal) {
      return (
        <span className="px-2 py-0.5 bg-purple-100/80 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs rounded-full font-medium flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Vision
        </span>
      );
    }
    if (model.isBase) {
      return (
        <span className="px-3 py-0.5 bg-[#FF8C00]/20 text-[#FF8C00] text-xs rounded-full font-medium flex items-center gap-1 whitespace-nowrap">
          <Sparkles className="w-3 h-3" />
          Base
        </span>
      );
    }
    return null;
  };

  // Function to get model icon
  const getModelIcon = (model: ModelInfo, isDark: boolean) => {
    const provider = model.id.split('/')[0];
    
    switch (provider) {
      case 'openai':
        return (
          <img 
            src={isDark 
              ? "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754576137/Will%20Pro%20AI%20favicon/AI%20models/OpenAI_dark_elakxx.svg"
              : "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754576136/Will%20Pro%20AI%20favicon/AI%20models/OpenAI_light_shtmjw.svg"
            }
            alt="OpenAI"
            className="w-4 h-4"
          />
        );
      case 'z-ai':
        return (
          <img 
            src={isDark 
              ? "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577464/Will%20Pro%20AI%20favicon/AI%20models/z-ai_dark_vi5eac.svg"
              : "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577462/Will%20Pro%20AI%20favicon/AI%20models/z-ai_light_acst5m.svg"
            }
            alt="Z-AI"
            className="w-4 h-4"
          />
        );
      case 'moonshotai':
        return (
          <img 
            src={isDark 
              ? "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577484/Will%20Pro%20AI%20favicon/AI%20models/Moonshot_Logo_dark_rnsa1i.svg"
              : "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577483/Will%20Pro%20AI%20favicon/AI%20models/Moonshot_Logo_light_wnlsro.svg"
            }
            alt="Moonshot AI"
            className="w-4 h-4"
          />
        );
      case 'mistralai':
        return (
          <img 
            src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577504/Will%20Pro%20AI%20favicon/AI%20models/Mistral_AI_Logo_w7glsc.svg"
            alt="Mistral AI"
            className="w-4 h-4"
          />
        );
      case 'deepseek':
        return (
          <img 
            src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577551/Will%20Pro%20AI%20favicon/AI%20models/Deepseek_AI_Logo_nbw6vi.svg"
            alt="DeepSeek"
            className="w-4 h-4"
          />
        );
      case 'qwen':
        return (
          <img 
            src={isDark 
              ? "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577558/Will%20Pro%20AI%20favicon/AI%20models/Qwen_dark_fmyzqb.svg"
              : "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577559/Will%20Pro%20AI%20favicon/AI%20models/Qwen_light_hhq57k.svg"
            }
            alt="Qwen"
            className="w-4 h-4"
          />
        );
      case 'google':
        return (
          <img 
            src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754575955/Will%20Pro%20AI%20favicon/AI%20models/SVG_Logos_from_Svgl_ksywwg.svg"
            alt="Google"
            className="w-4 h-4"
          />
        );
      case 'meta-llama':
        return (
          <img 
            src="https.res.cloudinary.com/dk0f2y0hu/image/upload/v1754577587/Will%20Pro%20AI%20favicon/AI%20models/SVG_Logos_Library_bontp0.svg"
            alt="Meta"
            className="w-4 h-4"
          />
        );
      case 'openrouter':
        return (
          <img 
            src={isDark 
              ? "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1757164086/OpenRouter_dark_yzpbfh.svg"
              : "https://res.cloudinary.com/dk0f2y0hu/image/upload/v1757164087/OpenRouter_light_pqiaok.svg"
            }
            alt="OpenRouter"
            className="w-4 h-4"
          />
        );
      default:
        return <Zap className="w-4 h-4 text-[#FF8C00]" />;
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 
            backdrop-blur-md border border-gray-300 dark:border-gray-600 
            rounded-lg hover:bg-gray-50/80 dark:hover:bg-gray-700/80 
            transition-colors text-sm font-medium text-gray-700 dark:text-gray-300
          "
          style={{ outline: 'none', boxShadow: 'none' }}
        >
          <div className="flex items-center gap-2">
            {getModelIcon(currentModel, document.documentElement.classList.contains('dark'))}
            <span>{currentModel.name}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-transparent z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <div 
              className="
                absolute top-full left-0 mt-2 w-96 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md
                border border-gray-300 dark:border-gray-600 
                rounded-xl shadow-2xl py-2 z-[50]
              "
              style={{ backdropFilter: 'blur(20px)' }}
            >
              {/* Primary Models */}
              {getPrimaryModels().map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    hover:bg-[#FF8C00]/5 dark:hover:bg-[#FF8C00]/5
                    ${currentModel.id === model.id 
                      ? 'bg-[#FF8C00]/10 dark:bg-[#FF8C00]/10' 
                      : ''
                    }
                  `}
                  style={{ outline: 'none', boxShadow: 'none' }}
                >
                  <div className="flex-shrink-0">
                    {getModelIcon(model, document.documentElement.classList.contains('dark'))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className={`font-medium ${currentModel.id === model.id ? 'text-[#FF8C00]' : 'text-gray-900 dark:text-white'}`}>
                        {model.name}
                      </h3>
                      {getModelBadge(model)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {model.description}
                    </p>
                  </div>
                </button>
              ))}

              {/* Separator */}
              <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>

              {/* All models Button */}
              <button
                onClick={() => {
                  setShowAllModels(true);
                  setIsOpen(false);
                }}
                className="
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  hover:bg-[#FF8C00]/5 dark:hover:bg-[#FF8C00]/5
                  text-gray-700 dark:text-gray-300
                "
                style={{ outline: 'none', boxShadow: 'none' }}
              >
                <div className="flex-shrink-0">
                  <Grid3X3 className="w-4 h-4 text-[#FF8C00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    All models
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and select from all available models
                  </p>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      {/* All Models Modal */}
      {showAllModels && (
        <AllModelsModal
          currentModel={currentModel}
          onSelectModel={handleAllModelsSelect}
          onClose={() => setShowAllModels(false)}
        />
      )}
    </>
  );
};