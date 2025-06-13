
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

    console.log('Code generation request:', prompt);

    // Use CodeLlama for code generation
    const response = await fetch('https://api-inference.huggingface.co/models/codellama/CodeLlama-7b-Instruct-hf', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `<s>[INST] You are an expert frontend developer. Generate clean, modern, and efficient code. Focus on best practices for HTML, CSS, JavaScript, and React. Here's the request: ${prompt} [/INST]`,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.1,
          top_p: 0.95,
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
    let generatedCode = '';

    if (Array.isArray(result) && result[0]?.generated_text) {
      generatedCode = result[0].generated_text;
      // Clean up the response to remove the instruction part
      const instIndex = generatedCode.indexOf('[/INST]');
      if (instIndex !== -1) {
        generatedCode = generatedCode.substring(instIndex + 7).trim();
      }
    } else {
      generatedCode = 'Sorry, I could not generate code for your request. Please try again.';
    }

    console.log('Generated code response');

    return new Response(
      JSON.stringify({ response: generatedCode }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in code generator:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate code', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
