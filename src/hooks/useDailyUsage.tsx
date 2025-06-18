
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDailyUsage = (userId?: string) => {
  const [dailyUsage, setDailyUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const DAILY_LIMIT = 20;

  const checkDailyUsage = async () => {
    if (!userId) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_usage')
        .select('prompt_count')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      
      setDailyUsage(data?.prompt_count || 0);
    } catch (error) {
      console.error('Error checking daily usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async () => {
    if (!userId) return false;
    
    if (dailyUsage >= DAILY_LIMIT) {
      toast({
        title: 'Daily limit reached',
        description: `You've reached your daily limit of ${DAILY_LIMIT} messages. Try again tomorrow!`,
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase.rpc('increment_daily_usage');
      
      if (error) throw error;
      
      setDailyUsage(prev => prev + 1);
      
      // Show warning when approaching limit
      if (dailyUsage + 1 >= DAILY_LIMIT - 2) {
        toast({
          title: 'Approaching daily limit',
          description: `You have ${DAILY_LIMIT - (dailyUsage + 1)} messages left today.`,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      toast({
        title: 'Error',
        description: 'Failed to track usage. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    checkDailyUsage();
  }, [userId]);

  return {
    dailyUsage,
    dailyLimit: DAILY_LIMIT,
    remainingMessages: Math.max(0, DAILY_LIMIT - dailyUsage),
    canSendMessage: dailyUsage < DAILY_LIMIT,
    incrementUsage,
    loading,
  };
};
