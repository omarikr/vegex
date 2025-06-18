
import React from 'react';
import { Button } from '@/components/ui/button';
import { Code, MessageCircle, Search } from 'lucide-react';

export type ModelType = 'code' | 'chat' | 'search';

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
}

const ModelSelector = ({ selectedModel, onModelChange }: ModelSelectorProps) => {
  const models = [
    {
      type: 'code' as ModelType,
      name: 'Code Generator',
      description: 'Generate and optimize code',
      icon: Code,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      type: 'chat' as ModelType,
      name: 'General Chat',
      description: 'Chat about anything',
      icon: MessageCircle,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      type: 'search' as ModelType,
      name: 'Web Search',
      description: 'Search the internet',
      icon: Search,
      gradient: 'from-purple-500 to-purple-600',
    },
  ];

  return (
    <div className="flex gap-3 p-6 border-b bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex gap-3 max-w-4xl mx-auto w-full">
        {models.map((model) => {
          const Icon = model.icon;
          const isSelected = selectedModel === model.type;
          return (
            <Button
              key={model.type}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onModelChange(model.type)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                isSelected 
                  ? `bg-gradient-to-r ${model.gradient} text-white shadow-lg border-0`
                  : 'border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="hidden sm:block text-left">
                <div className="font-medium">{model.name}</div>
                <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                  {model.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default ModelSelector;
