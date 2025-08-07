import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cakto-signature',
}

// Função para verificar assinatura do webhook
async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const expectedSignature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expectedHex = Array.from(new Uint8Array(expectedSignature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  
  return signature === expectedHex
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-cakto-signature')
    const body = await req.text()
    const webhookSecret = Deno.env.get('CAKTO_WEBHOOK_SECRET')

    // Verificar assinatura se secret estiver configurado
    if (webhookSecret && signature) {
      const isValid = await verifyWebhookSignature(body, signature, webhookSecret)
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Assinatura inválida' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    const payload = JSON.parse(body)
    const { event, customer_email, product_name, subscription_id, status } = payload

    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Mapear status/eventos Cakto para subscription_status
    let subscriptionStatus = 'inactive'
    let planType = 'none'

    switch (status?.toLowerCase()) {
      case 'active':
      case 'paid':
        subscriptionStatus = 'active'
        break
      case 'cancelled':
        subscriptionStatus = 'cancelled'
        break
      case 'overdue':
        subscriptionStatus = 'overdue'
        break
      default:
        subscriptionStatus = 'inactive'
    }

    // Mapear produto para plan_type
    if (product_name?.toLowerCase().includes('monthly') || product_name?.toLowerCase().includes('mensal')) {
      planType = 'monthly'
    } else if (product_name?.toLowerCase().includes('yearly') || product_name?.toLowerCase().includes('anual')) {
      planType = 'yearly'
    }

    // Buscar usuário pelo email
    const { data: userData } = await supabaseClient.auth.admin.listUsers()
    const user = userData?.users.find(u => u.email === customer_email)

    let userId = user?.id

    // Se usuário não existe, criar um novo
    if (!user && subscriptionStatus === 'active') {
      const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
        email: customer_email,
        password: Math.random().toString(36).slice(-8), // Senha temporária
        email_confirm: true
      })

      if (createError) {
        console.error('Erro ao criar usuário:', createError)
      } else {
        userId = newUser.user?.id
      }
    }

    // Atualizar ou criar perfil do usuário
    if (userId) {
      const { error: profileError } = await supabaseClient.rpc('get_or_create_user_profile', {
        p_user_id: userId,
        p_email: customer_email,
        p_subscription_status: subscriptionStatus,
        p_plan_type: planType,
        p_subscription_id: subscription_id,
        p_subscription_start_date: subscriptionStatus === 'active' ? new Date().toISOString() : null,
        p_subscription_end_date: null // Calcular baseado no tipo de plano se necessário
      })

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError)
      }
    }

    // Log do webhook
    await supabaseClient
      .from('cakto_webhook_logs')
      .insert({
        event_type: event,
        customer_email,
        product_name,
        subscription_id,
        status,
        raw_payload: payload,
        success: true
      })

    return new Response(
      JSON.stringify({ 
        message: 'Webhook processado com sucesso',
        processed: true
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro na função cakto-webhook:', error)
    
    // Log do erro
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseClient
        .from('cakto_webhook_logs')
        .insert({
          raw_payload: { error: error.message },
          success: false,
          error_message: error.message
        })
    } catch (logError) {
      console.error('Erro ao fazer log do erro:', logError)
    }

    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
