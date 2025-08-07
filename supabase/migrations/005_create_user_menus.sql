-- Criar tabela user_menus
CREATE TABLE IF NOT EXISTS public.user_menus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Meu Cardápio',
    menu_data JSONB DEFAULT '{}'::jsonb, -- {dia: {refeicao: recipe_id}}
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_user_menus_user_id ON public.user_menus(user_id);
CREATE INDEX IF NOT EXISTS idx_user_menus_menu_data ON public.user_menus USING GIN(menu_data);

-- Habilitar RLS
ALTER TABLE public.user_menus ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários podem ver apenas seus próprios cardápios
CREATE POLICY "Users can view own menus" ON public.user_menus
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own menus" ON public.user_menus
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own menus" ON public.user_menus
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own menus" ON public.user_menus
    FOR DELETE USING (auth.uid() = user_id);
