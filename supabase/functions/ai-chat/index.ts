
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');

    if (!togetherApiKey) {
      throw new Error('Together AI API key not configured');
    }

    console.log('Chat request:', prompt);

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          {
            role: "system",
            content: "You are Vegex, a helpful AI assistant. Be conversational, friendly, and informative. Answer questions clearly and provide useful information."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Together AI API error:', error);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const chatResponse = result.choices[0]?.message?.content || 'I apologize, but I could not process your request at the moment. Please try again.';

    console.log('Generated chat response with Together AI');

    return new Response(
      JSON.stringify({ response: chatResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
