
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDailyUsage } from '@/hooks/useDailyUsage';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import LoadingAnimation from './LoadingAnimation';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Chat {
  id: string;
  title: string;
  created_at: string;
}

interface ChatInterfaceProps {
  user: any;
  onSignOut: () => void;
}

const ChatInterface = ({ user, onSignOut }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    dailyUsage, 
    dailyLimit, 
    remainingMessages, 
    canSendMessage, 
    incrementUsage 
  } = useDailyUsage(user?.id);

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
      setChats(data || []);
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
          title: 'New Chat',
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentChatId(data.id);
      setMessages([]);
      loadChats();
      setSidebarOpen(false);
      
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

  const callAIFunction = async (prompt: string) => {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: { prompt },
    });

    if (error) throw error;
    return data.response;
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !canSendMessage) return;

    // Check and increment usage
    const canProceed = await incrementUsage();
    if (!canProceed) return;

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
      const aiResponse = await callAIFunction(content);
      
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
    setSidebarOpen(false);
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        selectedChatId={currentChatId || undefined}
        onSelectChat={selectChat}
        onNewChat={createNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Vegex AI</h1>
                <p className="text-sm text-gray-600">
                  {remainingMessages} messages remaining today
                </p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div className="max-w-md">
                  <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900">
                    Welcome to Vegex AI
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Ask me anything! I'm here to help you with questions, creative tasks, 
                    problem-solving, and more.
                  </p>
                  <div className="text-sm text-gray-500">
                    You have {remainingMessages} messages remaining today
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    timestamp={message.created_at}
                  />
                ))}
                {loading && <LoadingAnimation />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={loading || !canSendMessage}
            placeholder={
              canSendMessage 
                ? "Type your message..." 
                : "Daily limit reached. Try again tomorrow!"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
