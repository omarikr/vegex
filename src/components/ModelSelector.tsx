
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
    },
    {
      type: 'chat' as ModelType,
      name: 'General Chat',
      description: 'Chat about anything',
      icon: MessageCircle,
    },
    {
      type: 'search' as ModelType,
      name: 'Web Search',
      description: 'Search the internet',
      icon: Search,
    },
  ];

  return (
    <div className="flex gap-2 p-4 border-b">
      {models.map((model) => {
        const Icon = model.icon;
        return (
          <Button
            key={model.type}
            variant={selectedModel === model.type ? 'default' : 'outline'}
            onClick={() => onModelChange(model.type)}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{model.name}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default ModelSelector;
