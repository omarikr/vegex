
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ModelSelector, { ModelType } from './ModelSelector';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  title: string;
  model_type: ModelType;
  created_at: string;
}

interface ChatInterfaceProps {
  user: any;
  onSignOut: () => void;
}

const ChatInterface = ({ user, onSignOut }: ChatInterfaceProps) => {
  const [selectedModel, setSelectedModel] = useState<ModelType>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the model_type to ensure it matches our ModelType
      const typedChats: Chat[] = (data || []).map(chat => ({
        ...chat,
        model_type: chat.model_type as ModelType
      }));
      
      setChats(typedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Type cast the role to ensure it matches our union type
      const typedMessages: Message[] = (data || []).map(message => ({
        ...message,
        role: message.role as 'user' | 'assistant'
      }));
      
      setMessages(typedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert({
          user_id: user.id,
          title: `New ${selectedModel} chat`,
          model_type: selectedModel,
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentChatId(data.id);
      setMessages([]);
      loadChats();
      
      return data.id;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat',
        variant: 'destructive',
      });
      return null;
    }
  };

  const saveMessage = async (chatId: string, role: 'user' | 'assistant', content: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          role,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const callAIFunction = async (prompt: string, model: ModelType) => {
    const functionMap = {
      code: 'ai-code-generator',
      chat: 'ai-chat',
      search: 'ai-search',
    };

    const { data, error } = await supabase.functions.invoke(functionMap[model], {
      body: { prompt },
    });

    if (error) throw error;
    return data.response;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    let chatId = currentChatId;
    if (!chatId) {
      chatId = await createNewChat();
      if (!chatId) return;
    }

    setLoading(true);

    // Add user message
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user' as const,
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Save user message to database
    await saveMessage(chatId, 'user', content);

    try {
      // Get AI response
      const aiResponse = await callAIFunction(content, selectedModel);
      
      // Add AI message
      const aiMessage = {
        id: `temp-ai-${Date.now()}`,
        role: 'assistant' as const,
        content: aiResponse,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to database
      await saveMessage(chatId, 'assistant', aiResponse);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
      
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const selectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    loadMessages(chatId);
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setSelectedModel(chat.model_type);
    }
  };

  const getModelPlaceholder = (model: ModelType) => {
    switch (model) {
      case 'code':
        return 'Ask me to generate code, create components, or help with programming...';
      case 'search':
        return 'Ask me to search for information or research topics...';
      default:
        return 'Ask me anything or start a conversation...';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={createNewChat}>
            New Chat
          </Button>
          <Button variant="ghost" size="icon" onClick={onSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Model Selector */}
      <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  {selectedModel === 'code' && 'Code Generator'}
                  {selectedModel === 'chat' && 'General Chat'}
                  {selectedModel === 'search' && 'Web Search'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {selectedModel === 'code' && 'Generate clean, modern code for your projects'}
                  {selectedModel === 'chat' && 'Have a conversation about anything'}
                  {selectedModel === 'search' && 'Search for information and get detailed answers'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.created_at}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={loading}
          placeholder={getModelPlaceholder(selectedModel)}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
