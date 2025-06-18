
-- Add daily usage tracking table
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  prompt_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on daily_usage table
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own usage" ON public.daily_usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.daily_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON public.daily_usage;

-- Create policies for daily_usage
CREATE POLICY "Users can view their own usage" 
  ON public.daily_usage 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
  ON public.daily_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
  ON public.daily_usage 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Remove model_type from chats table if it exists
ALTER TABLE public.chats DROP COLUMN IF EXISTS model_type;

-- Drop existing policies for messages and recreate them
DROP POLICY IF EXISTS "Users can view messages from their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their chats" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages from their own chats" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their own chats" ON public.messages;

-- Create policies for messages (check chat ownership)
CREATE POLICY "Users can view messages from their own chats" 
  ON public.messages 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = messages.chat_id 
    AND chats.user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their own chats" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chats 
    WHERE chats.id = messages.chat_id 
    AND chats.user_id = auth.uid()
  ));

-- Function to increment daily usage
CREATE OR REPLACE FUNCTION increment_daily_usage()
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.daily_usage (user_id, date, prompt_count)
  VALUES (auth.uid(), CURRENT_DATE, 1)
  ON CONFLICT (user_id, date)
  DO UPDATE SET 
    prompt_count = daily_usage.prompt_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
