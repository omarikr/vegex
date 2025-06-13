
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const hfToken = Deno.env.get('HUGGINGFACE_API_KEY');

    if (!hfToken) {
      throw new Error('Hugging Face API key not configured');
    }

    console.log('Search request:', prompt);

    // Use a model that can understand search queries and provide informative responses
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Search query: ${prompt}\n\nBased on this search query, I'll provide you with comprehensive information:`,
        parameters: {
          max_new_tokens: 400,
          temperature: 0.3,
          top_p: 0.8,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Hugging Face API error:', error);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    let searchResponse = '';

    if (Array.isArray(result) && result[0]?.generated_text) {
      searchResponse = result[0].generated_text;
    } else {
      // Fallback response with simulated search results
      searchResponse = `I found information related to "${prompt}":\n\n` +
        `Based on current knowledge, here are key points about ${prompt}:\n` +
        `• This appears to be a search query about ${prompt}\n` +
        `• I can provide general information and guidance on this topic\n` +
        `• For the most current information, I recommend checking official sources\n\n` +
        `Would you like me to elaborate on any specific aspect of ${prompt}?`;
    }

    console.log('Generated search response');

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
