
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
    <div className={cn('flex gap-4 p-6 hover:bg-muted/30 transition-colors duration-200', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('flex gap-4 max-w-4xl w-full', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm',
          isUser ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white'
        )}>
          {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>
        <div className={cn(
          'rounded-2xl px-6 py-4 whitespace-pre-wrap shadow-sm border',
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-200' 
            : 'bg-white border-gray-200 text-gray-800'
        )}>
          <pre className="font-sans whitespace-pre-wrap break-words leading-relaxed">{content}</pre>
          {timestamp && (
            <div className={cn("text-xs mt-3 opacity-70", isUser ? "text-blue-100" : "text-gray-500")}>
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
