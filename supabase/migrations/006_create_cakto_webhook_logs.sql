-- Criar tabela para logs dos webhooks da Cakto
CREATE TABLE IF NOT EXISTS public.cakto_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT,
    customer_email TEXT,
    product_name TEXT,
    subscription_id TEXT,
    status TEXT,
    raw_payload JSONB,
    processed_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_cakto_webhook_logs_customer_email ON public.cakto_webhook_logs(customer_email);
CREATE INDEX IF NOT EXISTS idx_cakto_webhook_logs_subscription_id ON public.cakto_webhook_logs(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cakto_webhook_logs_processed_at ON public.cakto_webhook_logs(processed_at);
CREATE INDEX IF NOT EXISTS idx_cakto_webhook_logs_success ON public.cakto_webhook_logs(success);

-- Habilitar RLS (apenas admins podem ver logs)
ALTER TABLE public.cakto_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view webhook logs" ON public.cakto_webhook_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND subscription_status = 'admin'
        )
    );
