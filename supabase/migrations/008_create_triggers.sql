-- Função trigger para criar perfil e configurações automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Criar perfil do usuário
    INSERT INTO public.user_profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    
    -- Criar configurações do usuário
    INSERT INTO public.user_settings (user_id, email)
    VALUES (NEW.id, NEW.email);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar após inserção de novo usuário
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at nas tabelas necessárias
CREATE OR REPLACE TRIGGER handle_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER handle_updated_at_user_settings
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER handle_updated_at_recipes
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER handle_updated_at_user_menus
    BEFORE UPDATE ON public.user_menus
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
