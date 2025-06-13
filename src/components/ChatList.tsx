
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, MessageCircle, Code, Search } from 'lucide-react';
import { ModelType } from './ModelSelector';

interface Chat {
  id: string;
  title: string;
  model_type: ModelType;
  created_at: string;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

const ChatList = ({ chats, selectedChatId, onSelectChat, onNewChat }: ChatListProps) => {
  const getModelIcon = (modelType: ModelType) => {
    switch (modelType) {
      case 'code':
        return <Code className="w-4 h-4" />;
      case 'search':
        return <Search className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-64 border-r bg-muted/30 p-4">
      <Button onClick={onNewChat} className="w-full mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4" />
        New Chat
      </Button>
      <div className="space-y-2">
        {chats.map((chat) => (
          <Card
            key={chat.id}
            className={`p-3 cursor-pointer transition-colors hover:bg-accent ${
              selectedChatId === chat.id ? 'bg-accent' : ''
            }`}
            onClick={() => onSelectChat(chat.id)}
          >
            <div className="flex items-center gap-2 mb-1">
              {getModelIcon(chat.model_type)}
              <span className="text-sm font-medium truncate">{chat.title}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(chat.created_at).toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
