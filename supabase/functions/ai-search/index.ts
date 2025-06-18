
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

    console.log('Search request:', prompt);

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
            content: "You are Vegex Search, an intelligent search assistant. Provide comprehensive, well-researched information on any topic. Structure your responses with clear sections, key points, and relevant details. Focus on accuracy and depth of information."
          },
          {
            role: "user",
            content: `Search for information about: ${prompt}`
          }
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Together AI API error:', error);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const searchResponse = result.choices[0]?.message?.content || `I found information related to "${prompt}" but encountered an issue. Please try again.`;

    console.log('Generated search response with Together AI');

    return new Response(
      JSON.stringify({ response: searchResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to perform search', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
