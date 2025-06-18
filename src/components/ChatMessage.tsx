
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
    <div className={cn('flex gap-4 p-6 hover:bg-gray-50 transition-colors', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex gap-4 max-w-3xl w-full', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>
        <div className={cn(
          'rounded-lg px-4 py-3 whitespace-pre-wrap',
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-white border border-gray-200 text-gray-900'
        )}>
          <div className="font-normal leading-relaxed">{content}</div>
          {timestamp && (
            <div className={cn("text-xs mt-2 opacity-70", isUser ? "text-blue-100" : "text-gray-500")}>
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
