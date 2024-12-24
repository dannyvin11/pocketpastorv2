// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OpenAI } from 'https://esm.sh/openai@4.17.4'

const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY')!,
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

serve(async (req) => {
  console.log('🔵 Edge Function Invoked:', {
    method: req.method,
    url: req.url,
  });

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🟡 Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
      }
    )

    // Get user from auth header
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      console.error('❌ Authentication error:', userError);
      throw new Error('Not authenticated')
    }

    console.log('🔑 Authenticated user:', { 
      id: user.id,
      email: user.email 
    });

    // Get request body
    const body = await req.json();
    console.log('📥 Received request body:', body);
    const { messages } = body as { messages: ChatMessage[] }
    console.log('💬 Chat history:', messages);

    // Prepare messages with system prompt
    const systemPrompt = {
      role: 'system',
      content: `You are a compassionate pastor providing guidance through this chat interface only by summarizing the bible verses and providing concise, practical, actionable guidance. Respond in a warm, conversational tone while keeping these guidelines in mind:

- Focus on providing direct guidance and support through this chat only, make sure it's not too long and can be actionable for the user
- Your response should not be long, keep it concise and no more than 3 paragraphs
- Never suggest meeting them in person
- Never imply you're part of a real church or congregation
- Speak naturally and avoid listing or itemizing responses unless asked by the user
- Focus on understanding and addressing the person's situation
- Offer practical, actionable guidance they can implement to resolve their situation
- If applicable for the problem, weave in a single or multiple Bible verses that directly relates to their situation
- Ask gentle follow-up questions when needed to better understand their situation
- Avoid continuously being apologetic and saying sorry

Remember: This is a conversation inteded to help the user, not a formal counseling session or sermon.`
    }

    const conversationMessages = [systemPrompt, ...messages];
    console.log('🤖 Starting OpenAI streaming with messages:', conversationMessages);

    // Create streaming completion
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationMessages,
      stream: true,
      max_tokens: 250,
      temperature: 0.9,
      presence_penalty: 0.5,
      frequency_penalty: 0.9,
    })

    console.log('📤 Beginning response stream');

    // Return streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          console.log('✅ Stream completed successfully');
          controller.close()
        } catch (error) {
          console.error('❌ Stream error:', error);
          controller.error(error)
        }
      }
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('❌ Error processing request:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('auth') ? 401 : 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-stream' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
