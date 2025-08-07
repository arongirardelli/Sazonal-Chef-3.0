-- Função RPC: Verificar se usuário pode se autenticar
CREATE OR REPLACE FUNCTION public.can_user_authenticate(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_status TEXT;
BEGIN
    SELECT subscription_status INTO user_status
    FROM public.user_profiles
    WHERE email = user_email;
    
    -- Se não encontrou usuário, permitir (será criado no primeiro login)
    IF user_status IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Permitir apenas usuários ativos ou admin
    RETURN user_status IN ('active', 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função RPC: Criar ou atualizar perfil do usuário
CREATE OR REPLACE FUNCTION public.get_or_create_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_subscription_status TEXT DEFAULT 'inactive',
    p_plan_type TEXT DEFAULT 'none',
    p_subscription_id TEXT DEFAULT NULL,
    p_subscription_start_date TIMESTAMPTZ DEFAULT NULL,
    p_subscription_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS public.user_profiles AS $$
DECLARE
    user_profile public.user_profiles;
BEGIN
    -- Tentar inserir novo perfil
    INSERT INTO public.user_profiles (
        user_id, email, subscription_status, plan_type, 
        subscription_id, subscription_start_date, subscription_end_date
    )
    VALUES (
        p_user_id, p_email, p_subscription_status, p_plan_type,
        p_subscription_id, p_subscription_start_date, p_subscription_end_date
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        email = EXCLUDED.email,
        subscription_status = EXCLUDED.subscription_status,
        plan_type = EXCLUDED.plan_type,
        subscription_id = EXCLUDED.subscription_id,
        subscription_start_date = EXCLUDED.subscription_start_date,
        subscription_end_date = EXCLUDED.subscription_end_date,
        updated_at = now()
    RETURNING * INTO user_profile;
    
    -- Criar configurações do usuário se não existirem
    INSERT INTO public.user_settings (user_id, email)
    VALUES (p_user_id, p_email)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN user_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar receitas com filtros
CREATE OR REPLACE FUNCTION public.search_recipes(
    p_category TEXT DEFAULT NULL,
    p_diet TEXT DEFAULT NULL,
    p_difficulty TEXT DEFAULT NULL,
    p_max_time INTEGER DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS SETOF public.recipes AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM public.recipes
    WHERE 
        (p_category IS NULL OR category = p_category) AND
        (p_diet IS NULL OR diet = p_diet OR diet = 'Todos') AND
        (p_difficulty IS NULL OR difficulty = p_difficulty) AND
        (p_max_time IS NULL OR "time" <= p_max_time) AND
        (p_search_term IS NULL OR 
         title ILIKE '%' || p_search_term || '%' OR
         description ILIKE '%' || p_search_term || '%' OR
         p_search_term = ANY(tags))
    ORDER BY rating DESC NULLS LAST, created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar receitas similares
CREATE OR REPLACE FUNCTION public.get_similar_recipes(
    p_recipe_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS SETOF public.recipes AS $$
DECLARE
    recipe_category TEXT;
    recipe_diet TEXT;
BEGIN
    -- Buscar categoria e dieta da receita de referência
    SELECT category, diet INTO recipe_category, recipe_diet
    FROM public.recipes WHERE id = p_recipe_id;
    
    RETURN QUERY
    SELECT * FROM public.recipes
    WHERE 
        id != p_recipe_id AND
        (category = recipe_category OR diet = recipe_diet)
    ORDER BY 
        CASE WHEN category = recipe_category AND diet = recipe_diet THEN 1
             WHEN category = recipe_category THEN 2
             WHEN diet = recipe_diet THEN 3
             ELSE 4 END,
        rating DESC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
