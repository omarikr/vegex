
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

  const hfToken = Deno.env.get('HUGGINGFACE_API_KEY');
  if (!hfToken) {
    return new Response(
      JSON.stringify({
        error: "Configuration error",
        details: "HUGGINGFACE_API_KEY is not set. Please configure the API key in the Supabase function environment variables."
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    console.log('Chat request:', prompt);

    // Use Llama 2 for general conversation
    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `<s>[INST] You are a helpful AI assistant. Be conversational, friendly, and informative. Answer questions clearly and provide useful information. User: ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`Hugging Face API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    let chatResponse = '';

    if (Array.isArray(result) && result[0]?.generated_text) {
      chatResponse = result[0].generated_text;
      // Clean up the response to remove the instruction part
      const instIndex = chatResponse.indexOf('[/INST]');
      if (instIndex !== -1) {
        chatResponse = chatResponse.substring(instIndex + 7).trim();
      }
    } else {
      chatResponse = 'I apologize, but I could not process your request at the moment. Please try again.';
    }

    console.log('Generated chat response');

    return new Response(
      JSON.stringify({ response: chatResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat:', error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response", details: error.message || "An unexpected error occurred." }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
