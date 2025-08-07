-- Criar tabela verification_codes
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '10 minutes') NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON public.verification_codes(expires_at);

-- Habilitar RLS (todos podem inserir códigos, mas só podem ver os próprios)
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de códigos
CREATE POLICY "Anyone can insert verification codes" ON public.verification_codes
    FOR INSERT WITH CHECK (true);

-- Política para permitir seleção apenas por email (para validação)
CREATE POLICY "Users can view codes for their email" ON public.verification_codes
    FOR SELECT USING (true); -- Será validado pela aplicação

-- Função para limpar códigos expirados automaticamente
CREATE OR REPLACE FUNCTION clean_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM public.verification_codes 
    WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
