
import React from 'react';
import { Bot } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="flex items-center gap-3 p-4">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <Bot className="w-4 h-4 animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-muted-foreground animate-pulse">Vegex is thinking...</span>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-muted rounded animate-pulse w-48"></div>
          <div className="h-2 bg-muted rounded animate-pulse w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
