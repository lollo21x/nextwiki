import React from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, Brain, Sparkles, Code } from 'lucide-react';
import { ModelType, ModelInfo } from '../types/chat';
import { getModelsByProvider, getProviderDisplayName } from '../services/models';

interface AllModelsModalProps {
  currentModel: ModelInfo;
  onSelectModel: (modelId: ModelType) => void;
  onClose: () => void;
}

export const AllModelsModal: React.FC<AllModelsModalProps> = ({
  currentModel,
  onSelectModel,
  onClose,
}) => {
  const modelsByProvider = getModelsByProvider();

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
            className="w-5 h-5"
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
            className="w-5 h-5"
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
            className="w-5 h-5"
          />
        );
      case 'mistralai':
        return (
          <img 
            src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577504/Will%20Pro%20AI%20favicon/AI%20models/Mistral_AI_Logo_w7glsc.svg"
            alt="Mistral AI"
            className="w-5 h-5"
          />
        );
      case 'deepseek':
        return (
          <img 
            src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577551/Will%20Pro%20AI%20favicon/AI%20models/Deepseek_AI_Logo_nbw6vi.svg"
            alt="DeepSeek"
            className="w-5 h-5"
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
            className="w-5 h-5"
          />
        );
      case 'google':
        return (
          <img 
            src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754575955/Will%20Pro%20AI%20favicon/AI%20models/SVG_Logos_from_Svgl_ksywwg.svg"
            alt="Google"
            className="w-5 h-5"
          />
        );
      case 'meta-llama':
        return (
          <img 
            src="https://res.cloudinary.com/dk0f2y0hu/image/upload/v1754577587/Will%20Pro%20AI%20favicon/AI%20models/SVG_Logos_Library_bontp0.svg"
            alt="Meta"
            className="w-5 h-5"
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
            className="w-5 h-5"
          />
        );
      default:
        return <div className="w-5 h-5 bg-[#FF8C00] rounded-full"></div>;
    }
  };

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

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col my-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            All models
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-colors"
            style={{ outline: 'none', boxShadow: 'none' }}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Models by Provider */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-8">
            {Object.entries(modelsByProvider).map(([provider, models]) => (
              <div key={provider}>
                {/* Provider Header */}
                <div className="flex items-center gap-3 mb-4">
                  {getModelIcon(models[0], document.documentElement.classList.contains('dark'))}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getProviderDisplayName(provider)}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                </div>

                {/* Models Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => onSelectModel(model.id)}
                      className={`
                        p-4 rounded-xl border text-left transition-all duration-200
                        hover:shadow-lg hover:scale-[1.02]
                        ${currentModel.id === model.id
                          ? 'border-[#FF8C00] bg-[#FF8C00]/10 dark:bg-[#FF8C00]/10'
                          : 'border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:border-[#FF8C00]/50'
                        }
                      `}
                      style={{ outline: 'none', boxShadow: 'none' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getModelIcon(model, document.documentElement.classList.contains('dark'))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h4 className={`font-medium ${currentModel.id === model.id ? 'text-[#FF8C00]' : 'text-gray-900 dark:text-white'}`}>
                              {model.name}
                            </h4>
                            {getModelBadge(model)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {model.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.getElementById('modal-root')!);
};