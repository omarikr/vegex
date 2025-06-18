
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

    console.log('Code generation request:', prompt);

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
            content: "You are Vegex Code, an expert frontend developer and code generator. Generate clean, modern, and efficient code. Focus on best practices for HTML, CSS, JavaScript, TypeScript, and React. Provide complete, working code examples with proper formatting and comments."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Together AI API error:', error);
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();
    const generatedCode = result.choices[0]?.message?.content || 'Sorry, I could not generate code for your request. Please try again.';

    console.log('Generated code response with Together AI');

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
