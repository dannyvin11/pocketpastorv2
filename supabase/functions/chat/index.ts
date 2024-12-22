// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface ChatMessage {
  text: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

serve(async (req) => {
  console.log('🔵 Edge Function Invoked:', {
    method: req.method,
    url: req.url,
  });

  // Handle CORS
  if (req.method === 'OPTIONS') {
    console.log('🟡 Handling CORS preflight request');
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
      }
    )

    // Get the user from the auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError) {
      throw new Error('Invalid auth credentials')
    }

    console.log('🔑 Authenticated user:', { 
      id: user.id,
      email: user.email 
    });

    // Parse the request body
    const body = await req.json();
    console.log('📥 Received request body:', body);

    const { text } = body as ChatMessage;
    console.log('📝 Extracted text:', text);

    // Get OpenAI API key from environment variable
    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Call OpenAI API
    console.log('🤖 Calling OpenAI API...');
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a pastor providing biblical guidance. For each question:
1. Give a concise, practical answer in modern language
2. Ask clarifying questions if needed
3. End with relevant Bible quotes, including chapter and verse
Use only official open-source Bible translations.`
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 150,
        temperature: 0.9,
      }),
    });

    if (!openAiResponse.ok) {
      const error = await openAiResponse.json();
      console.error('❌ OpenAI API error:', error);
      throw new Error('Failed to get response from OpenAI');
    }

    const completion = await openAiResponse.json() as OpenAIResponse;
    const responseMessage = completion.choices[0].message.content;
    console.log('📤 Sending response:', responseMessage);

    // Return the response
    return new Response(
      JSON.stringify({ 
        message: responseMessage,
        user: {
          id: user.id,
          email: user.email
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      },
    )
  } catch (error) {
    console.error('❌ Error processing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: {
          name: error.name,
          stack: error.stack
        }
      }),
      {
        status: error.message.includes('auth') ? 401 : 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
