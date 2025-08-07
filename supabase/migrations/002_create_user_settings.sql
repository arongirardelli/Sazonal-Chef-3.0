-- Criar tabela user_settings
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT true,
    new_recipes_notifications BOOLEAN DEFAULT true,
    cooking_reminders BOOLEAN DEFAULT true,
    font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    dark_mode BOOLEAN DEFAULT false,
    recipes_viewed INTEGER DEFAULT 0,
    recipes_saved_count INTEGER DEFAULT 0,
    saved_recipes JSONB DEFAULT '[]'::jsonb,
    cooking_days INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    chef_level TEXT DEFAULT 'Iniciante',
    last_access_date DATE,
    first_access_date DATE DEFAULT CURRENT_DATE,
    last_notification_date DATE,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_email ON public.user_settings(email);

-- Habilitar RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver apenas suas próprias configurações
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
