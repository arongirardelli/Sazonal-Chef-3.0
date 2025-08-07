-- Criar tabela recipes (CRÍTICO)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT, -- Ex: 'café', 'almoço', 'lanche', 'jantar', 'sobremesa'
    "time" INTEGER NOT NULL, -- Tempo de preparo em minutos
    difficulty TEXT, -- Ex: 'Fácil', 'Médio', 'Difícil'
    diet TEXT NOT NULL CONSTRAINT recipes_diet_check CHECK (diet IN ('Vegetariano', 'Vegano', 'Proteico', 'Tradicional', 'Sem Glúten', 'Sem Lactose', 'Todos')),
    servings INTEGER,
    rating NUMERIC, -- Avaliação (ex: 4.5)
    calories INTEGER, -- Calorias por porção
    image_url TEXT, -- URL da imagem da receita
    instructions TEXT[], -- Array de passos de preparo
    tips TEXT[], -- Array de dicas
    legacy_ingredients TEXT[], -- Manter para compatibilidade, não usar para lógica principal
    tags TEXT[], -- Array de tags para filtragem (diet, meal_type, etc.)
    structured_ingredients JSONB -- CRÍTICO: Array de objetos JSON para ingredientes
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_diet ON public.recipes(diet);
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON public.recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_time ON public.recipes("time");
CREATE INDEX IF NOT EXISTS idx_recipes_rating ON public.recipes(rating);
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON public.recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipes_structured_ingredients ON public.recipes USING GIN(structured_ingredients);
CREATE INDEX IF NOT EXISTS idx_recipes_title ON public.recipes USING GIN(to_tsvector('portuguese', title));

-- Habilitar RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Política RLS: todos podem ver receitas (leitura pública)
CREATE POLICY "Everyone can view recipes" ON public.recipes
    FOR SELECT USING (true);

-- Apenas administradores podem modificar receitas
CREATE POLICY "Only admins can modify recipes" ON public.recipes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND subscription_status = 'admin'
        )
    );
