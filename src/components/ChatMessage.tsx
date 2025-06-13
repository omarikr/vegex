
import React from 'react';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3 p-4', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex gap-3 max-w-3xl', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <div className={cn(
          'rounded-lg px-4 py-2 whitespace-pre-wrap',
          isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        )}>
          <pre className="font-sans whitespace-pre-wrap break-words">{content}</pre>
          {timestamp && (
            <div className="text-xs opacity-70 mt-1">
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
