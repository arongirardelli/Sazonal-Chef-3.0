import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Limpar códigos expirados
    await supabaseClient.rpc('clean_expired_verification_codes')

    // Inserir código no banco
    const { error: insertError } = await supabaseClient
      .from('verification_codes')
      .insert({
        email,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
      })

    if (insertError) {
      console.error('Erro ao inserir código:', insertError)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Enviar email via Resend (configurar quando necessário)
    // Por enquanto, apenas log do código para desenvolvimento
    console.log(`Código de verificação para ${email}: ${code}`)

    return new Response(
      JSON.stringify({ 
        message: 'Código de verificação enviado com sucesso',
        // Em desenvolvimento, incluir o código na resposta
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { code })
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro na função send-verification-code:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
